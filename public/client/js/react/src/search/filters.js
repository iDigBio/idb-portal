/**
 * @jsx React.DOM
 */

var React = require('react');
var fields = require('../../../lib/fields');


module.exports = React.createClass({
    getInitialState: function(){
        return {filters: [], filtertype: 'text'};
    },
    addFilter: function(event){
        var cur = this.state.filters;
        cur.unshift(event.currentTarget.value);
        this.setState({filters: cur});
    },
    removeFilter: function(event){
        var cur = this.state.filters;
        cur.splice(cur.indexOf(event.currentTarget.attributes['data-remove'].value),1);
        this.setState({filters: cur});
    },
    changeFilterType: function(event){
        this.setState({filtertype: event.currentTarget.value});
    },
    presenceCheck: function(event){
        
    },
    makeFilter: function(name){
        //var type = fltrObj.type, name = fltrObj.name;
        var type = 'text';
        switch(type){
            case 'text':
                return(
                    <div className="option-group filter" id={name+'-filter'}>
                        <i className="glyphicon glyphicon-remove" onClick={this.removeFilter} data-remove={name}></i>
                        <label className="filter-name">{name}</label>
                        <textarea className="form-control" name={name} placeholder={fields.byName[name].dataterm}>
                        </textarea>
                        <div className="presence">
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name={name} value="exists" onClick={this.presenceCheck}/>
                                    Present
                                </label>
                            </div>
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name={name} value="missing" onClick={this.presenceCheck}/>
                                    Missing
                                </label>
                            </div>
                        </div>
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
       
        var fgroups =[];
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
                    <select className="form-control" value="0" placeholder="select to add" onChange={this.addFilter}>
                        <option value="0" defaultValue>Add a field filter</option>
                        {fgroups}
                    </select>
                </div>
                <div id="filters-holder">
                    {filters}
                </div>
            </div>
        );
    }
})

var old = (
                    <div className="clearfix" id="filter-type">
                       <img src="/portal/img/type.svg"/>
                        <div className="filter-type">
                            <label >
                                <input onChange={this.changeFilterType} type="radio" name="filter-type" value="text" selected/>
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

    )
var SelectOption = React.createClass({
    render: function(){

        return(
            <option value="0" defaultValue dangerouslySetInnerHTML={{__html: 'Add a ' + this.props.text + ' filter' }}></option>
        )
    }
})