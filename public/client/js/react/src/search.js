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

module.exports = Main = React.createClass({

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
            <div id='react-wrapper'>
                <div id="top" className="clearfix">
                    <div id="search" className="clearfix">
                        <SearchAny search={this.state.search} searchChange={this.searchChange} />
                        <OptionsPanel search={this.state.search} searchChange={this.searchChange}/>
                    </div>
                    <Map search={this.state.search} />
                </div>
                <Results search={this.state.search} searchChange={this.searchChange}/>
            </div>
        )
    }
});

var SearchAny = React.createClass({
    checkClick: function(event){
        this.props.searchChange(event.currentTarget.name, event.currentTarget.checked);
        return true;
    },
    textType: function(event){
        this.props.searchChange('fulltext',event.currentTarget.value);
    },
    render: function(){

        return(
            <div id="search-any" className="clearfix">
                <h3><img id="search-arrow-img" src="/portal/img/arrow-green.png"/>Start Searching</h3>
                <div className="input-group">
                    <input type="text" className="form-control" placeholder="search any field" onChange={this.textType} value={this.props.search.fulltext}/>
                    <a className="btn input-group-addon"><i className="glyphicon glyphicon-search"></i></a>
                </div>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name="image" onChange={this.checkClick} checked={this.props.search.image}/>
                        Must have image
                    </label>
                </div>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name="geopoint" onChange={this.checkClick} checked={this.props.search.geopoint}/>
                        Must have map point
                    </label>
                </div>
            </div>
        )
    }
})

var OptionsPanel = React.createClass({
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
                <li key={ind} className={panels[item]} data-panel={item} onClick={self.showPanel}>{helpers.firstToUpper(item)}</li>
            )
        })
        return (
            <div id="options" className="clearfix">
                <ul id="options-menu" >
                    {menu}
                </ul>
                <Filters searchChange={this.props.searchChange} filters={this.props.search.filters} active={panels.filters}/>
                <Sorting searchChange={this.props.searchChange} sorting={this.props.search.sorting} active={panels.sorting}/>
                <Mapping searchChange={this.props.searchChange} bounds={this.props.search.bounds} active={panels.mapping}/>
                <Download search={this.props.search} searchChange={this.props.searchChange} active={panels.download}/>
            </div>
        )
    }
})