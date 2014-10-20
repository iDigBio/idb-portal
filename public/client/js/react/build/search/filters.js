/**
 * @jsx React.DOM
 */

var React = require('react');
var fields = require('../../../lib/fields');

module.exports = React.createClass({displayName: 'exports',
    getInitialState: function(){
        return {filters: []};
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
                            React.DOM.option({disabled: disabled, value: field.name}, 
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
                React.DOM.div({className: "option-group filter"}, 
                    React.DOM.i({className: "glyphicon glyphicon-remove", onClick: self.removeFilter, 'data-remove': item}), 
                    React.DOM.label({className: "filter-name"}, item), 
                    React.DOM.textarea({className: "form-control", placeholder: fields.byName[item].dataterm}
                    )

                )
            )
        })
        return (
            React.DOM.div(null, 
                React.DOM.div({className: "option-group", id: "filter-select"}, 
                    React.DOM.ul({id: "filter-type"}, 
                        React.DOM.li({className: "active"}, "Text Filter"), 
                        React.DOM.li(null, "Presence Filter")
                    ), 
                    React.DOM.div({id: "filter-selects", className: "clearfix"}, 
                        React.DOM.select({className: "form-control", value: "0", placeholder: "select to add", onChange: this.addFilter}, 
                            React.DOM.option({value: "0"}, "select to add"), 
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