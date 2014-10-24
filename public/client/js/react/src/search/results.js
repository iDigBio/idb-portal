/**
 * @jsx React.DOM
 */

var React = require('react');

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
    getInitialState: function(){
        return {results: []};
    },
    render: function(){
        var query = buildQuery(this.props.search),self=this;


        return(
            <div className="panel">
            </div>
        )
    }
})