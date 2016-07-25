var React = require('react');
var idbapi = require('../../../lib/idbapi');
var queryBuilder = require('../../../lib/querybuilder');
var PureRender = require('react-addons-pure-render-mixin');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

var Results = module.exports =  React.createClass({
    //mixins: [PureRender],
    lastQueryStringed: '',
    getInitialState: function(){
        //this.getResults();

        return {results: [], attribution: [], total: 0, search: this.props.search, hasMore: false, loading: true};
    },
    shouldComponentUpdate: function(nextProps, nextState){

        if(nextProps.view !== this.props.view){
            return true;
        }else{
            return false;
        }
    },
    componentWillMount: function(){
        var self=this;
        this.lastQueryTime = 0;
        /*this results getter attempts to minimize excessive results queries with lots of key strokes
        and ensures that the last key press results in the proper set of results as responses can be out of 
        order*/
        this.getResults = _.debounce(function(){
         
            var d = new Date, searchState = self.state.search, query = queryBuilder.makeSearchQuery(searchState);
            var now = d.getTime();
            //constant passing of props forces many unncessary requests. This cheap method checks
            //see if there truely is a new query to run

            if(JSON.stringify(query) !== self.lastQueryStringed){
                //setting results to empty array forces
                //spinner to show for new searches
                //THESE state change tricks should not happen anywhere else
                if(searchState.from === 0){
                    self.setState({results: [], loading: true})
                }
                self.lastQueryTime = now;
                idbapi.search(query,function(response){
                    if(now>= self.lastQueryTime){
                        var res, more=false;
                        if(searchState.from > 0){
                            res = self.state.results.concat(response.items);
                        }else{
                            res = response.items;
                        }
                        if(response.itemCount > (searchState.from+searchState.size)){
                            more=true;
                        }
                        self.setState({results: res, attribution: response.attribution, total: response.itemCount, hasMore: more, loading: false},function(){
                            self.forceUpdate();
                        });
                    }
                })
            }
            
            self.lastQueryStringed = JSON.stringify(query);


        },700,{leading: true, trailing: true});
    },
    componentDidMount: function(){
        window.onscroll = this.resultsScroll;
        this.getResults(this.props.search);
    },
    componentWillReceiveProps: function(nextProps){
        //component should only recieve search as props
        //debugger
        //var isNewSearch =  _.isEqual(this.props.search, nextProps.search);
       
       //if(!_.isEqual(nextProps.search,this.props.search)){
            this.setState({search: _.cloneDeep(nextProps.search)},function(){
                this.forceUpdate();
                this.getResults(this.state.search); 
            });
       //}
    },
    viewChange: function(event){
        event.preventDefault();
        var view = event.currentTarget.attributes['data-value'].value;
        this.props.viewChange('resultsTab', view);
    },
    //this is not a synthentic event
    resultsScroll: function(e){
        var search = _.cloneDeep(this.state.search);

        if(this.state.total > search.from + search.size){
            if($(window).scrollTop() + 40 >= $(document).height() - $(window).height()){
                search.from += search.size;
                this.setState({search: search, loading: true},function(){
                   this.forceUpdate();
                   this.getResults(); 
                }); 
            }
        }
    },
    loadMoreResults: function(){
        var search = _.cloneDeep(this.state.search);

        if(this.state.total > search.from + search.size){
            search.from += search.size;
            this.setState({search: search, loading: true},function(){
               this.getResults(); 
            }); 
        }
    },
    render: function(){
        var search = this.props.search, self=this, li=[], results = null;
        switch(this.props.view){
            case 'list':
                results = <ResultsList 
                            search={this.state.search} results={this.state.results} 
                            searchChange={this.props.searchChange} loading={this.state.loading} />;
                break;
            case 'labels':
                results = <ResultsLabels results={this.state.results} loading={this.state.loading} />;
                break;
            case 'media':
                results = <ResultsImages search={this.state.search} results={this.state.results} loading={this.state.loading} />;
                break;
            case 'recordsets':
                results = <Providers attribution={this.state.attribution} />;
                break;
        }
        ['list','labels','media','recordsets'].forEach(function(item){
            var cl = item == self.props.view ? 'active' : ''; 
            li.push(
                <li key={'tab-'+item} onClick={self.viewChange} data-value={item} className={cl}>{helpers.firstToUpper(item)}</li>
            )
        })
        if(this.state.search.from + this.state.search.size < this.state.total){
            $('footer').hide();
        }else{
            $('footer').show();
        }        
        return(
            <div id="results" className="clearfix" onScroll={this.resultsScroll}>
                <ul id="results-menu" className="pull-left">
                    {li}
                </ul> 
                <div className="pull-right total">
                    Total: {helpers.formatNum(parseInt(this.state.total))}
                </div>
                {results}
            </div>
        )
    }
});

