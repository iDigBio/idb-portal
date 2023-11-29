
import React, {useEffect, useState} from 'react';
import Filters, {defaultFilters, newFilterProps} from './search/filters'
import Sorting from './search/sorting'
import Mapping from './search/mapping'
import Results from './search/results'
import Download from './search/download'
import Map from './search/map'



import paramsParser from './search/lib/params_parser'

const Search = () => {
    const [optionsTab, setOptionsTab] = useState('filters')
    const [resultsTab, setResultsTab] = useState('list')
    const [search, setSearch] = useState(defaultSearch())
    function defaultSearch(){
        return {
            filters: defaultFilters(),
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
                    bottom_right: {
                        lat: false,
                        lon: false
                    }
                }   
            }
        };
    }

    useEffect(() => {
        const currentSearch = defaultSearch()
        if (url('?rq') || url('?sort')) {

            paramsParser(currentSearch); // mutates search object filters
            _.each(
                _.difference(_.map(defaultFilters(), 'name'), _.map(currentSearch.filters, 'name')),
                function (filter) {
                    currentSearch.filters.push(newFilterProps(filter));
                }
            );
        } else if (searchHistory.length > 0) {
            currentSearch.filters = _.map(searchHistory.history[0].filters, function (filter) {
                return newFilterProps(filter.name);
            });
        }
        window.history.replaceState({}, 'search', url('path'));
        // setHistory([...history, currentSearch])
        searchHistory.push(currentSearch);
        // Update the state with 'search'
        setSearch(currentSearch)
    }, []);
    
    function searchChange(key,val){
        var newSearch = _.cloneDeep(search);
        if(typeof key == 'string'){
            newSearch[key]=val;
        }else if(typeof key == 'object'){
            _.each(key,function(v,k){
                newSearch[k]=v;
            });
        }
        setSearch(newSearch)
        // setHistory([...history, search])
        searchHistory.push(newSearch);
    }

    function viewChange(view,option){
        //currently only supports options panel and results tabs
        if(view=='optionsTab'){
            localStorage.setItem(view, option);
            setOptionsTab(option)
        } else if (view=='resultsTab') {
            localStorage.setItem(view, option);
            setResultsTab(option)
        }
    }

    return(
        <div id='react-wrapper'>
            <div id="top" className="clearfix">
                <div id="search" className="clearfix">
                    <SearchAny search={search} searchChange={searchChange} defaultSearch={defaultSearch} />
                    <OptionsPanel search={search} searchChange={searchChange} view={optionsTab} viewChange={viewChange} />
                </div>
                <Map search={search} searchChange={searchChange} viewChange={viewChange}/>
            </div>
            <Results search={search} searchChange={searchChange} view={resultsTab} viewChange={viewChange}/>
        </div>
    )

};
// var Main = new Search()
const SearchAny = ({searchChange, search, defaultSearch}) => {
    // constructor(props) {
    //     super(props)
    //     this.textType = this.textType.bind(this)
    //     this.checkClick = this.checkClick.bind(this)
    //     this.resetSearch = this.resetSearch.bind(this)
    // }
     
    function checkClick(event){
        searchChange(event.currentTarget.name, event.currentTarget.checked);
        return true;
    }
    function textType(event){
        searchChange('fulltext',event.currentTarget.value);
    }
    function resetSearch(){
        searchChange(defaultSearch());
    }

    return(
        <div id="search-any" className="clearfix">
            <h3>
                Search Records

                <a className="btn pull-right" id="reset-button" onClick={resetSearch} title="reset search form">Reset</a>
                <a className="btn pull-right" title="help" data-toggle="modal" data-target="#search-help">Help</a>
            </h3>
            <div >
                <input type="text" className="form-control" placeholder="search all fields" onChange={textType} value={search.fulltext}/>
            </div>
            <div className="checkbox">
                <label>
                    <input type="checkbox" name="image" onChange={checkClick} checked={search.image}/>
                    Must have media
                </label>
            </div>
            <div className="checkbox">
                <label>
                    <input type="checkbox" name="geopoint" onChange={checkClick} checked={search.geopoint}/>
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

const OptionsPanel = ({ searchChange, search, view, viewChange }) => {
    const showPanel = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const val = event.currentTarget.getAttribute('data-panel');
        viewChange('optionsTab', val);
    };

    const optionPanel = (name) => {
        switch (name) {
            case 'filters':
                return <Filters searchChange={searchChange} search={search} filters={search.filters} active="active" />;
            case 'sorting':
                return <Sorting searchChange={searchChange} sorting={search.sorting} active="active" />;
            case 'mapping':
                return <Mapping searchChange={searchChange} mapping={search.mapping} active="active" />;
            case 'download':
                return <Download search={search} searchChange={searchChange} active="active" />;
            default:
                return null;
        }
    };

    const panels = { filters: '', mapping: '', sorting: '', download: '' };
    let panel;
    const menu = Object.keys(panels).map((item, ind) => {
        if (item === view) {
            panels[item] = 'active';
            panel = optionPanel(item);
        } else {
            panels[item] = '';
        }
        return (
            <li key={ind} className="tab">
                <a className={panels[item]} href="#" onClick={showPanel} data-panel={item}>
                    {helpers.firstToUpper(item)}
                </a>
            </li>
        );
    });

    return (
        <div id="options" className="clearfix">
            <ul id="options-menu">
                {menu}
            </ul>
            {panel}
        </div>
    );
};
export default Search;