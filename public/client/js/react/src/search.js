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
            /*if(item=='download'){
                menu.push(
                    <li key={ind} className={panels[item]} data-panel={item} onClick={self.showPanel}>Download &amp; History</li>
                )
            }else{*/
                menu.push(
                    <li key={ind} className={panels[item]} data-panel={item} onClick={self.showPanel}>{helpers.firstToUpper(item)}</li>
                )
            //}
        })
        var panel;
        switch(this.state.panels){
            case 'filters':
                panel = <Filters searchChange={this.searchChange} filters={this.state.search.filters}/>;
                break;
            case 'sorting':
                panel = <Sorting searchChange={this.searchChange} sorting={this.state.search.sorting}/>;
                break;
            case 'mapping':
                panel = <Mapping searchChange={this.searchChange} bounds={this.state.search.bounds} />;
                break;
            case 'download':
                panel = <Download search={this.state.search} searchChange={this.searchChange} />;
                break;
        }
        //var search = _.cloneDeep(this.state.search)
        return(
            <div id='react-wrapper'>
                <div id="top" className="clearfix">
                    <div id="search" className="clearfix">
                        <div id="search-any" className="clearfix">
                            <h3><img id="search-arrow-img" src="/portal/img/arrow-green.png"/> Start Searching</h3>
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="search any field" onChange={this.textType} value={this.state.search.fulltext}/>
                                <a className="btn input-group-addon"><i className="glyphicon glyphicon-search"></i></a>
                            </div>
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="image" onChange={this.checkClick} checked={this.state.search.image}/>
                                    Must have image
                                </label>
                            </div>
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="geopoint" onChange={this.checkClick} checked={this.state.search.geopoint}/>
                                    Must have map point
                                </label>
                            </div>
                        </div>
                        <div id="options" className="clearfix">
                            <ul id="options-menu" >
                                {menu}
                            </ul>
                            {panel}
                        </div>
                    </div>
                    <Map search={this.state.search} />
                </div>
                <Results search={this.state.search} searchChange={this.searchChange}/>
            </div>
        )
    }
})