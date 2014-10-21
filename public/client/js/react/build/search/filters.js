/**
 * @jsx React.DOM
 */

var React = require('react');
var fields = require('../../../lib/fields');


module.exports = React.createClass({displayName: 'exports',
    getInitialState: function(){
        return {filters: [], filtertype: 'text'};
    },
    addFilter: function(event){
        var cur = this.state.filters;
        cur.unshift({name: event.currentTarget.value, type: this.state.filtertype});
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
    makeFilter: function(fltrObj){
        var type = fltrObj.type, name = fltrObj.name;
        switch(type){
            case 'text':
                return(
                    React.DOM.div({className: "option-group filter"}, 
                        React.DOM.i({className: "glyphicon glyphicon-remove", onClick: this.removeFilter, 'data-remove': name}), 
                        React.DOM.label({className: "filter-name"}, name), 
                        React.DOM.textarea({className: "form-control", placeholder: fields.byName[name].dataterm}
                        )
                    )
                );
            case 'presence':
                return(
                    React.DOM.div({className: "option-group filter"}, 
                        React.DOM.i({className: "glyphicon glyphicon-remove", onClick: this.removeFilter, 'data-remove': name}), 
                        React.DOM.label({className: "filter-name"}, name), 
                        
                            React.DOM.div({className: "checkbox"}, 
                                React.DOM.label(null, 
                                    React.DOM.input({type: "checkbox"}), 
                                    "Present"
                                )
                            ), 
                            React.DOM.div({className: "checkbox"}, 
                                React.DOM.label(null, 
                                    React.DOM.input({type: "checkbox"}), 
                                    "Missing"
                                )
                            )
                        
                    )
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
                            React.DOM.option({disabled: disabled, value: field.name, key: field.name}, 
                                field.name
                            )
                    );
                    /*flist.push(
                            <option disabled={disabled} value={field.name}>
                                {field.name} <span>present/missing</span>
                            </option>
                    );*/
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

                    React.DOM.div({className: "clearfix", id: "filter-type"}, 
                    React.DOM.img({src: "/portal/img/type.svg"}), 
                       React.DOM.div({className: "filter-type"}, 
                            React.DOM.label(null, 
                                React.DOM.input({onChange: this.changeFilterType, type: "radio", name: "filter-type", value: "text"}), 
                                "Text Filter"
                            )
                        ), 
                        React.DOM.div({className: "filter-type"}, 
                            React.DOM.label(null, 
                                React.DOM.input({onChange: this.changeFilterType, type: "radio", name: "filter-type", value: "presence"}), 
                                "Presence Filter"
                            )
                       )
                    ), 
                    React.DOM.div({id: "filter-selects", className: "clearfix"}, 
                        React.DOM.select({className: "form-control", value: "0", placeholder: "select to add", onChange: this.addFilter}, 
                            SelectOption({text: this.state.filtertype}), 
                            fgroups
                        )
                    )
                ), 
                React.DOM.div({id: "filters-holder"}, 
                    filters
                )
            )
        );
    }
})

var SelectOption = React.createClass({displayName: 'SelectOption',
    render: function(){
        return(
            React.DOM.option({value: "0", defaultValue: true, dangerouslySetInnerHTML: {__html: 'Add a ' + this.props.text + ' filter'}})
        )
    }
})