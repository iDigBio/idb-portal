/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');

module.exports = React.createClass({displayName: 'exports',
    getResults: function(searchState){
        var query = queryBuilder.makeQuery(searchState), self=this;
        searchServer.esQuery('records',query,function(results){
            self.setState({results: results.hits.hits, total: results.hits.total},function(){
                self.forceUpdate();
            });
        });
    },
    getInitialState: function(){
        this.getResults(this.props.search);
        return {results: [], view: 'list', total: 0};
    },
    shouldComponentUpdate: function(nextProps, nextState){
        if(nextState.view!==this.state.view){
            return true;
        }else{
            return false
        }
        
    },
    componentWillReceiveProps: function(nextProps){
        //component should only recieve search as props
        this.getResults(nextProps.search);  
    },
    viewChange: function(event){
        this.setState({view: event.currentTarget.attributes['data-value'].value})
    },
    render: function(){
        var search = this.props.search, self=this, li=[], results;
        switch(this.state.view){
            case 'list':
                results = ResultsList({results: this.state.results});
                break
            case 'labels':
                results = ResultsLabels({results: this.state.results});
                break
            case 'images':
                results = ResultsImages({search: this.props.search, results: this.state.results});
                break;
        }
        ['list','labels','images'].forEach(function(item){
            var cl = item == self.state.view ? 'active' : ''; 
            li.push(
                React.DOM.li({onClick: self.viewChange, 'data-value': item, className: cl}, item)
            )
        })        
        return(
            React.DOM.div({id: "results", className: "clearfix"}, 
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
        return {columns:['genus','specificepithet','collectioncode','datecollected']};
    },
    render: function(){
        var columns = this.state.columns;
        debugger//['scientificname','genus','collectioncode','specificepithet','commonname'];
        var rows=[];
        var headers=[];
        columns.forEach(function(item){
            var style={width: (Math.floor(100/columns.length))+'%'}
            if(columns.indexOf(item)===columns.length-1){
                style.width = (Math.floor(100/columns.length)-4)+'%';
                headers.push(
                    React.DOM.th({style: style}, 
                        fields.byTerm[item].name, 
                        React.DOM.button({className: "pull-right"}, 
                            React.DOM.i({className: "glyphicon glyphicon-list"})
                        )
                    )
                )
            }else{
                headers.push(
                    React.DOM.th({style: style}, fields.byTerm[item].name)
                ) 
            }

        });

        this.props.results.forEach(function(item){
            var tds = [];
            columns.forEach(function(name){
                var val = helpers.check(item._source.data['idigbio:data'][fields.byTerm[name].dataterm]);
                tds.push(React.DOM.td(null, val));
            })
            rows.push(
                React.DOM.tr(null, 
                    tds
                )
            );
        })
       
        return(
            React.DOM.div({className: "panel"}, 
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
            React.DOM.div({className: "panel"}, 
                labels
            )
        )
    }
});

var ResultsImages = React.createClass({displayName: 'ResultsImages',
    getImageOnlyResults: function(){
        var search = _.cloneDeep(this.props.search),self=this
        search.image = false,
        query = queryBuilder.makeQuery(search);
        searchServer.esQuery(query,function(response){
            self.setProps({results: response.hits.hits});
            self.forceUpdate();
        });
    },
    errorImage: function(event){

    },
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
        this.props.results.forEach(function(record){

            if(_.isArray(record._source.mediarecords)){
                record._source.mediarecords.forEach(function(uuid){
                    images.push(self.makeImage(uuid,record));
                })
            }
            
        })
        return (
            React.DOM.div({className: "panel"}, 
                images
            )
        )
    }
})