var sortClick=false;
var ResultsList = React.createClass({
    mixins: [PureRender],
    getInitialState: function(){
        if(_.isUndefined(localStorage) || _.isUndefined(localStorage.viewColumns)){
            var cols = this.defaultColumns();
            localStorage.setItem('viewColumns',JSON.stringify({'columns': cols}));
            return {columns: cols};
        }else{
            return {columns: JSON.parse(localStorage.getItem('viewColumns')).columns};
        }
    },
    resetColumns: function(){
            this.setColumns(this.defaultColumns());
    },
    defaultColumns: function(){
        return ['family','scientificname','datecollected','country','institutioncode','basisofrecord'];
    },
    setColumns: function(columns){
        this.setState({columns: columns},function(){
            this.forceUpdate();
            if(localStorage){
                localStorage.setItem('viewColumns',JSON.stringify({'columns':columns}));
            }
        });
    },
    columnCheckboxClick: function(e){
        var columns = _.cloneDeep(this.state.columns);
        if(e.currentTarget.checked===true){
            columns.push(e.currentTarget.name);
        }else{
            columns.splice(columns.indexOf(e.currentTarget.name),1);
        }
        this.setColumns(columns);
    },
    addColumn: function(e){
        e.preventDefault();
        var self = this;
        var col = _.find(_.keys(fields.byTerm),function(name){
            return self.state.columns.indexOf(name)===-1 
        });
        var cols = this.state.columns;
        cols.unshift(col);
        this.setColumns(cols);
    },
    sortColumn: function(e){
        e.preventDefault();
        //sorted column sorts the top level sort value in search and new sorting items length
        //shall not exceed original length
        var dir, search = _.cloneDeep(this.props.search), name=e.currentTarget.attributes['data-term'].value,
        sort={name: name}, sorting=search.sorting, curlength = sorting.length;
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
        this.props.searchChange('sorting',sorting);
    },
    openRecord: function(e){
        e.preventDefault();
        e.stopPropagation();
        //to prevent opening if hiliting text
        
        if(window.getSelection().toString().length===0 || (e.target.nodeName=='I' || e.target.nodeName=='BUTTON')){
           window.open('/portal/records/'+e.currentTarget.id,e.currentTarget.id); 
        }
        
    },
    render: function(){
        var columns = this.state.columns,self=this;
     
       //['scientificname','genus','collectioncode','specificepithet','commonname'];
        var rows=[];
        var headers=[];
        //results table
        var sorted = _.isEmpty(self.props.search.sorting) ? {name: undefined} : self.props.search.sorting[0];
        var style={width: (Math.floor(100/columns.length))+'%'};
        columns.forEach(function(item){
            if(sorted.name===item){
                var icon = sorted.order == 'asc' ? 'glyphicon-chevron-up' : 'glyphicon-chevron-down';
                //sort click spinner
                var sym;
                if(self.props.loading && sortClick){
                    sym = <i className="spinner"></i>;
                    sortClick=false;
                }else{
                    sym = <i className={"glyphicon "+icon}></i>;
                }
                headers.push(
                    <th key={'header-'+item} id={item} className="data-column" style={style} data-term={item} data-sort={sorted.order} onClick={self.sortColumn}>
                        {fields.byTerm[item].name}
                        {sym}
                    </th>
                ) 
            }else{
                headers.push(
                    <th key={'header-'+item} id={item} className="data-column" style={style} data-term={item} onClick={self.sortColumn}>{fields.byTerm[item].name}</th>
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
        this.props.results.forEach(function(item,index){
            var tds = [];
            columns.forEach(function(name,ind){
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

                /*if(columns.length-1 === ind){
                    tds.push(<td key={'row-'+index+'-cell-'+ind} colSpan="2">{val}</td>);
                }else{
                    tds.push(<td key={'row-'+index+'-cell-'+ind}>{val}</td>);
                }*/
                tds.push(<td key={'row-'+index+'-cell-'+ind}>{val}</td>);
            })
            //add openrecord column
            tds.push(<td key={'row-'+index+'-open'} className="open"><a className="pull-left" id={item.uuid} onClick={self.openRecord} title="view full record">view</a></td>);
            rows.push(
                <tr key={'row-'+index}>
                    {tds}
                </tr>
            );
        })
        if(this.props.loading){
            rows.push(
                <tr key={'loading-row'} className="no-results-row">
                    <td colSpan={columns.length+1}>
                        <i className="spinner" />
                    </td>
                </tr>
            );
        }else if(rows.length===0){
            rows.push(<tr key={'row-no-results'} className="no-results-row"><td colSpan={columns.length+1}>No Matching Records</td></tr>)
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
                    if(columns.indexOf(field.term) > -1){
                        checked=true;
                        if(columns.length===1){
                            disabled=true;
                        }
                    }
                    group.push(
                        <tr key={'column-select-'+field.term}>
                            <td>
                                <label>
                                    <input name={field.term} onChange={self.columnCheckboxClick} type="checkbox" checked={checked} disabled={disabled} /> {field.name}
                                </label>
                            </td>
                        </tr>
                    )
                }
            });
            list.push(<table key={"group-"+group} className="group-table"><tbody>{group}</tbody></table>)
        });
        
        return(
            <div id="result-list" className="panel">
                <div id="column-list" className="modal fade">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <label>List Results Columns</label>
                                <button onClick={this.resetColumns} id="reset" className="">
                                    Reset
                                </button>
                                <button type="button" className="close pull-right" data-dismiss="modal">
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
        //<ResultListColumnSelector columns={this.state.columns} setColumns={this.setColumns} />
    }
});

var ResultListColumnSelector = React.createClass({
    getInitialState: function(){
        return {columns: this.props.columns};
    },
    addColumn: function(){
        var cols = this.state.columns;
        cols.push('none');
        this.setState({columns: cols});
    },
    moveColumn: function(e){
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
    },
    setColumns: function(){
        this.props.setColumns(_.without(this.state.columns,'none'));
    },
    resetColumns: function(){
        this.setState({columns: this.defaultColumns()},function(){
            this.setColumns();
        })
    },
    defaultColumns: function(){
        return ['family','scientificname','datecollected','country','institutioncode','basisofrecord'];
    },
    removeColumn: function(e){
        e.preventDefault();
        var name = e.currentTarget.attributes['data-column'].value;
        var cols = this.props.columns;
        if(cols.length > 1){
            cols.splice(parseInt(e.currentTarget.attributes['data-index'].value),1);
            this.setState({columns: cols},function(){
                this.setColumns();
            });
        }
    },
    selectChange: function(e){
        e.preventDefault();
        var cols = this.state.columns;
        cols[parseInt(e.target.attributes['data-index'].value)] = e.target.value;
        this.setState({columns: cols},function(){
            this.setColumns();
        })
    },
    componentWillMount: function(){
        this.colCount = this.props.columns.length;
    },
    render: function(){

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
                            <button className="btn up" title="move up" data-index={ind} disabled={updisabled} data-column={column} data-move={'up'} onClick={self.moveColumn}></button>
                            <button className="btn down" title="move down" data-index={ind} disabled={downdisabled} data-column={column} data-move={'down'} onClick={self.moveColumn}></button>
                        </div>
                        <select key={column+'-selector'} data-index={ind} name={column} value={column} className="form-control column-select" onChange={self.selectChange} >
                            {fgroups}
                        </select>
                        <button className="btn remove " data-index={ind} disabled={(self.props.columns.length < 2)}title="remove column" data-column={column} onClick={self.removeColumn}>
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
                <button onClick={this.addColumn} id="reset" className="">
                    Add <i className="glyphicon glyphicon-plus"/>
                </button>
                <button onClick={this.resetColumns} id="reset" className="">
                    Reset
                </button>
                {selects}
            </div>
        );
    }
});

