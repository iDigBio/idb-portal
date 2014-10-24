/**
 * @jsx React.DOM
 */

var React = require('react');
var _ = require('lodash');

module.exports = React.createClass({
    getInitialState: function(){
        return {view: 'list'};
    },
    viewChange: function(event){
        this.setState({view: event.currentTarget.attributes['data-value'].value})
    },
    render: function(){
        var search = this.props.search;
     
        return(
            <div id="results" className="clearfix">
                <ul id="results-menu">
                    <li onClick={this.viewChange} data-value="list">List</li>
                    <li onClick={this.viewChange} data-value="labels">Labels</li>
                    <li onClick={this.viewChange} data-value="images">Images</li>
                </ul>
                <ResultsPanel search={search} view={this.state.view} />
            </div>
        )
    }
});


var ResultsPanel = React.createClass({
    getResults: function(searchObj){
        var query = queryBuilder.makeQuery(searchObj), self=this;
        searchServer.esQuery('records',query,function(results){
            self.setState({results: results.hits.hits},function(){
                self.forceUpdate();
            });
        });
    },
    getInitialState: function(){
        this.getResults(this.props.search);
        return {results: []};
    },
    shouldComponentUpdate: function(nextProps, nextState){
        return false;
    },
    componentWillReceiveProps: function(nextProps){
        this.getResults(nextProps.search);
    },
    render: function(){
        var columns = ['scientificname','genus','collectioncode','specificepithet','commonname'];
        var rows=[];

        this.state.results.forEach(function(item){
            var tds = [];
            columns.forEach(function(name){
                var val = helpers.check(item._source.data['idigbio:data'][fields.byTerm[name].dataterm]);
                tds.push(<td>{val}</td>);
            })
            rows.push(
                <tr>
                    {tds}
                </tr>
            );
        })
       
        return(
            <div className="panel">
                <table className="table table-condensed">
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        )
    }
})