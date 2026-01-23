import React, {useState, useEffect, useMemo, useCallback, useRef, memo} from 'react';
import idbapi from '../../../lib/idbapi';
import queryBuilder from '../../../lib/querybuilder';


const Results = memo(({ searchProp, searchChange, view, viewChange, aggs, setAggs }) => {
    const [lastQueryStringed, setLastQueryStringed] = useState('');
    const [results, setResults] = useState([]);
    const [attribution, setAttribution] = useState([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState(searchProp);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const lastQueryTimeRef = useRef();

    const getResults = useCallback(() => {
        let now = new Date().getTime();
        let query = queryBuilder.makeSearchQuery(search);
        if (JSON.stringify(query) !== lastQueryStringed) {
            if (search.from === 0) {
                setLoading(true);
                setResults([]);
            }

            lastQueryTimeRef.current = now;
            idbapi.search(query, function (response) {
                let searchState = search
                if (response.error !== 'Internal Server Error') {
                    if (now >= lastQueryTimeRef.current) {
                        let res = search.from > 0 ? results.concat(response.items) : response.items;
                        let more = response.itemCount > (search.from + search.size);
                        searchState.from = query.offset;
                        setSearch(searchState)
                        // searchChange(searchState)
                        setResults(res);
                        setAttribution(response.attribution);
                        setTotal(response.itemCount);
                        setHasMore(more);
                        setLoading(false);
                        setAggs(response.aggs.unique_scientific_names.buckets)
                    }
                }
            });

            setLastQueryStringed(JSON.stringify(query));
        }
    }, [search, lastQueryStringed]);

    useEffect(() => {
        if (searchProp!==search) {
            setSearch(_.cloneDeep(searchProp));
        }
    }, [searchProp]);

    useEffect(() => {
        getResults();
    }, [search]);

    useEffect(() => {
        const handleScroll = _.debounce(() => {
            let newSearch = _.cloneDeep(search);
            if (total > newSearch.from + newSearch.size) {
                if (($(window).scrollTop() + 40 >= $(document).height() - $(window).height()) && (!loading)) {
                    setLoading(true)
                    newSearch.from += newSearch.size;
                    updateResults(newSearch);
                    searchChange(newSearch)
                }
            }
        }, 100);

        window.onscroll = handleScroll;
        return () => {
            window.onscroll = null;
        };
    }, [loading]);

    const viewChangeHandler = (event) => {
        event.preventDefault();
        let newView = event.currentTarget.attributes['data-value'].value;
        viewChange('resultsTab', newView);
    };

                    
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            viewChangeHandler(event);
        }
    };

    const updateResults = (newSearch) => {
        setSearch(newSearch);
        setLoading(true);
        getResults();
    };

    // Render logic
    let resultsComponent;
    switch (view) {
        case 'list':
            resultsComponent = <ResultsList search={searchProp} results={results} searchChange={searchChange} loading={loading} />;
            break;
        case 'labels':
            resultsComponent = <ResultsLabels results={results} loading={loading}/>;
            break;
        case 'media':
            resultsComponent = <ResultsImages search={searchProp} resultsProp={results} setResults={setResults}
                                              loadingProp={loading}/>;
            break;
        case 'recordsets':
            resultsComponent = <Providers attribution={attribution}/>;
            break;
    }

    let li = ['list', 'labels', 'media', 'recordsets'].map(item => (
        <li key={'tab-' + item} onClick={viewChangeHandler} data-value={item} className={item === view ? 'active' : ''}>
            {helpers.firstToUpper(item)}
        </li>
    ));

    return (
        <div id="results" className="clearfix">
            <ul id="results-menu" className="pull-left">
                {li}
            </ul>
            <div className="pull-right total">
                Total: {helpers.formatNum(parseInt(total))}
            </div>
            {resultsComponent}
        </div>
    );
})
var sortClick=false;
const ResultsList = ({search, searchChange, results, loading}) => {
    const [columns, setColumnsState] = useState(defaultColumns())

    useEffect(() => {
        if(_.isUndefined(localStorage) || _.isUndefined(localStorage.viewColumns)){
            var cols = defaultColumns();
            localStorage.setItem('viewColumns',JSON.stringify({'columns': cols}));
            setColumns(cols)
        }else{
            setColumns(JSON.parse(localStorage.getItem('viewColumns')).columns)
        }
    }, [])

    function resetColumns(){
        setColumns(defaultColumns());
    }
    function defaultColumns(){
        return ['family','scientificname','datecollected','country','institutioncode','basisofrecord'];
    }
    function setColumns(columns){
        setColumnsState(columns)
        if(localStorage){
            localStorage.setItem('viewColumns',JSON.stringify({'columns':columns}));
        }
    }
    function columnCheckboxClick(e){
        var localColumns = _.cloneDeep(columns);
        if(e.currentTarget.checked===true){
            localColumns.push(e.currentTarget.name);
        }else{
            localColumns.splice(columns.indexOf(e.currentTarget.name),1);
        }
        setColumns(localColumns);
    }
    function addColumn(e){
        e.preventDefault();
        var col = _.find(_.keys(fields.byTerm),function(name){
            return columns.indexOf(name)===-1
        });
        var cols = columns;
        cols.unshift(col);
        setColumns(cols)
    }
    function sortColumn(e){
        e.preventDefault();
        //sorted column sorts the top level sort value in search and new sorting items length
        //shall not exceed original length
        var dir, localSearch = _.cloneDeep(search), name=e.currentTarget.attributes['data-term'].value,
            sort={name: name}, sorting=localSearch.sorting, curlength = sorting.length;
        if(_.isUndefined(e.currentTarget.attributes['data-sort'])){
            dir='asc';
        }else{
            dir = e.currentTarget.attributes['data-sort'].value == 'asc' ?  'desc': 'asc';
        }
        sort.order = dir;

        var list=[];
        _.each(sorting,function(item){
            list.push(item.name);
        })
        var ind= list.indexOf(name),len=list.length;
        if(ind>-1){
            sorting.splice(ind,1);
        }
        sorting.unshift(sort);
        if(sorting.length>curlength && curlength > 0){
            sorting.pop();
        }
        sortClick=true;
        searchChange('sorting',sorting);
    }
    function openRecord(e){
        e.preventDefault();
        e.stopPropagation();
        //to prevent opening if hiliting text

        if(window.getSelection().toString().length===0 || (e.target.nodeName=='I' || e.target.nodeName=='BUTTON')){
            window.open('/portal/records/'+e.currentTarget.id,'_blank');
        }

    }

    var cols = columns,self=this;

    //['scientificname','genus','collectioncode','specificepithet','commonname'];
    var rows=[];
    var headers=[];
    //results table
    var sorted = _.isEmpty(search.sorting) ? {name: undefined} : search.sorting[0];
    var style={width: (Math.floor(100/cols.length))+'%'};
    cols.forEach(function(item){
        if(sorted.name===item){
            var icon = sorted.order == 'asc' ? 'glyphicon-chevron-up' : 'glyphicon-chevron-down';
            //sort click spinner
            var sym;
            if(loading && sortClick){
                sym = <i className="spinner"></i>;
                sortClick=false;
            }else{
                sym = <i className={"glyphicon "+icon}></i>;
            }
            headers.push(
                <th key={'header-'+item} id={item} className="data-column" style={style} data-term={item} data-sort={sorted.order} onClick={sortColumn}>
                    {fields.byTerm[item].name}
                    {sym}
                </th>
            )
        }else{
            headers.push(
                <th key={'header-'+item} id={item} className="data-column" style={style} data-term={item} onClick={sortColumn}>{fields.byTerm[item].name}</th>
            )
        }
    });
    //add column list button
    headers.push(
        <th key={'header-select'} style={{width: '80px', fontSize: '10px', textAlign: 'center'}}>
            <button className="pull-left" data-toggle="modal" data-target="#column-list">
                Columns
            </button>
        </th>
    )
    results.forEach(function(item,index){
        var tds = [];
        cols.forEach(function(name,ind){
            var val;
            if(_.isUndefined(fields.byTerm[name].dataterm)){
                val = helpers.check(item.indexTerms[name]);
            }else if( _.isUndefined(fields.byTerm[name].dataterm) === false && _.isUndefined(item.indexTerms[name]) === false && _.isUndefined(item.data[fields.byTerm[name].dataterm])){
                val = helpers.check(item.indexTerms[name]);
            }else{
                val = helpers.check(item.data[fields.byTerm[name].dataterm]);
            }

            if(_.isEmpty(val)){
                val = <span className="no-data">no data</span>;
            }

            tds.push(<td key={'row-'+index+'-cell-'+ind}>{val}</td>);
        })
        //add openrecord column
        tds.push(<td key={'row-'+index+'-open'} className="open"><a className="pull-left" href={'/portal/records/'+item.uuid} target="_blank" id={item.uuid} onClick={openRecord} title="view full record">view</a></td>);
        rows.push(
            <tr key={'row-'+index}>
                {tds}
            </tr>
        );
    })
    if(loading){
        rows.push(
            <tr key={'loading-row'} className="no-results-row">
                <td colSpan={cols.length+1}>
                    <i className="spinner" />
                </td>
            </tr>
        );
    }else if(rows.length===0){
        rows.push(<tr key={'row-no-results'} className="no-results-row"><td colSpan={cols.length+1}>No Matching Records</td></tr>)
    }

    //column selection modal list
    var list=[];
    //sort list
    //fgroups.push(<option value="0">select a field</option>);

    _.each(fields.searchGroups,function(val){
        var group = [];
        group.push(
            <tr key={val}><td className="bold">{fields.groupNames[val]}</td></tr>
        )
        _.each(fields.byGroup[val],function(field){
            if(field.hidden && !field.results){
                //noop
            }else{
                var disabled=false,checked=false;
                if(cols.indexOf(field.term) > -1){
                    checked=true;
                    if(cols.length===1){
                        disabled=true;
                    }
                }
                group.push(
                    <tr key={'column-select-'+field.term}>
                        <td>
                            <label>
                                <input name={field.term} onChange={columnCheckboxClick} type="checkbox" checked={checked} disabled={disabled} /> {field.name}
                            </label>
                        </td>
                    </tr>
                )
            }
        });
        list.push(<table key={"group-"+val} className="group-table"><tbody>{group}</tbody></table>)
    });

    return(
        <div id="result-list" className="panel">
            <div id="column-list" className="modal fade">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <label>List Results Columns</label>
                            <button type="button" onClick={resetColumns} id="reset" className="" aria-label="Reset columns to default">
                                Reset
                            </button>
                            <button type="button" className="close pull-right" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body clearfix">

                            {list}

                        </div>

                        <div className="modal-footer">

                        </div>
                    </div>
                </div>
            </div>
            <table id="data-table" className="table table-condensed">
                <thead>
                <tr id="results-headers">{headers}</tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </table>
        </div>
    )

};

