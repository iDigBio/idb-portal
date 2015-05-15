
var React = require('react');
var idbapi = require('../../../lib/idbapi');
React.initializeTouchEvents(true);

module.exports = Results =  React.createClass({displayName: "Results",

    getInitialState: function(){
        //this.getResults();

        return {results: [], total: 0, search: this.props.search, hasMore: false, loading: true};
    },
    shouldComponentUpdate: function(nextProps, nextState){
        //
        if(nextProps.view!==this.props.view){
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
            //self.setState({results: []})
            var d = new Date, searchState = self.state.search, query = queryBuilder.makeSearchQuery(searchState);
            var now = d.getTime();
            self.lastQueryTime = now;
            //self.setState({loading: true});
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
                    self.setState({results: res, total: response.itemCount, hasMore: more, loading: false},function(){
                        self.forceUpdate();
                    });
                }
            })
        },300,{leading: true, trailing: true});
    },
    componentDidMount: function(){
        window.onscroll = this.resultsScroll;
        this.getResults(this.props.search);
    },
    componentWillReceiveProps: function(nextProps){
        //component should only recieve search as props
        //debugger
        //var isNewSearch =  _.isEqual(this.props.search, nextProps.search);
       // if(isNewSearch){
            this.setState({search: _.cloneDeep(nextProps.search), loading: true},function(){
                this.forceUpdate();
                this.getResults(this.state.search); 
            });
       // }
    },
    viewChange: function(event){
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
        var search = this.props.search, self=this, li=[];
        switch(this.props.view){
            case 'list':
                results = React.createElement(ResultsList, {
                            search: this.state.search, results: this.state.results, 
                            searchChange: this.props.searchChange, loading: this.state.loading});
                break;
            case 'labels':
                results = React.createElement(ResultsLabels, {results: this.state.results, loading: this.state.loading});
                break;
            case 'images':
                results = React.createElement(ResultsImages, {search: this.state.search, results: this.state.results, loading: this.state.loading});
                break;
        }
        ['list','labels','images'].forEach(function(item){
            var cl = item == self.props.view ? 'active' : ''; 
            li.push(
                React.createElement("li", {key: 'tab-'+item, onClick: self.viewChange, "data-value": item, className: cl}, helpers.firstToUpper(item))
            )
        })
        if(this.state.search.from + this.state.search.size < this.state.total){
            $('footer').hide();
        }else{
            $('footer').show();
        }        
        return(
            React.createElement("div", {id: "results", className: "clearfix", onScroll: this.resultsScroll}, 
                React.createElement("ul", {id: "results-menu", className: "pull-left"}, 
                    li
                ), 
                React.createElement("div", {className: "pull-right total"}, 
                    "Total: ", helpers.formatNum(parseInt(this.state.total))
                ), 
                results
            )
        )
    }
});
var sortClick=false;
var ResultsList = React.createClass({displayName: "ResultsList",
    
    getInitialState: function(){
        if(_.isUndefined(localStorage) || _.isUndefined(localStorage.viewColumns)){
            var cols = this.defaultColumns();
            localStorage.setItem('viewColumns',JSON.stringify({'columns': cols}));
            return {columns: cols};
        }else{
            return {columns: JSON.parse(localStorage.getItem('viewColumns')).columns};
        }
    },
    defaultColumns: function(){
        return ['genus','specificepithet','datecollected','institutioncode'];
    },
    setColumns: function(columns){
        this.setState({columns: columns});
        if(localStorage){
            localStorage.setItem('viewColumns',JSON.stringify({'columns':columns}));
        }
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
    resetColumns: function(){
        this.setColumns(this.defaultColumns());
    },
    sortColumn: function(e){
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
    /*setSortable: function(){
        var self=this;
        $('#results-headers').sortable({
            update: function(event,ui){
                var headers = this;
                var cols = $(this).sortable('toArray');
                $(headers).sortable('destroy');
                self.setColumns(cols);

            },
            items: "> .data-column",
            containment: 'parent'
        });
    },
    componentDidMount: function(){
        //this.setSortable();
    },
    componentDidUpdate: function(){
        //this.setSortable();
    },*/
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
                    sym = React.createElement("i", {className: "spinner"});
                    sortClick=false;
                }else{
                    sym = React.createElement("i", {className: "glyphicon "+icon});
                }
                headers.push(
                    React.createElement("th", {key: 'header-'+item, id: item, className: "data-column", style: style, "data-term": item, "data-sort": sorted.order, onClick: self.sortColumn}, 
                        fields.byTerm[item].name, 
                        sym
                    )
                ) 
            }else{
                headers.push(
                    React.createElement("th", {key: 'header-'+item, id: item, className: "data-column", style: style, "data-term": item, onClick: self.sortColumn}, fields.byTerm[item].name)
                ) 
            }
        });
        //add column list button
        headers.push(
            React.createElement("th", {key: 'header-select', style: {width: '60px'}}, 
                React.createElement("button", {className: "pull-left", "data-toggle": "modal", "data-target": "#column-list"}, 
                    React.createElement("i", {className: "glyphicon glyphicon-list"})
                )
            )
        )
        this.props.results.forEach(function(item,index){
            var tds = [];
            columns.forEach(function(name,ind){
                var val;
                if(_.isUndefined(fields.byTerm[name].dataterm)){
                    val = helpers.check(item.indexTerms[name]);
                }else{
                    val = helpers.check(item.data[fields.byTerm[name].dataterm]);
                }

                if(_.isEmpty(val)){
                    val = React.createElement("span", {className: "no-data"}, "no data");
                }

                /*if(columns.length-1 === ind){
                    tds.push(<td key={'row-'+index+'-cell-'+ind} colSpan="2">{val}</td>);
                }else{
                    tds.push(<td key={'row-'+index+'-cell-'+ind}>{val}</td>);
                }*/
                tds.push(React.createElement("td", {key: 'row-'+index+'-cell-'+ind}, val));
            })
            //add openrecord column
            tds.push(React.createElement("td", {key: 'row-'+index+'-open', className: "open"}, React.createElement("button", {className: "pull-left", title: "view full record"}, React.createElement("i", {className: "glyphicon glyphicon-eye-open"}))));
            rows.push(
                React.createElement("tr", {key: 'row-'+index, id: item.uuid, onClick: self.openRecord}, 
                    tds
                )
            );
        })
        if(this.props.loading){
            rows.push(
                React.createElement("tr", {key: 'loading-row', className: "no-results-row"}, 
                    React.createElement("td", {colSpan: columns.length+1}, 
                        React.createElement("i", {className: "spinner"})
                    )
                )
            );
        }else if(rows.length===0){
            rows.push(React.createElement("tr", {key: 'row-no-results', className: "no-results-row"}, React.createElement("td", {colSpan: columns.length+1}, "No Matching Records")))
        }
        //column selection modal list
        var list=[];
        //sort list
        //fgroups.push(<option value="0">select a field</option>);

        _.each(fields.searchGroups,function(val){
            list.push(
                React.createElement("tr", {key: val}, React.createElement("td", {className: "bold"}, fields.groupNames[val]))
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
                    list.push(
                        React.createElement("tr", {key: 'column-select-'+field.term}, 
                            React.createElement("td", null, 
                                React.createElement("label", null, 
                                    React.createElement("input", {name: field.term, onChange: self.columnCheckboxClick, type: "checkbox", checked: checked, disabled: disabled}), " ", field.name
                                )
                            )
                        )
                    )
                }
            });
        });

        return(
            React.createElement("div", {id: "result-list", className: "panel"}, 
                React.createElement("div", {id: "column-list", className: "modal fade"}, 
                    React.createElement("div", {className: "modal-dialog"}, 
                        React.createElement("div", {className: "modal-content"}, 
                            React.createElement("div", {className: "modal-header"}, 
                                React.createElement("label", null, "Select Display Columns"), 
                                React.createElement("button", {onClick: this.resetColumns, id: "reset"}, 
                                    "Reset"
                                ), 
                                React.createElement("button", {type: "button", className: "close pull-right", "data-dismiss": "modal"}, 
                                    React.createElement("span", {"aria-hidden": "true"}, "×")
                                )
                            ), 
                            React.createElement("div", {className: "modal-body"}, 
                                React.createElement("table", null, 
                                    list
                                )
                            ), 
                            React.createElement("div", {className: "modal-footer"}

                            )
                        )
                    )
                ), 
                React.createElement("table", {id: "data-table", className: "table table-condensed"}, 
                    React.createElement("thead", null, 
                        React.createElement("tr", {id: "results-headers"}, headers)
                    ), 
                    React.createElement("tbody", null, 
                        rows
                    )
                )
            )
        )
    }
});

