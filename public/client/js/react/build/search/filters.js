/**
 * @jsx React.DOM
 */

var React = require('react');
var fields = require('../../../lib/fields');


module.exports = React.createClass({displayName: 'exports',
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
                    React.DOM.div({className: "option-group filter", id: name+'-filter', key: name}, 
                        React.DOM.i({className: "glyphicon glyphicon-remove", onClick: this.removeFilter, 'data-remove': name}), 
                        React.DOM.label({className: "filter-name"}, name), 
                        React.DOM.textarea({className: "form-control", name: name, placeholder: fields.byName[name].dataterm, disabled: tdisabled, onChange: this.textType, value: tcontent}
                        ), 
                        React.DOM.div({className: "presence"}, 
                            React.DOM.div({className: "checkbox"}, 
                                React.DOM.label(null, 
                                    React.DOM.input({type: "checkbox", name: name, value: "exists", onChange: this.presenceClick, checked: exists}), 
                                    "Present"
                                )
                            ), 
                            React.DOM.div({className: "checkbox"}, 
                                React.DOM.label(null, 
                                    React.DOM.input({type: "checkbox", name: name, value: "missing", onChange: this.presenceClick, checked: missing}), 
                                    "Missing"
                                )
                            )
                        )
                    )
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
                            React.DOM.option({disabled: disabled, value: field.name, key: field.name}, 
                                field.name
                            )
                    );
                }
            });
            fgroups.push(
              React.DOM.optgroup({label: fields.groupNames[val]}, 
                "  ", flist
              )
            );
        });
        var filters = [];
        _.each(this.state.filters,function(item){
            filters.push(
                self.makeFilter(item)
            )
        })
        return (
            React.DOM.div(null, 
                React.DOM.div({className: "option-group", id: "filter-select"}, 
                    React.DOM.select({className: "form-control", value: "0", placeholder: "select to add", onChange: this.addFilter}, 
                        React.DOM.option({value: "0", defaultValue: true}, "Add a field filter"), 
                        fgroups
                    )
                ), 
                React.DOM.div({id: "filters-holder"}, 
                    filters
                )
            )
        );
    }
});