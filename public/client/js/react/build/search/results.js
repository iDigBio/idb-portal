/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');

module.exports = React.createClass({displayName: 'exports',
    getResults: function(searchState){
        var query = queryBuilder.makeQuery(searchState), self=this;
        searchServer.esQuery('records',query,function(results){
            var res;
            if(searchState.from > 0){
                res = self.state.results.concat(results.hits.hits);
            }else{
                res = results.hits.hits;
            }
            self.setState({results: res, total: results.hits.total, search: searchState},function(){
                self.forceUpdate();
            });
        });
    },
    getInitialState: function(){
        this.getResults(this.props.search);
        if(!localStorage || _.isUndefined(localStorage.viewType)){
            localStorage.setItem('viewType','list');
        }
        return {results: [], view: localStorage.getItem('viewType'), total: 0, search: this.props.search};
    },
    shouldComponentUpdate: function(nextProps, nextState){
        if(nextState.view!==this.state.view){
            return true;
        }else{
            return false;
        }
    },
    componentWillMount: function(){

    },
    componentDidMount: function(){
        window.onscroll = this.resultsScroll;
    },
    componentWillReceiveProps: function(nextProps){
        //component should only recieve search as props
        this.getResults(nextProps.search);  
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
                this.getResults(search);
            }
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
                React.DOM.li({onClick: self.viewChange, 'data-value': item, className: cl}, helpers.firstToUpper(item))
            )
        })        
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
        return _.clone(['genus','specificepithet','collectioncode','datecollected']);
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
        sort={name: name}, sorting=search.sorting;
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
        if(sorting.length>len){
            sorting.pop();
        }
        this.props.searchChange('sorting',sorting);
    },
    render: function(){
        var columns = this.state.columns,self=this;
     
       //['scientificname','genus','collectioncode','specificepithet','commonname'];
        var rows=[];
        var headers=[];
        //results table
        columns.forEach(function(item){
            var style={width: (Math.floor(100/columns.length))+'%'}, sorted=self.props.search.sorting[0];
            if(sorted.name===item){
                var icon = sorted.order == 'asc' ? 'glyphicon-chevron-up' : 'glyphicon-chevron-down';
                headers.push(
                    React.DOM.th({style: style, 'data-term': item, 'data-sort': sorted.order, onClick: self.sortColumn}, 
                        fields.byTerm[item].name, 
                        React.DOM.i({className: "glyphicon "+icon})
                    )
                ) 
            }else{
                headers.push(
                    React.DOM.th({style: style, 'data-term': item, onClick: self.sortColumn}, fields.byTerm[item].name)
                ) 
            }
        });
        //add column list button
        headers.push(
            React.DOM.th({style: {width: '20px'}}, 
                React.DOM.button({className: "pull-right", 'data-toggle': "modal", 'data-target': "#column-list"}, 
                    React.DOM.i({className: "glyphicon glyphicon-list"})
                )
            )
        )
        this.props.results.forEach(function(item){
            var tds = [];
            columns.forEach(function(name,ind){
                var val;
                if(_.isUndefined(fields.byTerm[name].dataterm)){
                    val = helpers.check(item._source[name]);
                }else{
                    val = helpers.check(item._source.data['idigbio:data'][fields.byTerm[name].dataterm]);
                }
                if(columns.length-1 === ind){
                    tds.push(React.DOM.td({colSpan: "2"}, val));
                }else{
                    tds.push(React.DOM.td(null, val));
                }
            })
            rows.push(
                React.DOM.tr(null, 
                    tds
                )
            );
        })
        //column selection modal list
        var list=[];
        //sort list
        //fgroups.push(<option value="0">select a field</option>);

        _.each(fields.searchGroups,function(val){
            list.push(
                React.DOM.tr(null, React.DOM.td({className: "bold"}, fields.groupNames[val]))
            )
            _.each(fields.byGroup[val],function(field){
                if(field.hidden){
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
                        React.DOM.tr({key: field.term}, 
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
                                React.DOM.label(null, "Select List Columns"), 
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
                React.DOM.table({className: "table table-condensed"}, 
                    React.DOM.thead(null, 
                        React.DOM.tr(null, headers)
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
    makeLabel: function(result){
        var data = result._source, raw = data.data['idigbio:data'];
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

        /*
        if( data.hasImage ){ 
            <span class="label-image-holder">
               if(data.mediarecords.length > 1){ %>
                    <span class="label-image-count">
                        <%= data.mediarecords.length %>
                    </span>
               } 
            <img onerror="$(this).attr('src','/portal/img/notavailable.png')" onload="$(this).attr('alt','image thumbnail')" class="pull-right label-image img-rounded" alt=" loading image..." src="https://api.idigbio.org/v1/records/<%= data.uuid %>/media?quality=thumbnail" > 
            </span>       
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
        */
        return (
            React.DOM.div({className: "pull-left result-item result-label", title: "click to view record"}, 
                React.DOM.p(null, 
                    React.DOM.span({style: {lineHeight: '1em', fontSize:'1em'}}, 
                        content
                    )
                )
            )
        )
    },
    render: function(){
        var labels = [],self=this;
        this.props.results.forEach(function(result){
            labels.push(self.makeLabel(result));
        })
        return (
            React.DOM.div({id: "result-labels", className: "panel"}, 
                labels
            )
        )
    }
});

var ResultsImages = React.createClass({displayName: 'ResultsImages',
    getImageOnlyResults: function(){
        var search = _.cloneDeep(this.props.search),self=this
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
        });
    },
    getInitialState: function(){
        return {results: []};
    },
    errorImage: function(event){

    },
    componentWillMount: function(){
        if(this.props.search.image){
            this.setState({results: this.props.results})
        }else{
            this.getImageOnlyResults();
        }
    },
    componentWillReceiveProps: function(nextProps){
        if(this.props.search.image){
            this.setState({results: this.props.results})
        }else{
            this.getImageOnlyResults();
        }
    },
    /*shouldComponentUpdate: function(nextProps,nextState){
        if(nextProps.search.image){
            return true;
        }else{
            this.getImageOnlyResults();
            return false;
        }
    },*/
    makeImage: function(uuid,specimen){
        return (
            React.DOM.a({className: "image", href: "/portal/mediarecords/"+uuid}, 
                React.DOM.img({alt: "loading...", 
                src: "https://api.idigbio.org/v1/mediarecords/"+uuid+"/media?quality=webview", 
                onError: this.errorImage})
            )
        )
    },
    render: function(){
        var images=[],self=this;
        this.state.results.forEach(function(record){
            if(_.isArray(record._source.mediarecords)){
                record._source.mediarecords.forEach(function(uuid){
                    images.push(self.makeImage(uuid,record));
                })
            }
        });

        return (
            React.DOM.div({className: "panel"}, 
                images
            )
        )
    }
})