/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = Results =  React.createClass({displayName: 'Results',

    getInitialState: function(){
        //this.getResults();
        if(!localStorage || _.isUndefined(localStorage.viewType)){
            localStorage.setItem('viewType','list');
        }
        return {results: [], view: localStorage.getItem('viewType'), total: 0, search: this.props.search, hasMore: false};
    },
    shouldComponentUpdate: function(nextProps, nextState){
        //
        if(nextState.view!==this.state.view ){
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
            self.lastQueryTime = now;
            $.ajax('//beta-search.idigbio.org/v2/search/',{
                data: JSON.stringify(query),
                success: function(response){
                    //console.log(resp.shortCode)
                    //make sure last query run is the last one that renders
                    //as responses can be out of order
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
                        self.setState({results: res, total: response.itemCount, hasMore: more},function(){
                            self.forceUpdate();
                        });
                    }
                },
                dataType: 'json',
                contentType: 'application/json',
                type: 'POST'
            });

        },300,{leading: true, trailing: true});
    },
    componentDidMount: function(){
        window.onscroll = this.resultsScroll;
        this.getResults(this.props.search);
    },
    componentWillReceiveProps: function(nextProps){
        //component should only recieve search as props
        var isNewSearch =  JSON.stringify(this.props.search) !== JSON.stringify(nextProps.search);
      
            this.setState({search: nextProps.search},function(){
                this.getResults(nextProps.search); 
            });
        
    },
    viewChange: function(event){
        var view = event.currentTarget.attributes['data-value'].value;
        if(localStorage){
            localStorage.setItem('viewType',view);
        }
        this.setState({view: view});
    },
    //this is not a synthentic event
    resultsScroll: function(e){
        var search = _.cloneDeep(this.state.search);

        if(this.state.total > search.from + search.size){
            if($(window).scrollTop() + 40 >= $(document).height() - $(window).height()){
                search.from += search.size;
                this.setState({search: search},function(){
                   this.getResults(); 
                }); 
            }
        }
    },
    loadMoreResults: function(){
        var search = _.cloneDeep(this.state.search);

        if(this.state.total > search.from + search.size){
            search.from += search.size;
            this.setState({search: search},function(){
               this.getResults(); 
            }); 
        }
    },
    render: function(){
        var search = this.props.search, self=this, li=[], results;
        switch(this.state.view){
            case 'list':
                results = ResultsList({search: this.state.search, results: this.state.results, searchChange: this.props.searchChange});
                break
            case 'labels':
                results = ResultsLabels({results: this.state.results});
                break
            case 'images':
                results = ResultsImages({search: this.state.search, results: this.state.results});
                break;
        }
        ['list','labels','images'].forEach(function(item){
            var cl = item == self.state.view ? 'active' : ''; 
            li.push(
                React.DOM.li({key: 'tab-'+item, onClick: self.viewChange, 'data-value': item, className: cl}, helpers.firstToUpper(item))
            )
        })
        if(this.state.search.from + this.state.search.size < this.state.total){
            $('footer').hide();
        }else{
            $('footer').show();
        }        
        return(
            React.DOM.div({id: "results", className: "clearfix", onScroll: this.resultsScroll}, 
                React.DOM.ul({id: "results-menu", className: "pull-left"}, 
                    li
                ), 
                React.DOM.div({className: "pull-right total"}, 
                    "Total: ", helpers.formatNum(parseInt(this.state.total))
                ), 

                results

            )
        )
    }
});

