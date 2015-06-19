
var React = require('react');
var Filters = require('./search/filters');
var Sorting = require('./search/sorting');
var Mapping = require('./search/mapping');
var Results = require('./search/results');
var Download = require('./search/download');
var Map = require('./search/map');

var paramsParser = require('./search/lib/params_parser');

var Main = module.exports =  React.createClass({

    statics: {
        defaultSearch: function(){
            return {
                filters: Filters.defaultFilters(),
                fulltext:'',
                image:false,
                geopoint:false,
                sorting: Sorting.defaultSorts(),
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
        /*}else if(searchHistory.history.length > 0){
            search = searchHistory.history[0];*/
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
            <div id='react-wrapper'>
                <div id="top" className="clearfix">
                    <div id="search" className="clearfix">
                        <SearchAny search={this.state.search} searchChange={this.searchChange} />
                        <OptionsPanel search={this.state.search} searchChange={this.searchChange} view={this.state.optionsTab} viewChange={this.viewChange}/>
                    </div>
                    <Map search={this.state.search} searchChange={this.searchChange} viewChange={this.viewChange}/>
                </div>
                <Results search={this.state.search} searchChange={this.searchChange} view={this.state.resultsTab} viewChange={this.viewChange}/>
            </div>
        )
    }
});

var SearchAny = React.createClass({
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
            <div id="search-any" className="clearfix">
                <h3>
                    Start Searching

                    <a className="btn pull-right" id="reset-button" onClick={this.resetSearch} title="reset"><i className="glyphicon glyphicon-refresh"></i></a>
                    <a className="btn pull-right" title="help" data-toggle="modal" data-target="#search-help">
                        <i className="glyphicon glyphicon-question-sign"></i>
                    </a>
                </h3>
                <div >
                    <input type="text" className="form-control" placeholder="search all fields" onChange={this.textType} value={this.props.search.fulltext}/>
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
                <div id="search-help" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close pull-right" data-dismiss="modal">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <h3>Search Help</h3>
                            </div>
                            <div className="modal-body">
                                <ul>
                                    <li>
                                        This search page is reactive to input and will execute a search the moment you interact with the form inputs.
                                    </li>
                                    <li>
                                        Full text searches across all data fields can be executed with the "search all fields" box at the top of the search form.
                                    </li>
                                    <li>
                                        Check the <b>Must have image</b> and <b>Must have map point</b> checkboxes to only show records with images and/or mapping data respectively.
                                    </li>
                                    <li> 
                                        Use the field <em>Filters</em> tab to add exact match terms on a per field basis to your search.
                                        A filter can also be used to simply select the presence or absence of a field in a record with
                                        the <b>Present</b> and <b>Missing</b> checkboxes.
                                    </li>
                                    <li>
                                        Use the <em>Sorting</em> tab to add multiple sort values to the search.
                                    </li>
                                    <li>
                                        Use the <em>Mapping</em> tab to add geographic bounding coordinates to your search.
                                    </li>
                                    <li>
                                        Use the <em>Download</em> tab to access your search history and to download the current search results.
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
})

var OptionsPanel = React.createClass({
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
    optionPanel: function(name){
        switch(name){
            case 'filters':
                return <Filters searchChange={this.props.searchChange} search={this.props.search} filters={this.props.search.filters} active="active"/>;
                break;
            case 'sorting':
                return <Sorting searchChange={this.props.searchChange} sorting={this.props.search.sorting} active="active"/>;
                break;
            case 'mapping':
                return <Mapping searchChange={this.props.searchChange} mapping={this.props.search.mapping} active="active"/>;
                break;
            case 'download':
                return <Download search={this.props.search} searchChange={this.props.searchChange} active="active"/>;
                break;
        }
    },
    render: function(){
    
        var menu = [],self=this,panels={filters: '',sorting: '', mapping: '', download:''},panel;

        Object.keys(panels).forEach(function(item,ind){
            if(item==self.props.view){
                panels[item]='active';
                panel = self.optionPanel(item);
            }else{
                panels[item]='';
            }
            menu.push(
                <li key={ind} className="tab">
                    <a className={panels[item]} href="#" onClick={self.showPanel} data-panel={item}>{helpers.firstToUpper(item)}</a>
                </li>
            )
        })
        //var filters = React.createFactory(Filters);
        return (
            <div id="options" className="clearfix">
                <ul id="options-menu" >
                    {menu}
                </ul>
                {panel}
            </div>
        )
    }
})