var ResultsLabels = React.createClass({displayName: "ResultsLabels",
    makeLabel: function(result,id){
        var data = result.indexTerms, raw = result.data;
        var txt = '';
        var content=[];
        if(typeof data.scientificname == 'string') { 
            txt += helpers.check(raw["dwc:scientificName"]) + helpers.check(raw["dwc:scientificNameAuthorship"]);
            content.push(
                React.createElement("em", null, 
                    React.createElement("b", null, 
                      helpers.check(raw["dwc:scientificName"])
                    )
                )          
            );
            content.push(
                React.createElement("span", null,  helpers.check(raw["dwc:scientificNameAuthorship"], ' ') ) 
            );
         
        } else {  
            //txt += helpers.check(raw["dwc:genus"]) + helpers.check(raw["dwc:specificEpithet"]) + helpers.check(raw["dwc:scientificNameAuthorship"]);
            content.push(
                React.createElement("em", null, 
                   React.createElement("b", null, 
                helpers.check(raw["dwc:genus"]) + helpers.check(raw["dwc:specificEpithet"],' ')
                   )
                )
            )
            content.push(
               React.createElement("span", null, helpers.check(raw["dwc:scientificNameAuthorship"], ' '))
            )
        } 

  
        if( data.hasImage ){ 
            var imgcount;
            if(data.mediarecords.length > 1){ 
                imgcount = (
                    React.createElement("span", {className: "image-count"}, 
                        data.mediarecords.length
                    )
                )
            }else{
                imgcount = React.createElement("span", null);
            } 
            content.push(
                React.createElement("span", {key: 'media-'+result.uuid+this.props.stamp, className: "image-wrapper"}, 
                    imgcount, 
                    React.createElement("img", {"data-onerror": "$(this).attr('src','/portal/img/notavailable.png')", "data-onload": "$(this).attr('alt','image thumbnail')", className: "pull-right label-image", alt: " loading image...", src: "https://api.idigbio.org/v1/records/"+result.uuid+"/media?quality=thumbnail"})
                )  
            )
     
         } 
        var terms = ['kingdom','phylum','class','order','family','country', 'stateprovince','locality','collector','fieldnumber','datecollected','institutioncode','collectioncode'];

        var para = []
        _.each(terms,function(term){
            if(helpers.check(raw[fields.byTerm[term].dataterm]) !== ''){
                if(term === 'datecollected'){
                    para.push(raw[fields.byTerm[term].dataterm].substring(0,10));
                }else{
                    para.push(raw[fields.byTerm[term].dataterm])
                }
            }
        })
        var clean = para.filter(function(i){
            return !_.isEmpty(i);
        });
        var out = clean.join(', ');
        if ((txt+out).length > 255) {
            out = out.substring(0, out.length-txt.length);// + ' ...';
        }
      
        return (
            React.createElement("div", {key: 'label-'+id, id: result.uuid, className: "pull-left result-item result-label", title: "click to view record", onClick: this.openRecord}, 
                React.createElement("p", null, 
                   content, 
                    React.createElement("span", {style: {lineHeight: '1em', fontSize:'1em'}}, 
                        " ", out
                    )
                )
            )
        )
    },
    openRecord: function(e){
        window.open('/portal/records/'+e.currentTarget.id,'_blank');
    },
    render: function(){
        var labels = [],self=this;
        this.props.results.forEach(function(result,ind){
            labels.push(self.makeLabel(result,'label-'+ind));
        })
        if(this.props.loading){
            
            labels.push(
                React.createElement("div", {key: 'loading-div', className: "label-loading clearfix pull-left"}, 
                    React.createElement("i", {className: "spinner"})
                )
            )
        }
        return (
            React.createElement("div", {id: "result-labels", className: "panel"}, 
                labels
            )
        )
    }
});

