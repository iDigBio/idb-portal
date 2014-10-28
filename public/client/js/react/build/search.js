/**
 * @jsx React.DOM
 */

var React = require('react')
var dwc = require('./lib/dwc_fields');
var _ = require('lodash');
var fields = require('../../lib/fields');
var Filters = require('./search/filters');
var Sorting = require('./search/sorting');
var Results = require('./search/results');

module.exports = React.createClass({displayName: 'exports',
    showPanel: function(event){
        $('#options-menu .active').removeClass('active');
        var panel = $(event.target).addClass('active').attr('data-panel');
        $('#options .section').hide();
        $('#options #'+panel).show();
    },
    getInitialState: function(){
        return {
            search:{
                filters:[],
                fulltext:'',
                image:false,
                geopoint:false,
                sorting:[{name: 'Scientific Name', order: 'asc'}]
            }
        };
    },
    searchChange: function(key,val){
        var search = _.cloneDeep(this.state.search);
        search[key]=val;
        this.setState({search: search});
    },
    checkClick: function(event){
        this.searchChange(event.currentTarget.name, event.currentTarget.checked);
        return true;
    },
    textType: function(event){
        this.searchChange('fulltext',event.currentTarget.value);
    },
    render: function(){

        return(
            React.DOM.div({id: "react-wrapper"}, 
                React.DOM.div({id: "top", className: "clearfix"}, 
                    React.DOM.div({key: "fulltext", id: "search", className: "clearfix"}, 
                        React.DOM.div({id: "search-any", className: "clearfix"}, 
                            React.DOM.h3(null, React.DOM.img({id: "search-arrow-img", src: "/portal/img/arrow-green.png"}), " Start Searching"), 
                            React.DOM.div({className: "input-group"}, 
                                React.DOM.input({type: "text", className: "form-control", placeholder: "search any field", onChange: this.textType}), 
                                React.DOM.a({className: "btn input-group-addon"}, "Go")
                            ), 
                            React.DOM.div({className: "checkbox"}, 
                                React.DOM.label(null, 
                                    React.DOM.input({type: "checkbox", name: "image", onChange: this.checkClick, checked: this.state.search.image ? 'checked':''}), 
                                    "Must have image"
                                )
                            ), 
                            React.DOM.div({className: "checkbox"}, 
                                React.DOM.label(null, 
                                    React.DOM.input({type: "checkbox", name: "geopoint", onChange: this.checkClick, checked: this.state.search.geopoint ? 'checked':''}), 
                                    "Must have map point"
                                )
                            )
                        ), 
                        React.DOM.div({key: "filters", id: "options", className: "clearfix"}, 
                            React.DOM.ul({id: "options-menu", onClick: this.showPanel}, 
                                React.DOM.li({className: "active", 'data-panel': "filters"}, "Advanced Filters"), 
                                React.DOM.li({'data-panel': "sorting"}, "Sorting"), 
                                React.DOM.li({'data-panel': "download"}, "Download & History")
                            ), 
                            React.DOM.div({className: "section active", id: "filters"}, 
                                Filters({searchChange: this.searchChange})
                            ), 
                            React.DOM.div({className: "clearfix section", id: "sorting"}, 
                                Sorting({searchChange: this.searchChange, sorting: this.state.search.sorting})
                            ), 

                            React.DOM.div({className: "clearfix section", id: "download"}, 
                                React.DOM.label(null, "Download Current Result Set")
                            )
                        )
                    ), 
                    React.DOM.div({id: "map"})
                ), 
                Results({search: this.state.search, total: 0})
            )
        )
    }
})