var ResultsLabels = React.createClass({
    mixins: [PureRender],
    makeLabel: function(result,id){
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

        if(_.has(raw, 'dwc:eventDate')){
            content.push(<span key="event-date" className="date">{raw['dwc:eventDate']}</span>);
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
                    key={'media-'+result.uuid+this.props.stamp} 
                    className="image-wrapper" 
                    id={data.mediarecords[0]} 
                    onClick={this.openMedia} 
                    title="click to open media record" >
                    {imgcount}
                    <img
                        onError={this.errorImage}  
                        className="pull-right label-image" 
                        alt={title} 
                        src={idbapi.media_host + "v2/media/"+data.mediarecords[0]+"?size=thumbnail"} /> 
                </span>  
            )
        } 
      
        return (
            <div key={'label-'+id}  className="pull-left result-item result-label" >
                <h5 className="title" title="click to open record"><a href={'/portal/records/'+result.uuid} target={result.uuid}>{title}&nbsp;{auth}</a></h5>
                <h5 className="family">{family}</h5>
                {img}
                <p className="content">
                    {content}  
                </p>
            </div>
        )
    },
    errorImage: function(e){
        //debugger
        e.target.attributes['src'].value='/portal/img/missing.svg';
    },
    openMedia: function(e){
        e.preventDefault();
        window.open('/portal/mediarecords/'+e.currentTarget.id,'_blank');
    },
    openRecord: function(e){
        e.preventDefault();
        window.open('/portal/records/'+e.currentTarget.id,'_blank');
    },
    render: function(){
        var labels = [],self=this;
        this.props.results.forEach(function(result,ind){
            labels.push(self.makeLabel(result,result.uuid));
        })
        if(labels.length===0 && this.props.loading===false){
            labels.push(                
                <div key="no-records" className="no-records">
                    <h4>No Matching Records</h4>
                </div>
            );
        }
        if(this.props.loading){
            
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
    }
});

