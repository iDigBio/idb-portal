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
        //DEV SETTING
            localStorage.clear();
        //
        var search;
        if(searchHistory.history.length > 0){
            search = searchHistory.history[0];
        }else{
            search = Main.defaultSearch();
        }
        return {
            search: search
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
    render: function(){
        return(
            React.DOM.div({id: "react-wrapper"}, 
                React.DOM.div({id: "top", className: "clearfix"}, 
                    React.DOM.div({id: "search", className: "clearfix"}, 
                        SearchAny({search: this.state.search, searchChange: this.searchChange}), 
                        OptionsPanel({search: this.state.search, searchChange: this.searchChange})
                    ), 
                    Map({search: this.state.search})
                ), 
                Results({search: this.state.search, searchChange: this.searchChange})
            )
        )
    }
});

var SearchAny = React.createClass({displayName: 'SearchAny',
    checkClick: function(event){
        this.props.searchChange(event.currentTarget.name, event.currentTarget.checked);
        return true;
    },
    textType: function(event){
        this.props.searchChange('fulltext',event.currentTarget.value);
    },
    render: function(){

        return(
            React.DOM.div({id: "search-any", className: "clearfix"}, 
                React.DOM.h3(null, React.DOM.img({id: "search-arrow-img", src: "/portal/img/arrow-green.png"}), "Start Searching"), 
                React.DOM.div({className: "input-group"}, 
                    React.DOM.input({type: "text", className: "form-control", placeholder: "search any field", onChange: this.textType, value: this.props.search.fulltext}), 
                    React.DOM.a({className: "btn input-group-addon"}, React.DOM.i({className: "glyphicon glyphicon-search"}))
                ), 
                React.DOM.div({className: "checkbox"}, 
                    React.DOM.label(null, 
                        React.DOM.input({type: "checkbox", name: "image", onChange: this.checkClick, checked: this.props.search.image}), 
                        "Must have image"
                    )
                ), 
                React.DOM.div({className: "checkbox"}, 
                    React.DOM.label(null, 
                        React.DOM.input({type: "checkbox", name: "geopoint", onChange: this.checkClick, checked: this.props.search.geopoint}), 
                        "Must have map point"
                    )
                )
            )
        )
    }
})

var OptionsPanel = React.createClass({displayName: 'OptionsPanel',
    getInitialState: function(){
        if(localStorage && typeof localStorage.panels ==='undefined'){
            localStorage.setItem('panels','filters');
        }
        return {panels: localStorage.getItem('panels')}
    },
    showPanel: function(event){
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
                React.DOM.li({key: ind, className: panels[item], 'data-panel': item, onClick: self.showPanel}, helpers.firstToUpper(item))
            )
        })
        return (
            React.DOM.div({id: "options", className: "clearfix"}, 
                React.DOM.ul({id: "options-menu"}, 
                    menu
                ), 
                Filters({searchChange: this.props.searchChange, filters: this.props.search.filters, active: panels.filters}), 
                Sorting({searchChange: this.props.searchChange, sorting: this.props.search.sorting, active: panels.sorting}), 
                Mapping({searchChange: this.props.searchChange, bounds: this.props.search.bounds, active: panels.mapping}), 
                Download({search: this.props.search, searchChange: this.props.searchChange, active: panels.download})
            )
        )
    }
})