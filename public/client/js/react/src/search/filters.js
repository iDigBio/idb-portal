/**
 * @jsx React.DOM
 */

var React = require('react');
var fields = require('../../../lib/fields');


module.exports = React.createClass({
    getInitialState: function(){
        return {filters: [{name: 'Kingdom', text:{content:'test',disabled: false}, exists: false, missing: false}]};
    },
    addFilter: function(event){
        var cur = this.state.filters;
        var filter = {name: event.currentTarget.value, text:{content:'',disabled:false},exists:false,missing:false};
        cur.unshift(filter);
        this.setState({filters: cur});
    },
    removeFilter: function(event){
        var cur = this.state.filters, filters=this.filters();
        cur.splice(filters.indexOf(event.currentTarget.attributes['data-remove'].value),1);
        this.setState({filters: cur});
    },
    filters: function(){
        var list = [];
        _.each(this.state.filters,function(item){
            list.push(item.name);
        });
        return list;
    },
    textType: function(event){
        var ind = this.filters().indexOf(event.currentTarget.name);
        var filters = this.state.filters, filter=filters[ind];   
        filter.text.content=event.currentTarget.text;
        filters[ind]=filter;
        this.setState({filters: filters});     
    },
    presenceClick: function(event){
        var ind = this.filters().indexOf(event.currentTarget.name);
        var filters = this.state.filters, filter=filters[ind];
        if(event.currentTarget.checked){
            if(event.currentTarget.value=='exists'){
                filter.exists = true;
                filter.missing = false;                
            }else if(event.currentTarget.value=='missing'){
                filter.exists = false;
                filter.missing = true;
            }
            filter.text.disabled=true;
        }else{
            filter.exists = false;
            filter.missing = false;
            filter.text.disabled = false;
        }
        filters[ind]=filter;
        this.setState({filters: filters});

    },
    makeFilter: function(filter){
        //var type = fltrObj.type, name = fltrObj.name;
        var type = 'text', name = filter.name, tcontent=filter.text.content,
        tdisabled=filter.text.disabled? 'disabled':'', exists=(filter.exists ? 'checked':''), missing=(filter.missing ? 'checked':'');
        switch(type){
            case 'text':
                return(
                    <div className="option-group filter" id={name+'-filter'} key={name}>
                        <i className="glyphicon glyphicon-remove" onClick={this.removeFilter} data-remove={name}></i>
                        <label className="filter-name">{name}</label>
                        <textarea className="form-control" name={name} placeholder={fields.byName[name].dataterm} disabled={tdisabled} onChange={this.textType} value={tcontent}>
                        </textarea>
                        <div className="presence">
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name={name} value="exists" onChange={this.presenceClick} checked={exists}/>
                                    Present
                                </label>
                            </div>
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name={name} value="missing" onChange={this.presenceClick} checked={missing}/>
                                    Missing
                                </label>
                            </div>
                        </div>
                    </div>
                );     
        }
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
});