var ResultsImages = React.createClass({displayName: "ResultsImages",
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
    errorImage: function(event){

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
    makeImage: function(uuid,record,key){
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
        var text=_.without([index.institutioncode,index.collectioncode,specimen['dwc:eventdate']],undefined);

        return (
            React.createElement("a", {className: "image", target: uuid, href: "/portal/mediarecords/"+uuid, key: 'image-'+key}, 
                React.createElement("span", {className: "img-count"}, count), 
                React.createElement("img", {alt: "loading...", 
                src: "https://api.idigbio.org/v1/mediarecords/"+uuid+"/media?quality=thumbnail", 
                onError: this.errorImage}), 
                React.createElement("div", {className: "gallery-image-text"}, 
                    React.createElement("div", {className: "image-text"}, 
                        React.createElement("span", {className: "title"}, _.capitalize(name.join(' '))), 
                        React.createElement("span", {className: ""}, text.join(', '))
                    )
                )
            )
        )
    },
    render: function(){
        var images=[],self=this,key=0;
        this.state.results.forEach(function(record,index){
            if(_.isArray(record.indexTerms.mediarecords)){
                record.indexTerms.mediarecords.forEach(function(uuid){
                    images.push(self.makeImage(uuid,record,key));
                    key++;
                })
            }
        });
        if(images.length === 0 && !self.state.loading){
            images.push(
                React.createElement("div", {className: "no-images"}, 
                    React.createElement("h4", null, "No Images Available")
                )
            )
        }
        if(self.state.loading){
            images.push(
                React.createElement("div", {key: "loading-images", id: "loading-images", className: "clearfix"}, 
                    React.createElement("i", {className: "spinner"})
                )
            )
        }
        return (
            React.createElement("div", {id: "results-images", className: "panel"}, 
                React.createElement("div", {id: "images-wrapper", className: "clearfix"}, 
                    images
                )
            )
        )
    }
});