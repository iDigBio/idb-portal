/**
 * @jsx React.DOM
 */

var React = require('react');
var Filters = require('./search/filters');
var Sorting = require('./search/sorting');
var Mapping = require('./search/mapping');
var Results = require('./search/results');
var Download = require('./search/download');
var Map = require('./search/map');

module.exports = Main = React.createClass({displayName: 'Main',
    showPanel: function(event){
        var val = event.currentTarget.attributes['data-panel'].value;
        this.setState({panels: val},function(){
            localStorage.setItem('panels',val);
        })
    },
    statics: {
        defaultSearch: function(){
            var filters = Filters.defaultFilters();
            return {
                filters: filters,
                fulltext:'',
                image:false,
                geopoint:false,
                sorting:[{name: 'genus', order: 'asc'}],
                from: 0,
                size: 100,
                bounds:{
                    top_left:{
                        lat: false,
                        lon: false
                    },
                    bottom_right:{
                        lat: false,
                        lon: false
                    }
                }
            };
        }
    },
    getInitialState: function(){
        if(localStorage && typeof localStorage.panels ==='undefined'){
            localStorage.setItem('panels','filters');
        }
        var search;
        if(searchHistory.history.length > 0){
            search = searchHistory.history[0];
        }else{
            search = Main.defaultSearch();
        }
        return {
            search: search, panels: localStorage.getItem('panels')
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
        searchHistory.push(search);
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
        var menu = [],self=this,panels={filters: '',sorting: '', mapping: '', download:''};
        Object.keys(panels).forEach(function(item,ind){
            if(item==self.state.panels){
                panels[item]='active';
            }else{
                panels[item]='';
            }
            if(item=='download'){
                menu.push(
                    React.DOM.li({key: ind, className: panels[item], 'data-panel': item, onClick: self.showPanel}, "Download & History")
                )
            }else{
                menu.push(
                    React.DOM.li({key: ind, className: panels[item], 'data-panel': item, onClick: self.showPanel}, helpers.firstToUpper(item))
                )
            }
        })
        //var search = _.cloneDeep(this.state.search)
        return(
            React.DOM.div({id: "react-wrapper"}, 
                React.DOM.div({id: "top", className: "clearfix"}, 
                    React.DOM.div({id: "search", className: "clearfix"}, 
                        React.DOM.div({id: "search-any", className: "clearfix"}, 
                            React.DOM.h3(null, React.DOM.img({id: "search-arrow-img", src: "/portal/img/arrow-green.png"}), " Start Searching"), 
                            React.DOM.div({className: "input-group"}, 
                                React.DOM.input({type: "text", className: "form-control", placeholder: "search any field", onChange: this.textType, value: this.state.search.fulltext}), 
                                React.DOM.a({className: "btn input-group-addon"}, "Go")
                            ), 
                            React.DOM.div({className: "checkbox"}, 
                                React.DOM.label(null, 
                                    React.DOM.input({type: "checkbox", name: "image", onChange: this.checkClick, checked: this.state.search.image}), 
                                    "Must have image"
                                )
                            ), 
                            React.DOM.div({className: "checkbox"}, 
                                React.DOM.label(null, 
                                    React.DOM.input({type: "checkbox", name: "geopoint", onChange: this.checkClick, checked: this.state.search.geopoint}), 
                                    "Must have map point"
                                )
                            )
                        ), 
                        React.DOM.div({id: "options", className: "clearfix"}, 
                            React.DOM.ul({id: "options-menu"}, 
                                menu
                            ), 
                            React.DOM.div({className: "section "+panels.filters, id: "filters"}, 
                                Filters({searchChange: this.searchChange, filters: this.state.search.filters})
                            ), 
                            React.DOM.div({className: "clearfix section "+panels.sorting, id: "sorting"}, 
                                Sorting({searchChange: this.searchChange, sorting: this.state.search.sorting})
                            ), 
                            React.DOM.div({className: "clearfix section "+panels.mapping, id: "mapping"}, 
                                Mapping({searchChange: this.searchChange, bounds: this.state.search.bounds})
                            ), 
                            React.DOM.div({className: "clearfix section "+panels.download, id: "download"}, 
                                Download({search: this.state.search, searchChange: this.searchChange})
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