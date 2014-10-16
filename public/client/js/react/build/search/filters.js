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
                    flist.push(
                        React.DOM.option({disabled: disabled, value: field.name}, field.name)
                    );
                }
            });
            fgroups.push(
              React.DOM.optgroup({label: fields.groupNames[val]}, 
                flist
              )
            );
        });
        var filters = [];
        _.each(this.state.filters,function(item){
            filters.push(
                React.DOM.div({className: "option-group filter"}, 
                    React.DOM.i({className: "glyphicon glyphicon-remove", onClick: self.removeFilter, 'data-remove': item}), 
                    React.DOM.label(null, item), 
                    React.DOM.textarea({className: "form-control", placeholder: fields.byName[item].dataterm}
                    )
                )
            )
        })
        return (
            React.DOM.div(null, 
                React.DOM.div({className: "option-group", id: "filter-select"}, 
                    React.DOM.label(null, "Add a Filter"), 
                    React.DOM.select({className: "form-control", placeholder: "select to add", onChange: this.addFilter}, 
                        React.DOM.option({selected: "selected", value: "0"}, "select to add"), 
                        fgroups
                    )
                ), 
                React.DOM.div({id: "filters-holder"}, 
                    filters
                )
            )
        )
    }
})