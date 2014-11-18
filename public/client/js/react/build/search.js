/**
 * @jsx React.DOM
 */

var React = require('react')

var Filters = require('./search/filters');
var Sorting = require('./search/sorting');
var Results = require('./search/results');
var Download = require('./search/download');
var Map = require('./search/map');

module.exports = React.createClass({displayName: 'exports',
    showPanel: function(event){
        $('#options-menu .active').removeClass('active');
        var panel = $(event.currentTarget).addClass('active').attr('data-panel');
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
                sorting:[{name: 'genus', order: 'asc'}],
                from: 0,
                size: 100
            },
            view:{
                columns: ['genus','specificepithet','collectioncode','datecollected'],
                type: 'list'
            }
        };
    },
    searchChange: function(key,val){
        var search = _.cloneDeep(this.state.search);
        if(typeof key == 'string'){
            search[key]=val;
        }else if(typeof key == 'object'){
            _.each(key,function(v,k){
                search[k]=v;
            });
        }
        this.setState({search: search});
    },
    viewChange: function(key,val){
        var view = _.cloneDeep(this.state.view);
        view[key]=val;
        this.setState({view: view});        
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
                            React.DOM.ul({id: "options-menu"}, 
                                React.DOM.li({className: "active", 'data-panel': "filters", onClick: this.showPanel}, "Filters"), 
                                React.DOM.li({'data-panel': "sorting", onClick: this.showPanel}, "Sorting"), 
                                React.DOM.li({'data-panel': "mapping", onClick: this.showPanel}, "Mapping"), 
                                React.DOM.li({'data-panel': "download", onClick: this.showPanel}, "Download & History")
                            ), 
                            React.DOM.div({className: "section active", id: "filters"}, 
                                Filters({searchChange: this.searchChange})
                            ), 
                            React.DOM.div({className: "clearfix section", id: "sorting"}, 
                                Sorting({searchChange: this.searchChange, sorting: this.state.search.sorting})
                            ), 
                            React.DOM.div({className: "clearfix section", id: "download"}, 
                                Download(null)
                            )
                        )
                    ), 
                    Map({search: this.state.search})
                ), 
                Results({search: this.state.search, searchChange: this.searchChange})
            )
        )
    }
})