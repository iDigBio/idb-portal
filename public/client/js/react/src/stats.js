var React = require('react');

var Charts = require('./shared/stats_charts');

var Stats = React.createClass({
    navList: function(){
        return (
            <ul id="side-nav-list">
                <li className="title">Contents</li>
                <li><a href="#media-wrapper">Media</a></li>
                <li><a href="#attribution">Attribution</a></li>
                <li><a href="#data-table">All Data</a></li>
            </ul>  
        );
    },
    render: function(){
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-7 col-lg-offset-2 col-md-9 col-md-offset-1 col-sm-10" id="container">
                        <Charts usage={this.props.usage} ingest={this.props.ingest} collected={this.props.collected} taxon={this.props.taxon} flags={this.props.flags} />
                    </div>
                    <div className="col-lg-2 col-md-2 col-sm-2">
                        <div id="side-nav">
                            {this.navList()}
                        </div>
                    </div> 
                </div>
            </div>
        );
    }
});

module.exports = Stats;