var ResultsList = React.createClass({displayName: 'ResultsList',
    
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
        return ['genus','specificepithet','datecollected','collectioncode'];
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
        this.props.searchChange('sorting',sorting);
    },
    openRecord: function(e){
        window.open('/portal/records/'+e.currentTarget.id,'_blank');
    },
    setSortable: function(){
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
                headers.push(
                    React.DOM.th({key: 'header-'+item, id: item, className: "data-column", style: style, 'data-term': item, 'data-sort': sorted.order, onClick: self.sortColumn}, 
                        fields.byTerm[item].name, 
                        React.DOM.i({className: "glyphicon "+icon})
                    )
                ) 
            }else{
                headers.push(
                    React.DOM.th({key: 'header-'+item, id: item, className: "data-column", style: style, 'data-term': item, onClick: self.sortColumn}, fields.byTerm[item].name)
                ) 
            }
        });
        //add column list button
        headers.push(
            React.DOM.th({key: 'header-select', style: {width: '60px'}}, 
                React.DOM.button({className: "pull-right", 'data-toggle': "modal", 'data-target': "#column-list"}, 
                    React.DOM.i({className: "glyphicon glyphicon-list"})
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
                    val = React.DOM.span({className: "no-data"}, "no data");
                }

                if(columns.length-1 === ind){
                    tds.push(React.DOM.td({key: 'row-'+index+'-cell-'+ind, colSpan: "2"}, val));
                }else{
                    tds.push(React.DOM.td({key: 'row-'+index+'-cell-'+ind}, val));
                }
            })
            rows.push(
                React.DOM.tr({id: item.uuid, key: 'row-'+index, onClick: self.openRecord}, 
                    tds
                )
            );
        })

        if(rows.length===0){
            rows.push(React.DOM.tr({key: 'row-no-results', className: "no-results-row"}, React.DOM.td({colSpan: columns.length+1}, "No Matching Records")))
        }
        //column selection modal list
        var list=[];
        //sort list
        //fgroups.push(<option value="0">select a field</option>);

        _.each(fields.searchGroups,function(val){
            list.push(
                React.DOM.tr({key: val}, React.DOM.td({className: "bold"}, fields.groupNames[val]))
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
                        React.DOM.tr({key: 'column-select-'+field.term}, 
                            React.DOM.td(null, 
                                React.DOM.label(null, 
                                    React.DOM.input({name: field.term, onChange: self.columnCheckboxClick, type: "checkbox", checked: checked, disabled: disabled}), " ", field.name
                                )
                            )
                        )
                    )
                }
            });
        });

        return(
            React.DOM.div({id: "result-list", className: "panel"}, 
                React.DOM.div({id: "column-list", className: "modal fade"}, 
                    React.DOM.div({className: "modal-dialog"}, 
                        React.DOM.div({className: "modal-content"}, 
                            React.DOM.div({className: "modal-header"}, 
                                React.DOM.label(null, "Select Display Columns"), 
                                React.DOM.button({onClick: this.resetColumns, id: "reset"}, 
                                    "Reset"
                                ), 
                                React.DOM.button({type: "button", className: "close pull-right", 'data-dismiss': "modal"}, 
                                    React.DOM.span({'aria-hidden': "true"}, "×")
                                )
                            ), 
                            React.DOM.div({className: "modal-body"}, 
                                React.DOM.table(null, 
                                    list
                                )
                            ), 
                            React.DOM.div({className: "modal-footer"}

                            )
                        )
                    )
                ), 
                React.DOM.table({id: "data-table", className: "table table-condensed"}, 
                    React.DOM.thead(null, 
                        React.DOM.tr({id: "results-headers"}, headers)
                    ), 
                    React.DOM.tbody(null, 
                        rows
                    )
                )
            )
        )
    }
});

