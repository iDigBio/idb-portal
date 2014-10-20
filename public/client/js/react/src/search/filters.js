/**
 * @jsx React.DOM
 */

var React = require('react');
var fields = require('../../../lib/fields');

module.exports = React.createClass({
    getInitialState: function(){
        return {filters: [], filterType: 'text'};
    },
    addFilter: function(event){
        var cur = this.state.filters;
        cur.unshift({name: event.currentTarget.value, type: this.state.filterType});
        this.setState({filters: cur});
    },
    removeFilter: function(event){
        var cur = this.state.filters;
        cur.splice(cur.indexOf(event.currentTarget.attributes['data-remove'].value),1);
        this.setState({filters: cur});
    },
    changeFilterType: function(event){
        this.setState({filterType: event.currentTarget.value});
    },
    makeFilter: function(fltrObj){
        var type = fltrObj.type, name = fltrObj.name;
        switch(type){
            case 'text':
                return(
                    <div className="option-group filter">
                        <i className="glyphicon glyphicon-remove" onClick={this.removeFilter} data-remove={name}></i>
                        <label className="filter-name">{name}</label>
                        <textarea className="form-control" placeholder={fields.byName[name].dataterm}>
                        </textarea>
                    </div>
                );
            case 'presence':
                return(
                    <div className="option-group filter">
                        <i className="glyphicon glyphicon-remove" onClick={this.removeFilter} data-remove={name}></i>
                        <label className="filter-name">{name}</label>
                        
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" />
                                    Present
                                </label>
                            </div>
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" />
                                    Missing
                                </label>
                            </div>
                        
                    </div>
                );       
        }
    },
    filters: function(){
        var list = [];
        _.each(this.state.filters,function(item){
            list.push(item.name);
        });
        return list;
    },
    render: function(){
        var self=this;
        var ft = self.state.filterType;
        var fgroups =[<option value="0" key="0">select to add {ft} filter</option>];
        var groups = ['taxonomy','specimen','collectionevent','locality'];
        var filterlist = this.filters();
        _.each(groups,function(val){
            var flist = [];
            _.each(fields.byGroup[val],function(field){
                if(field.hidden===1){
                    //noop
                }else{
                    var disabled = filterlist.indexOf(field.name) === -1 ? '' : 'disabled';
                    flist.push(
                            <option disabled={disabled} value={field.name} key={field.name}>
                                {field.name}
                            </option>
                    );
                    /*flist.push(
                            <option disabled={disabled} value={field.name}>
                                {field.name} <span>present/missing</span>
                            </option>
                    );*/
                }
            });
            fgroups.push(
              <optgroup label={fields.groupNames[val]}>
                &nbsp;&nbsp;{flist}
              </optgroup>
            );
        });
        var filters = [];
        _.each(this.state.filters,function(item){
            filters.push(
                self.makeFilter(item)
            )
        })
        return (
            <div>
                <div className="option-group" id="filter-select">

                    <div className="clearfix" id="filter-type">
                    <img src="/portal/img/type.svg"/>
                       <div className="filter-type">
                            <label >
                                <input onChange={this.changeFilterType} type="radio" name="filter-type" value="text"/>
                                Text Filter
                            </label>
                        </div>
                        <div className="filter-type">
                            <label>
                                <input onChange={this.changeFilterType} type="radio" name="filter-type" value="presence"/>
                                Presence Filter
                            </label>
                       </div>
                    </div>
                    <div id="filter-selects" className="clearfix">
                        <select className="form-control" value="0" placeholder="select to add" onChange={this.addFilter}>
                            {fgroups}
                        </select>
                    </div>
                </div>
                <div id="filters-holder">
                    {filters}
                </div>
            </div>
        );
    }
})