var ResultsImages = React.createClass({
    mixins: [PureRender],
    getImageOnlyResults: function(search){

        var d = new Date, self=this, searchState = _.cloneDeep(search);
        searchState.image=true;
        var query = queryBuilder.makeSearchQuery(searchState);
        var now = d.getTime();
        self.lastQueryTime = now;
        self.setState({loading: true})
        idbapi.search(query,function(response){
            //make sure last query run is the last one that renders
            //as responses can be out of order
            if(now>= self.lastQueryTime){
                var res;
                if(searchState.from > 0){
                    res = self.state.results.concat(response.items);
                }else{
                    res = response.items;
                }
                self.setState({results: res, loading: false},function(){
                    self.forceUpdate();
                });
            }
        });
    },
    getInitialState: function(){
        return {results: this.props.results, loading: false};
    },
    errorImage: function(e){
        e.target.attributes['src'].value = '/portal/img/missing.svg';
    },
    componentWillMount: function(){
        if(!this.props.search.image){
            this.getImageOnlyResults(this.props.search);
        }
    },
    componentWillReceiveProps: function(nextProps){
        if(nextProps.search.image){
            this.setState({results: nextProps.results, loading: false})
        }else{
            this.getImageOnlyResults(nextProps.search);
        }
    },
    makeImageText: function(data){

    },
    makeImage: function(uuid,record){
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
                onError={this.errorImage}/>
                <div className="gallery-image-text">
                    <div className="image-text">
                        <span className="title">{_.capitalize(name.join(' '))}</span>
                        <span className="">{text.join(', ')}</span>
                    </div>
                </div>
            </a>
        )
    },
    render: function(){
        var images=[],self=this,key=0;
        this.state.results.forEach(function(record,index){
            if(_.isArray(record.indexTerms.mediarecords)){
                record.indexTerms.mediarecords.forEach(function(uuid){
                    images.push(self.makeImage(uuid,record));
                    key++;
                })
            }
        });
        if(images.length === 0 && !self.state.loading){
            images.push(
                <div key="no-images" className="no-images">
                    <h4>No Media Available</h4>
                </div>
            )
        }
        if(self.state.loading){
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
    }
});

var Providers = React.createClass({
    render: function(){

        var list = _.map(this.props.attribution, function(item){
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
})