/**
 * @jsx React.DOM
 */

var React = require('react');
var fields = require('../../../lib/fields');

module.exports = React.createClass({
    getInitialState: function(){
        return {filters: []};
    },
    addFilter: function(event){
        var cur = this.state.filters;
        cur.push(event.currentTarget.value);
        this.setState({filters: cur});
    },
    removeFilter: function(event){
        var cur = this.state.filters;
        cur.splice(cur.indexOf(event.currentTarget.attributes['data-remove'].value),1);
        this.setState({filters: cur});
    },
    render: function(){
        var fgroups =[], self=this;
        var groups = ['taxonomy','specimen','collectionevent','locality'];
        _.each(groups,function(val){
            var flist = [];
            _.each(fields.byGroup[val],function(field){
                if(field.hidden===1){
                    //noop
                }else{
                    var disabled = self.state.filters.indexOf(field.name) === -1 ? '' : 'disabled';
                    var name = field.name;
                    flist.push(
                            <option disabled={disabled} value={field.name}>
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
                <div className="option-group filter">
                    <i className="glyphicon glyphicon-remove" onClick={self.removeFilter} data-remove={item}></i>
                    <label className="filter-name">{item}</label>
                    <textarea className="form-control" placeholder={fields.byName[item].dataterm}>
                    </textarea>

                </div>
            )
        })
        return (
            <div>
                <div className="option-group" id="filter-select">
                    <label>Add a Filter</label>
                    <select className="form-control" value="0" placeholder="select to add" onChange={this.addFilter}>
                        <option value="0">select to add</option>
                        {fgroups}
                    </select>
                </div>
                <div id="filters-holder">
                    {filters}
                </div>
            </div>
        )
    }
})