var ResultsLabels = React.createClass({displayName: 'ResultsLabels',
    makeLabel: function(result,id){
        var data = result.indexTerms, raw = result.data;
        var txt = '';
        var content=[];
        if(typeof data.scientificname == 'string') { 
            txt += helpers.check(raw["dwc:scientificName"]) + helpers.check(raw["dwc:scientificNameAuthorship"]);
            content.push(
                React.DOM.em(null, 
                    React.DOM.b(null, 
                      helpers.check(raw["dwc:scientificName"])
                    )
                )          
            );
            content.push(
                React.DOM.span(null,  helpers.check(raw["dwc:scientificNameAuthorship"], ' ') ) 
            );
         
        } else {  
            //txt += helpers.check(raw["dwc:genus"]) + helpers.check(raw["dwc:specificEpithet"]) + helpers.check(raw["dwc:scientificNameAuthorship"]);
            content.push(
                React.DOM.em(null, 
                   React.DOM.b(null, 
                helpers.check(raw["dwc:genus"]) + helpers.check(raw["dwc:specificEpithet"],' ')
                   )
                )
            )
            content.push(
               React.DOM.span(null, helpers.check(raw["dwc:scientificNameAuthorship"], ' '))
            )
        } 

  
        if( data.hasImage ){ 
            var imgcount;
            if(data.mediarecords.length > 1){ 
                imgcount = (
                    React.DOM.span({className: "image-count"}, 
                        data.mediarecords.length
                    )
                )
            }else{
                imgcount = React.DOM.span(null);
            } 
            content.push(
                React.DOM.span({key: 'media-'+result.uuid+this.props.stamp, className: "image-wrapper"}, 
                    imgcount, 
                    React.DOM.img({'data-onerror': "$(this).attr('src','/portal/img/notavailable.png')", 'data-onload': "$(this).attr('alt','image thumbnail')", className: "pull-right label-image", alt: " loading image...", src: "https://api.idigbio.org/v1/records/"+result.uuid+"/media?quality=thumbnail"})
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
            React.DOM.div({key: 'label-'+id, id: result.uuid, className: "pull-left result-item result-label", title: "click to view record", onClick: this.openRecord}, 
                React.DOM.p(null, 
                   content, 
                    React.DOM.span({style: {lineHeight: '1em', fontSize:'1em'}}, 
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
        return (
            React.DOM.div({id: "result-labels", className: "panel"}, 
                labels
            )
        )
    }
});

var ResultsImages = React.createClass({displayName: 'ResultsImages',
    getImageOnlyResults: function(search){
        /*var self=this, search=_.cloneDeep(search);
        search.image = true,
        query = queryBuilder.makeQuery(search);
        searchServer.esQuery('records',query,function(response){
            var results;
            if(search.from>0){
                results = self.state.results.concat(response.hits.hits);
            }else{
                results = response.hits.hits;
            }
            self.setState({results: results});
            self.forceUpdate();
        });*/

        var d = new Date, self=this, searchState = _.cloneDeep(search);
        searchState.image=true;
        var query = queryBuilder.makeSearchQuery(searchState);
        var now = d.getTime();
        self.lastQueryTime = now;
        $.ajax('//beta-search.idigbio.org/v2/search/',{
            data: JSON.stringify(query),
            success: function(response){
                //console.log(resp.shortCode)
                //make sure last query run is the last one that renders
                //as responses can be out of order
                if(now>= self.lastQueryTime){
                    var res;
                    if(searchState.from > 0){
                        res = self.state.results.concat(response.items);
                    }else{
                        res = response.items;
                    }
                    self.setState({results: res},function(){
                        self.forceUpdate();
                    });
                }
            },
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST'
        });
    },
    getInitialState: function(){
        return {results: this.props.results};
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
            this.setState({results: nextProps.results})
        }else{
            this.getImageOnlyResults(nextProps.search);
        }
    },
    makeImageText: function(data){

    },
    makeImage: function(uuid,record,key){
        var count = record.indexTerms.mediarecords.indexOf(uuid)+1 + ' of '+ record.indexTerms.mediarecords.length;
        var text=[], specimen = record.data;
        if(typeof specimen["dwc:scientificName"] == 'string') { 
            text.push(helpers.check(specimen["dwc:scientificName"]));
            text.push(helpers.check(specimen["dwc:scientificNameAuthorship"]));          
        }else{  
            text.push(helpers.check(specimen["dwc:genus"]));
            text.push(helpers.check(specimen["dwc:specificEpithet"]));
            text.push(helpers.check(specimen["dwc:scientificNameAuthorship"]));
        } 
        text.push(helpers.check(specimen["dwc:inistitutionCode"]));
        text.push(helpers.check(specimen["dwc:eventDate"]));
        var clean = text.filter(function(i){
            return !_.isEmpty(i);
        })
        return (
            React.DOM.a({className: "image", target: uuid, href: "/portal/mediarecords/"+uuid, key: 'image-'+key}, 
                React.DOM.span({className: "img-count"}, count), 
                React.DOM.img({alt: "loading...", 
                src: "https://api.idigbio.org/v1/mediarecords/"+uuid+"/media?quality=thumbnail", 
                onError: this.errorImage}), 
                React.DOM.div({className: "gallery-image-text"}, 
                    React.DOM.div({className: "image-text"}, 
                        clean.join(', ')
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

        return (
            React.DOM.div({id: "results-images", className: "panel"}, 
                images
            )
        )
    }
})