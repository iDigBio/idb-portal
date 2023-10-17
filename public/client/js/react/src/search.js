
import React from 'react';
import Filters from './search/filters'
import Sorting from './search/sorting'
import Mapping from './search/mapping'
import Results from './search/results'
import Download from './search/download'
import Map from './search/map'


import paramsParser from './search/lib/params_parser'

export default class Search extends React.Component{
    static defaultSearch(){
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

    constructor(props) {
        super(props);
        // this.defaultSearch = this.defaultSearch.bind(this)
        // Initialize the state in the constructor
        this.state = {
            optionsTab: 'filters',
            resultsTab: 'list',
            search: Search.defaultSearch(),
        };

        this.searchChange = this.searchChange.bind(this);
        this.viewChange = this.viewChange.bind(this);
        // Rest of your constructor code can go here
        // ...

        // set results view
        if (url('?view')) {
            const types = ['list', 'labels', 'media', 'recordsets'];
            const view = url('?view');
            if (types.indexOf(view) > -1) {
                localStorage.setItem('resultsTab', view);
                this.setState({ resultsTab: view });
            } else {
                this.setState({ resultsTab: 'list' });
            }

            // You might want to handle 'optionsTab' here as well, as it's not clear from your code.

            // var optionsTab = localStorage.getItem('optionsTab');
            // if (optionsTab) {
            //     this.setState({ optionsTab });
            // }
        }

        // set current search
        const search = Search.defaultSearch();
        if (url('?rq') || url('?sort')) {
            paramsParser(search); // mutates search object filters
            _.each(
                _.difference(_.map(Filters.defaultFilters(), 'name'), _.map(search.filters, 'name')),
                function (filter) {
                    search.filters.push(Filters.newFilterProps(filter));
                }
            );
        } else if (searchHistory.history.length > 0) {
            search.filters = _.map(searchHistory.history[0].filters, function (filter) {
                return Filters.newFilterProps(filter.name);
            });
        }
        window.history.replaceState({}, 'search', url('path'));
        searchHistory.push(search);

        // Update the state with 'search'
        this.setState({ search: search });
    }
    
    searchChange(key,val){
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
        console.log(search)
    }

    viewChange(view,option){
        //currently only supports options panel and results tabs
        if(view=='optionsTab'||view=='resultsTab'){
            localStorage.setItem(view, option);
            var ch={};
            ch[view]=option;
            this.setState(ch);
        }
    }
    render(){
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
};
// var Main = new Search()
class SearchAny extends React.Component{
    openHelp(){

    }

    constructor(props) {
        super(props)
        this.textType = this.textType.bind(this)
        this.checkClick = this.checkClick.bind(this)
        this.resetSearch = this.resetSearch.bind(this)
    }
     
    checkClick(event){
        this.props.searchChange(event.currentTarget.name, event.currentTarget.checked);
        return true;
    }
    textType(event){
        // console.log('CURRENT VALUE: ' + event.currentTarget.value)
        // console.log(this.props)
        this.props.searchChange('fulltext',event.currentTarget.value);
    }
    resetSearch(){ 
        this.props.searchChange(Search.defaultSearch());
    }
    render(){

        return(
            <div id="search-any" className="clearfix">
                <h3>
                    Search Records

                    <a className="btn pull-right" id="reset-button" onClick={this.resetSearch} title="reset search form">Reset</a>
                    <a className="btn pull-right" title="help" data-toggle="modal" data-target="#search-help">Help</a>
                </h3>
                <div >
                    <input type="text" className="form-control" placeholder="search all fields" onChange={this.textType} value={this.props.search.fulltext}/>
                </div>
                <div className="checkbox">
                    <label>
                        <input type="checkbox" name="image" onChange={this.checkClick} checked={this.props.search.image}/>
                        Must have media
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
                                        Check the <b>Must have media</b> and <b>Must have map point</b> checkboxes to only show records with media and/or mapping data respectively.
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
}

class OptionsPanel extends React.Component{
    /*getInitialState: function(){
        if(localStorage && typeof localStorage.panels ==='undefined'){
            localStorage.setItem('panels','filters');
        }
        return {panels: localStorage.getItem('panels')}
    },*/
    constructor(props) {
        super(props)
        this.optionPanel = this.optionPanel.bind(this)
        this.showPanel = this.showPanel.bind(this)
    }

    showPanel(event){
        event.preventDefault();
        event.stopPropagation();
        var val = event.currentTarget.attributes['data-panel'].value;
        /*this.setState({panels: val},function(){
            localStorage.setItem('panels',val);
        })*/
        this.props.viewChange('optionsTab',val);
    }
    optionPanel(name){
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
    }
    render(){
    
        var menu = [],self=this,panels={filters: '', mapping: '',sorting: '', download:''},panel;

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
}
// export default Search;