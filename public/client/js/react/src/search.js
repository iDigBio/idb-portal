
import React, {useEffect, useState, useCallback} from 'react';
import Filters, {defaultFilters, newFilterProps} from './search/filters'
import Sorting, {defaultSorts} from './search/sorting'
import Mapping from './search/mapping'
import Results from './search/results'
import Download from './search/download'
import Map from './search/map'



import paramsParser from './search/lib/params_parser'

const Search = () => {
    const [optionsTab, setOptionsTab] = useState('filters')
    const [resultsTab, setResultsTab] = useState('list')
    const [search, setSearch] = useState(defaultSearch())
    const [aggs, setAggs] = useState([])

    useEffect(() => {
        // Hide the loader when the component is mounted
        const loader = document.getElementById('loader');
        const main = document.getElementById('main')
        if (loader) {
            loader.style.display = 'none';
        }
        if (main) {
            main.style.height='auto'
        }
    }, []);

    function defaultSearch(){
        return {
            filters: defaultFilters(),
            fulltext:'',
            image:false,
            geopoint:false,
            sorting: defaultSorts(),
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
        if (url('?view')) {
            const types = ['list', 'labels', 'media', 'recordsets'];
            const view = url('?view');
            if (types.indexOf(view) > -1) {
                localStorage.setItem('resultsTab', view);
                setResultsTab(view)
            } else {
                setResultsTab('list')
            }
        }
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
        // setReady(true)
    }, []);
    

    const searchChange = useCallback((key, val) => {
        console.log(key, val);
        var newSearch = _.cloneDeep(search);
        if (typeof key === 'string') {
            newSearch[key] = val;
        } else if (typeof key === 'object') {
            _.each(key, function (v, k) {
                newSearch[k] = v;
            });
        }
        setSearch(newSearch);
        searchHistory.push(newSearch); // Assuming searchHistory can handle reactivity properly
    }, [search, setSearch, searchHistory]);

    const viewChange = useCallback((view, option) => {
        if (view === 'optionsTab') {
            localStorage.setItem(view, option);
            setOptionsTab(option);
        } else if (view === 'resultsTab') {
            localStorage.setItem(view, option);
            setResultsTab(option);
        }
    }, [setOptionsTab, setResultsTab]); // Not including these in deps if they are from useState


    return (
        <div id='react-wrapper'>
            <div id="top" className="clearfix">
                <div id="search" className="clearfix">
                    <SearchAny search={search} searchChange={searchChange} defaultSearch={defaultSearch} />
                    <OptionsPanel search={search} searchChange={searchChange} view={optionsTab} viewChange={viewChange} aggs={aggs} />
                </div>
                <Map search={search} searchChange={searchChange} viewChange={viewChange}/>
            </div>
            <Results searchProp={search} searchChange={searchChange} view={resultsTab} viewChange={viewChange} setAggs={setAggs} />
        </div>
    )

};

const SearchAny = ({searchChange, search, defaultSearch}) => {
    function checkClick(event){
        searchChange(event.currentTarget.name, event.currentTarget.checked);
        return true;
    }
    function textType(event){
        searchChange('fulltext',event.currentTarget.value);
    }
    function resetSearch(e){
        e.preventDefault();
        searchChange(defaultSearch());
    }

    return(
        <div id="search-any" className="clearfix">
            <h3>
                Search Records
                <a href="#" role="button" className="btn pull-right" id="reset-button" onClick={resetSearch} title="reset search form" aria-label="Reset search form" style={{marginLeft: '20px', fontSize: '14px', color: '#0088cc'}}>Reset</a>
                <a href="#" role="button" className="btn pull-right" title="help" data-toggle="modal" data-target="#search-help" aria-label="Open search help dialog" style={{fontSize: '14px', color: '#0088cc'}}>Help</a>
            </h3>
            <div >
                <label htmlFor="search-all-input" className="sr-only">Search all fields</label>
                <input id="search-all-input" type="text" className="form-control" placeholder="search all fields" onChange={textType} value={search.fulltext}/>
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
            <div id="search-help" className="modal fade" role="dialog" aria-labelledby="search-help-title" aria-modal="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close pull-right" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h3 id="search-help-title">Search Help</h3>
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

const OptionsPanel = ({ searchChange, search, view, viewChange, aggs }) => {
    const showPanel = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const val = event.currentTarget.getAttribute('data-panel');
        viewChange('optionsTab', val);
    };

    const optionPanel = (name) => {
        switch (name) {
            case 'filters':
                return <Filters searchChange={searchChange} search={search} filters={search.filters} active="active" aggs={aggs} />;
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
            <li key={ind} className="tab" role="presentation">
                <a className={panels[item]} href="#" onClick={showPanel} data-panel={item} role="tab" aria-selected={item === view} aria-controls={item}>
                    {helpers.firstToUpper(item)}
                </a>
            </li>
        );
    });

    return (
        <div id="options" className="clearfix">
            <ul id="options-menu" role="tablist" aria-label="Search options">
                {menu}
            </ul>
            {panel}
        </div>
    );
};
export default Search;