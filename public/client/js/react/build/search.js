
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
                mapping: {
                    type: "box",
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
                }
            };
        }
    },
    getInitialState: function(){
        //set results view
        var state={optionsTab:'filters',resultsTab:'list'};
        if(url('?view')){
            var types =['list','labels','images'], view = url('?view');
            if(types.indexOf(view) > -1){
                localStorage.setItem('resultsTab', view);
                state['resultsTab']=view;
            }else{
                state['resultsTab']='list';
            }
        }else if(localStorage.getItem('resultsTab')){

            state['resultsTab']=localStorage.getItem('resultsTab');
        }
        if(localStorage.getItem('optionsTab')){
            state['optionsTab']=localStorage.getItem('optionsTab');
        }
        var search;
        //set current search
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
        state['search']=search;
        return state;
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
    viewChange: function(view,option){
        //currently only supports options panel and results tabs
        if(view=='optionsTab'||view=='resultsTab'){
            localStorage.setItem(view, option);
            var ch={};
            ch[view]=option;
            this.setState(ch);
        }
    },
    render: function(){
        return(
            React.createElement("div", {id: "react-wrapper"}, 
                React.createElement("div", {id: "top", className: "clearfix"}, 
                    React.createElement("div", {id: "search", className: "clearfix"}, 
                        React.createElement(SearchAny, {search: this.state.search, searchChange: this.searchChange}), 
                        React.createElement(OptionsPanel, {search: this.state.search, searchChange: this.searchChange, view: this.state.optionsTab, viewChange: this.viewChange})
                    ), 
                    React.createElement(Map, {search: this.state.search, searchChange: this.searchChange, viewChange: this.viewChange})
                ), 
                React.createElement(Results, {search: this.state.search, searchChange: this.searchChange, view: this.state.resultsTab, viewChange: this.viewChange})
            )
        )
    }
});

var SearchAny = React.createClass({displayName: "SearchAny",
    openHelp: function(){

    },
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
                React.createElement("h3", null, 
                    React.createElement("img", {id: "search-arrow-img", src: "/portal/img/arrow-green.png"}), "Start Searching", 
                    React.createElement("a", {className: "btn btn-lg pull-right", title: "help", "data-toggle": "modal", "data-target": "#search-help"}, 
                        React.createElement("i", {className: "glyphicon glyphicon-question-sign"})
                    )
                ), 
                React.createElement("div", {className: "input-group"}, 
                    React.createElement("input", {type: "text", className: "form-control", placeholder: "search all fields", onChange: this.textType, value: this.props.search.fulltext}), 
                    React.createElement("a", {className: "btn input-group-addon", onClick: this.resetSearch, title: "reset"}, React.createElement("i", {className: "glyphicon glyphicon-refresh"}))
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
                ), 
                React.createElement("div", {id: "search-help", className: "modal fade"}, 
                    React.createElement("div", {className: "modal-dialog"}, 
                        React.createElement("div", {className: "modal-content"}, 
                            React.createElement("div", {className: "modal-header"}, 
                                React.createElement("button", {type: "button", className: "close pull-right", "data-dismiss": "modal"}, 
                                    React.createElement("span", {"aria-hidden": "true"}, "×")
                                ), 
                                React.createElement("h3", null, "Search Help")
                            ), 
                            React.createElement("div", {className: "modal-body"}, 
                                React.createElement("ul", null, 
                                    React.createElement("li", null, 
                                        "This search page is reactive to input and will execute a search the moment you interact with the form inputs."
                                    ), 
                                    React.createElement("li", null, 
                                        "Full text searches across all data fields can be executed with the \"search all fields\" box at the top of the search form."
                                    ), 
                                    React.createElement("li", null, 
                                        "Check the ", React.createElement("b", null, "Must have image"), " and ", React.createElement("b", null, "Must have map point"), " checkboxes to only show records with images and/or mapping data respectively."
                                    ), 
                                    React.createElement("li", null, 
                                        "Use the field ", React.createElement("em", null, "Filters"), " tab to add exact match terms on a per field basis to your search." + ' ' +
                                        "A filter can also be used to simply select the presence or absence of a field in a record with" + ' ' +
                                        "the ", React.createElement("b", null, "Present"), " and ", React.createElement("b", null, "Missing"), " checkboxes."
                                    ), 
                                    React.createElement("li", null, 
                                        "Use the ", React.createElement("em", null, "Sorting"), " tab to add multiple sort values to the search."
                                    ), 
                                    React.createElement("li", null, 
                                        "Use the ", React.createElement("em", null, "Mapping"), " tab to add geographic bounding coordinates to your search."
                                    ), 
                                    React.createElement("li", null, 
                                        "Use the ", React.createElement("em", null, "Download"), " tab to access your search history and to download the current search results."
                                    )
                                )
                            )

                        )
                    )
                )
            )
        )
    }
})

var OptionsPanel = React.createClass({displayName: "OptionsPanel",
    /*getInitialState: function(){
        if(localStorage && typeof localStorage.panels ==='undefined'){
            localStorage.setItem('panels','filters');
        }
        return {panels: localStorage.getItem('panels')}
    },*/
    showPanel: function(event){
        event.preventDefault();
        event.stopPropagation();
        var val = event.currentTarget.attributes['data-panel'].value;
        /*this.setState({panels: val},function(){
            localStorage.setItem('panels',val);
        })*/
        this.props.viewChange('optionsTab',val);
    },

    render: function(){
        var menu = [],self=this,panels={filters: '',sorting: '', mapping: '', download:''};
        Object.keys(panels).forEach(function(item,ind){
            if(item==self.props.view){
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
                React.createElement(Mapping, {searchChange: this.props.searchChange, mapping: this.props.search.mapping, active: panels.mapping}), 
                React.createElement(Download, {search: this.props.search, searchChange: this.props.searchChange, active: panels.download})
            )
        )
    }
})