class ResultListColumnSelector extends React.Component{
    // getInitialState(){
    //     return {columns: this.props.columns};
    // }
    constructor(props) {
        super(props)
        this.state = {
            columns: props.columns
        }
    }
    addColumn(){
        var cols = this.state.columns;
        cols.push('none');
        this.setState({columns: cols});
    }
    moveColumn(e){
        e.preventDefault();
        var cols = this.state.columns;
        var name = e.target.attributes['data-column'].value;
        var ind = parseInt(e.target.attributes['data-index'].value);
        var mov = cols.splice(ind,1);
        if(e.target.attributes['data-move'].value == 'up'){
            ind--;
        }else{
            ind++;
        }
        cols.splice(ind,0,name);
        this.setState({columns: cols},function(){
            this.setColumns();
        })
    }
    setColumns(){
        this.props.setColumns(_.without(this.state.columns,'none'));
    }
    resetColumns(){
        this.setState({columns: this.defaultColumns()},function(){
            this.setColumns();
        })
    }
    defaultColumns(){
        return ['family','scientificname','datecollected','country','institutioncode','basisofrecord'];
    }
    removeColumn(e){
        e.preventDefault();
        var name = e.currentTarget.attributes['data-column'].value;
        var cols = this.props.columns;
        if(cols.length > 1){
            cols.splice(parseInt(e.currentTarget.attributes['data-index'].value),1);
            this.setState({columns: cols},function(){
                this.setColumns();
            });
        }
    }
    selectChange(e){
        e.preventDefault();
        var cols = this.state.columns;
        cols[parseInt(e.target.attributes['data-index'].value)] = e.target.value;
        this.setState({columns: cols},function(){
            this.setColumns();
        })
    }
    UNSAFE_componentWillMount(){
        this.colCount = this.props.columns.length;
    }
    render(){

        var self = this, selects = [];

        _.each(self.state.columns, function(column,ind){
            if(column==='none'){
                var nonesel = true;
            }else{
                nonesel = false;
            }
            var fgroups = [<option key="none" value="none" data-index={ind}>Select a field</option>];
            _.each(fields.searchGroups,function(val){
                var fltrs = [];
                _.each(fields.byGroup[val],function(field){
                    if(field.hidden){
                        //noop
                    }else{

                        var selected = field.term == column ? true : false;
                        var disabled = (self.props.columns.indexOf(field.term) > -1 && selected == false) ? 'disabled' : '';
                        fltrs.push(
                            <option disabled={disabled} data-index={ind} value={field.term} key={field.term}>
                                {field.name}
                            </option>
                        );
                    }
                });
                fgroups.push(
                    <optgroup key={val} label={fields.groupNames[val]}>
                        &nbsp;&nbsp;{fltrs}
                    </optgroup>
                );
            });
            var updisabled = ( ind === 0 );
            var downdisabled = ( ind === self.state.columns.length-1 );
            selects.push(
                <div key={column+'-'+ind} className="column-select-wrapper clearfix">
                    <div className="up-down">
                        <button className="btn up" title="move up" aria-label="Move column up" data-index={ind} disabled={updisabled} data-column={column} data-move={'up'} onClick={self.moveColumn}></button>
                        <button className="btn down" title="move down" aria-label="Move column down" data-index={ind} disabled={downdisabled} data-column={column} data-move={'down'} onClick={self.moveColumn}></button>
                    </div>
                    <select key={column+'-selector'} data-index={ind} name={column} value={column} className="form-control column-select" onChange={self.selectChange} aria-label={`Column ${ind + 1} field selector`}>
                        {fgroups}
                    </select>
                    <button className="btn remove " data-index={ind} disabled={(self.props.columns.length < 2)} title="remove column" aria-label="Remove column" data-column={column} onClick={self.removeColumn}>
                        <i className="glyphicon glyphicon-minus"/>
                    </button>
                </div>
            );
        });

        var trans;
        if(this.colCount !== this.props.columns.length){
            trans = true;
            this.colCount = this.props.columns.length;
        }else{
            trans = false
        }

        /*return(
            <div className="modal-body clearfix" >
                <ReactCSSTransitionGroup transitionEnter={trans} transitionLeave={trans} transitionName="column-select-trans">
                {selects}
                </ReactCSSTransitionGroup>
            </div>
        );*/
        return(
            <div className="modal-body clearfix" >
                <button type="button" onClick={this.addColumn} className="" aria-label="Add column">
                    Add <i className="glyphicon glyphicon-plus"/>
                </button>
                <button type="button" onClick={this.resetColumns} className="" aria-label="Reset columns to default">
                    Reset
                </button>
                {selects}
            </div>
        );
    }
};

