
var React = require('react');
var Filters = require('./search/filters');
var Sorting = require('./search/sorting');
var Mapping = require('./search/mapping');
var Results = require('./search/results');
var Download = require('./search/download');
var Map = require('./search/map');

var paramsParser = require('./search/lib/params_parser');

module.exports = Main = React.createClass({displayName: "Main",

    statics: {
        defaultSearch: function(){
            var filters = Filters.defaultFilters();
            return {
                filters: filters,
                fulltext:'',
                image:false,
                geopoint:false,
                sorting:[],
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

        var search;
        if(url('?rq') || url('?sort')){
            search = Main.defaultSearch();
            paramsParser(search);
            window.history.pushState({},'search',url('path'));
        }else if(searchHistory.history.length > 0){
            search = searchHistory.history[0];
        }else{
            search = Main.defaultSearch();
        }
     
        searchHistory.push(search);
        return {search: search};
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
    render: function(){
        return(
            React.createElement("div", {id: "react-wrapper"}, 
                React.createElement("div", {id: "top", className: "clearfix"}, 
                    React.createElement("div", {id: "search", className: "clearfix"}, 
                        React.createElement(SearchAny, {search: this.state.search, searchChange: this.searchChange}), 
                        React.createElement(OptionsPanel, {search: this.state.search, searchChange: this.searchChange})
                    ), 
                    React.createElement(Map, {search: this.state.search})
                ), 
                React.createElement(Results, {search: this.state.search, searchChange: this.searchChange})
            )
        )
    }
});

var SearchAny = React.createClass({displayName: "SearchAny",
    checkClick: function(event){
        this.props.searchChange(event.currentTarget.name, event.currentTarget.checked);
        return true;
    },
    textType: function(event){
        this.props.searchChange('fulltext',event.currentTarget.value);
    },
    resetSearch: function(){
        this.props.searchChange(Main.defaultSearch());
    },
    render: function(){

        return(
            React.createElement("div", {id: "search-any", className: "clearfix"}, 
                React.createElement("h3", null, React.createElement("img", {id: "search-arrow-img", src: "/portal/img/arrow-green.png"}), "Start Searching"), 
                React.createElement("div", {className: "input-group"}, 
                    React.createElement("input", {type: "text", className: "form-control", placeholder: "search any field", onChange: this.textType, value: this.props.search.fulltext}), 
                    React.createElement("a", {className: "btn input-group-addon", onClick: this.resetSearch}, React.createElement("i", {className: "glyphicon glyphicon-refresh"}))
                ), 
                React.createElement("div", {className: "checkbox"}, 
                    React.createElement("label", null, 
                        React.createElement("input", {type: "checkbox", name: "image", onChange: this.checkClick, checked: this.props.search.image}), 
                        "Must have image"
                    )
                ), 
                React.createElement("div", {className: "checkbox"}, 
                    React.createElement("label", null, 
                        React.createElement("input", {type: "checkbox", name: "geopoint", onChange: this.checkClick, checked: this.props.search.geopoint}), 
                        "Must have map point"
                    )
                )
            )
        )
    }
})

var OptionsPanel = React.createClass({displayName: "OptionsPanel",
    getInitialState: function(){
        if(localStorage && typeof localStorage.panels ==='undefined'){
            localStorage.setItem('panels','filters');
        }
        return {panels: localStorage.getItem('panels')}
    },
    showPanel: function(event){
        //event.preventDefault();
        event.stopPropagation();
        var val = event.currentTarget.attributes['data-panel'].value;
        this.setState({panels: val},function(){
            localStorage.setItem('panels',val);
        })
    },

    render: function(){
        var menu = [],self=this,panels={filters: '',sorting: '', mapping: '', download:''};
        Object.keys(panels).forEach(function(item,ind){
            if(item==self.state.panels){
                panels[item]='active';
            }else{
                panels[item]='';
            }
            menu.push(
                React.createElement("li", {key: ind, className: "tab"}, 
                    React.createElement("a", {className: panels[item], href: "#", onClick: self.showPanel, "data-panel": item}, helpers.firstToUpper(item))
                )
            )
        })
        //var filters = React.createFactory(Filters);
        return (
            React.createElement("div", {id: "options", className: "clearfix"}, 
                React.createElement("ul", {id: "options-menu"}, 
                    menu
                ), 
                React.createElement(Filters, {searchChange: this.props.searchChange, filters: this.props.search.filters, active: panels.filters}), 
                React.createElement(Sorting, {searchChange: this.props.searchChange, sorting: this.props.search.sorting, active: panels.sorting}), 
                React.createElement(Mapping, {searchChange: this.props.searchChange, bounds: this.props.search.bounds, active: panels.mapping}), 
                React.createElement(Download, {search: this.props.search, searchChange: this.props.searchChange, active: panels.download})
            )
        )
    }
})