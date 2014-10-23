/**
 * @jsx React.DOM
 */

var React = require('react');
var fields = require('../../../lib/fields');
var Autocomplete = require('./autocomplete');

module.exports = React.createClass({
    getInitialState: function(){
        return {filters: ['Kingdom']};
    },
    addFilter: function(event){
        var cur = this.state.filters;
        cur.unshift(event.currentTarget.value);
        this.setState({filters: cur});
    },
    removeFilter: function(event){
        var cur = this.state.filters, filters=this.filters();
        cur.splice(cur.indexOf(event.currentTarget.attributes['data-remove'].value),1);
        this.setState({filters: cur});
    },
    filters: function(){
        var list = [];
        _.each(this.state.filters,function(item){
            list.push(item.name);
        });
        return list;
    },
    makeFilter: function(filter){
        //var type = fltrObj.type, name = fltrObj.name;
        var type = 'text';
        switch(type){
            case 'text':
                return(
                    <TextFilter name={filter}/>
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

var TextFilter = React.createClass({
    getInitialState: function(){
        return {filter: {text:{content:'',disabled: false}, exists: false, missing: false}};
    },
    presenceClick: function(event){
        //var ind = this.filters().indexOf(event.currentTarget.name);
        var filter = this.state.filter;
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
        //filters[ind]=filter;
        this.setState({filter: filter});

    },
    textType: function(event){
        //var ind = this.filters().indexOf(event.currentTarget.name);
        var text = event.currentTarget.value;
        var filter = this.state.filter;//, filter=filters[ind];   
        filter.text.content = text;
        //filters[ind]=filter;
     
        this.setState({filter: filter});     
    },
    setAutocomplete: function(event){
        $(event.currentTarget).autocomplete({
            source: function(searchString, respCallback) {
                var name = this.element[0].name;//$(event.currentTarget).attr('data-name');
                var split = searchString.term.split('\n'),
                last = split[split.length-1],
                field = fields.byName[name].term,
                query = {"aggs":{},"from":0,"size":0};
                query.aggs["static_"+field]={"terms":{"field":field,"include":"^"+last+".*","exclude":"^.{1,2}$","size":15}};
        
                searchServer.esQuery('records', query, function(resp) {
                    var list = [];
                    $.each(resp.aggregations['static_' + field]['buckets'], function(index, obj) {
                        list.push(obj.key);
                    });
                    respCallback(list);
                });
            },
            focus: function (event,ui){
                //adaption for textarea input with "or" query
                var input = $(self).val().split('\n');
                if(input.length > 1){
                    input.pop();//remove partial line
                    ui.item.value = input.join('\n') + '\n' + ui.item.value;
                }    
            },
            messages: {
                noResults: '',
                results: function() {}
            }
        });
    },
    render: function(){
        var filter = this.state.filter;
        var name = this.props.name,
        exists = filter.exists ? 'checked' : '',
        missing = filter.missing ? 'checked' : '';
    
        return(
            <div className="option-group filter" id={name+'-filter'} key={name}>
                <i className="glyphicon glyphicon-remove" onClick={this.removeFilter} data-remove={name}></i>
                <label className="filter-name">{name}</label>
                <div className="text">
                    <textarea className="form-control" name={name} data-name={name}
                        placeholder={fields.byName[name].dataterm} 
                        disabled={filter.text.disabled} 
                        onChange={this.textType} 
                        onFocus={this.setAutocomplete}
                        value={filter.text.content}
                    >
                    </textarea>
                </div>
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
        )
    }
})