/**
 * @jsx React.DOM
 */

var React = require('react')

var Filters = require('./search/filters');
var Sorting = require('./search/sorting');
var Results = require('./search/results');
var Download = require('./search/download');
var Map = require('./search/map');

module.exports = Main = React.createClass({
    showPanel: function(event){
        this.setState({panels: event.currentTarget.attributes['data-panel'].value})
    },
    defaultSearch: function(){
        return {
            filters:[],
            fulltext:'',
            image:false,
            geopoint:false,
            sorting:[{name: 'genus', order: 'asc'}],
            from: 0,
            size: 100
        };
    },
    getInitialState: function(){
        if(localStorage && typeof localStorage.panels ==='undefined'){
            localStorage.setItem('panels','filters');
        }
        return {
            search: this.defaultSearch(), panels: 'filters'
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
        var menu = [],self=this,panels={filters: '',sorting: '', mapping: '', download:''};
        Object.keys(panels).forEach(function(item,ind){
            if(item==self.state.panels){
                panels[item]='active';
            }else{
                panels[item]='';
            }
            if(item=='download'){
                menu.push(
                    <li key={ind} className={panels[item]} data-panel={item} onClick={self.showPanel}>Download &amp; History</li>
                )
            }else{
                menu.push(
                    <li key={ind} className={panels[item]} data-panel={item} onClick={self.showPanel}>{helpers.firstToUpper(item)}</li>
                )
            }
            
        })
    
        return(
            <div id='react-wrapper'>
                <div id="top" className="clearfix">
                    <div key='fulltext' id="search" className="clearfix">
                        <div id="search-any" className="clearfix">
                            <h3><img id="search-arrow-img" src="/portal/img/arrow-green.png"/> Start Searching</h3>
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="search any field" onChange={this.textType} />
                                <a className="btn input-group-addon">Go</a>
                            </div>
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="image" onChange={this.checkClick} checked={this.state.search.image ? 'checked':''}/>
                                    Must have image
                                </label>
                            </div>
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="geopoint" onChange={this.checkClick} checked={this.state.search.geopoint ? 'checked':''}/>
                                    Must have map point
                                </label>
                            </div>
                        </div>
                        <div key='filters' id="options" className="clearfix">
                            <ul id="options-menu" >
                                {menu}
                            </ul>
                            <div className={"section "+panels.filters} id="filters">
                                <Filters searchChange={this.searchChange}/>
                            </div>
                            <div className={"clearfix section "+panels.sorting} id="sorting">
                                <Sorting searchChange={this.searchChange} sorting={this.state.search.sorting}/>
                            </div>
                            <div className={"clearfix section "+panels.download} id="download">
                                <Download />
                            </div>
                        </div>
                    </div>
                    <Map search={this.state.search} />
                </div>
                <Results search={this.state.search} searchChange={this.searchChange}/>
            </div>
        )
    }
})