const ResultsLabels = ({results, loading, stamp}) => {

    function makeLabel(result,id){
        var data = result.indexTerms, raw = result.data;
        var txt = '';
        var content = [], middle = [];
        var title = '', info = [];
        //build title
        //var index = this.props.data.indexTerms, data=this.props.data.data;
        if(_.has(data,'scientificname')) {
            title = _.capitalize(data['scientificname']);
        }else if(_.has(data, 'genus')){
            title = _.capitalize(data['genus']);
            if(_.has(data, 'specificepithet')){
                title += ' '+data['specificepithet'];
            }
        }
        if(_.isEmpty(title)){
            title = <em>No Name</em>;
        }
        var auth='';
        if(_.has(raw, 'dwc:scientificNameAuthorship')){
            auth = <span key="author" className="author">{raw['dwc:scientificNameAuthorship']}</span>;
        }

        var family='';
        if(_.has(data,'family')){
            family= _.capitalize(data.family);
        }

        var formatedDC='';
        if(_.has(data, 'datecollected')){
            var d = new Date(data['datecollected']);
            // Most of the stored dates don't have a Time Zone, so are treated as UTC. Increment the time by the timezone offset, otherwise most displayed values would be displayed as one day early
            d.setTime(d.getTime() + d.getTimezoneOffset() * 60000);
            formatedDC = d.getFullYear() + '-' + ((d.getMonth() < 9) ? '0' + (d.getMonth() + 1) : d.getMonth() + 1 ) + '-' + ((d.getDate() < 10) ? '0' + d.getDate() : d.getDate());
            content.push(<span key="event-date2" className="date">{formatedDC}</span>);
        }

        var l=[];
        ['dwc:country','dwc:stateProvince','dwc:county','dwc:locality'].forEach(function(item){
            if(_.has(raw,item)){
                l.push(raw[item])
            }
        })
        if(l.length>0){
            middle.push(
                <span key="locality" className="locality">{l.join(', ')}</span>
            );
        }
        if(_.has(data, 'geopoint')){
            middle.push(<span key="geopoint" className="geopoint" dangerouslySetInnerHTML={{__html: '<b>Lat:</b> '+ helpers.convertDecimalDegrees(data.geopoint.lat)+ '&nbsp;&nbsp; <b>Lon:</b> '+ helpers.convertDecimalDegrees(data.geopoint.lon)}}></span>);
        }
        var c=[],tits=['Institution','Collection','Catalog Number'];
        ['dwc:institutionCode','dwc:collectionCode','dwc:catalogNumber','dwc:recordedBy'].forEach(function(item,index){
            if(_.has(raw,item)){
                c.push(raw[item])
            }
        })
        if(c.length>0){
            middle.push(<span key="collection" className="collection">{c.join(', ')}</span>)
        }
        if(middle.length>0){
            content.push(
                <span key="middle" className="middle">
                    {middle}
                </span>
            )
        }
        var taxa=[];
        ['kingdom','phylum','class','order'].forEach(function(item){
            if(_.has(data,item)){
                taxa.push(_.capitalize(data[item]));
            }
        });
        if(taxa.length>0){
            content.push(<span key="higher" className="highertaxa">{taxa.join(', ')}</span>);
        }

        if( data.hasImage ){
            var imgcount,img;
            if(data.mediarecords.length > 1){
                imgcount = (
                    <span key="image-count" className="image-count">
                        {data.mediarecords.length}
                    </span>
                )
            }else{
                imgcount = <span/>;
            }

            img = (
                <span
                    key={'media-'+result.uuid+stamp}
                    className="image-wrapper"
                    id={data.mediarecords[0]}
                    onClick={openMedia}
                    title="click to open media record"
                    aria-label="View media record" >
                    {imgcount}
                    <img
                        onError={errorImage}
                        className="pull-right label-image"
                        alt={typeof title === 'string' ? title : 'Specimen image'}
                        src={idbapi.media_host + "v2/media/"+data.mediarecords[0]+"?size=thumbnail"} />
                </span>
            )
        }

        return (
            <div key={'label-'+id}  className="pull-left result-item result-label" >
                <h5 className="title" title="click to open record"><a className='title-link' href={'/portal/records/'+result.uuid} target={result.uuid}>{title}&nbsp;{auth}</a></h5>
                <h5 className="family">{family}</h5>
                {img}
                <p className="content">
                    {content}
                </p>
            </div>
        )
    }
    function errorImage(e){
        //debugger
        e.target.attributes['src'].value='/portal/img/missing.svg';
    }
    function openMedia(e){
        e.preventDefault();
        window.open('/portal/mediarecords/'+e.currentTarget.id,'_blank');
    }
    function openRecord(e){
        e.preventDefault();
        window.open('/portal/records/'+e.currentTarget.id,'_blank');
    }

    var labels = []
    results.forEach(function(result,ind){
        labels.push(makeLabel(result,result.uuid));
    })
    if(labels.length===0 && loading===false){
        labels.push(
            <div key="no-records" className="no-records">
                <h4>No Matching Records</h4>
            </div>
        );
    }
    if(loading){

        labels.push(
            <div key={'loading-div'} className="label-loading clearfix pull-left">
                <i className="spinner" />
            </div>
        )
    }
    return (
        <div id="result-labels" className="panel">
            {labels}
        </div>
    )

};

const ResultsImages = memo(({loadingProp, resultsProp, search}) => {
    const [results, setResults] = useState(resultsProp)
    const [loading, setLoading] = useState(loadingProp)

    // useEffect(() => {
    //     setResults(resultsProp)
    // }, [resultsProp]);
    const getImageOnlyResults = (search) => {
        console.log(search)
        var d = new Date();
        var self = this;
        var searchState = _.cloneDeep(search);
        searchState.image = true;
        var query = queryBuilder.makeSearchQuery(searchState);
        var now = d.getTime();
        let lastQueryTime = now;
        setLoading(true);
        idbapi.search(query, function(response) {
            // Make sure last query run is the last one that renders
            // As responses can be out of order
            if (now >= lastQueryTime) {
                var res;
                if (searchState.from > 0) {
                    res = results.concat(response.items);
                } else {
                    res = response.items;
                }
                setResults(res);
                setLoading(false);
                // self.setState({results: res, loading: false}, function(){
                //     self.forceUpdate();
                // });
            }
        });
    };

    function errorImage(e){
        e.target.attributes['src'].value = '/portal/img/missing.svg';
    }
    // function componentDidMount(){
    //     if(!search.image){
    //         getImageOnlyResults(search);
    //     }
    // }
    useEffect(() => {
        // if(search.image) {
        //     setResults(search.results);
        //     setLoading(false);
        // } else {
        getImageOnlyResults(search);
        // }
    }, [search]);

    // function UNSAFE_componentWillReceiveProps(nextProps){
    //     if(nextProps.search.image){
    //         setResults(nextProps.results)
    //         setLoading(false)
    //     }else{
    //         getImageOnlyResults(nextProps.search);
    //     }
    // }
    function makeImageText(data){

    }
    function makeImage(uuid,record){
        var count = record.indexTerms.mediarecords.indexOf(uuid)+1 + ' of '+ record.indexTerms.mediarecords.length;
        var name=[], specimen = record.data, index=record.indexTerms;
        if(typeof index.scientificname == 'string') {
            name.push(index.scientificname);
        }else{
            name.push(index.genus);
            name.push(index.specificepithet);
        }
        name.push(specimen["dwc:scientificnameauthorship"]);
        _.pull(name,undefined);
        var text=_.without([specimen['dwc:institutionCode'],specimen['dwc:collectionCode'],specimen['dwc:eventdate']],undefined);

        return (
            <a className="image" target={uuid} href={"/portal/mediarecords/"+uuid} key={'a-'+uuid+_.random(999999)}>
                <span className="img-count">{count}</span>
                <img alt={name.join(' ')}
                     src={idbapi.media_host + "v2/media/"+uuid+"?size=thumbnail"}
                     onError={errorImage}/>
                <div className="gallery-image-text">
                    <div className="image-text">
                        <span className="title">{_.capitalize(name.join(' '))}</span>
                        <span className="">{text.join(', ')}</span>
                    </div>
                </div>
            </a>
        )
    }

    var images=[],self=this,key=0;
    results.forEach(function(record,index){
        if(_.isArray(record.indexTerms.mediarecords)){
            record.indexTerms.mediarecords.forEach(function(uuid){
                images.push(makeImage(uuid,record));
                key++;
            })
        }
    });

    if(images.length === 0 && !loading){
        images.push(
            <div key="no-images" className="no-images">
                <h4>No Media Available</h4>
            </div>
        )
    }
    if(loading){
        images.push(
            <div key="loading-images" id="loading-images" className="clearfix">
                <i className="spinner" />
            </div>
        )
    }
    return (
        <div id="results-images" className="panel">
            <div id="images-wrapper" className="clearfix">
                {images}
            </div>
        </div>
    )

});

const Providers = ({attribution}) => {

    var list = _.map(attribution, function(item){
        return (
            <tr key={'record-'+item.uuid}>
                <td><a href={"/portal/recordsets/"+item.uuid} target={'_'+item.uuid}>{item.name}</a></td>
                <td>{helpers.formatNum(item.itemCount)}</td>
                <td className="desc" dangerouslySetInnerHTML={{__html: item.description}}></td>
            </tr>
        );
    });

    return (
        <div id="provider-results" className="panel">
            <table className="table table-condensed table-striped">
                <thead>
                <tr><th id="rset">Recordset</th><th id="rcount">Records in results</th><th id="rdesc">Description</th></tr>
                </thead>
                <tbody>
                {list}
                </tbody>
            </table>
        </div>
    )

}
Results.displayName = 'Results';
export default Results;