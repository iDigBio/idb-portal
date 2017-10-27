var React = require('react');

var Charts = require('./shared/stats_charts');

var Stats = React.createClass({
    navList: function(){
        return (
            <ul id="side-nav-list">
                <li className="title">Contents</li>
                <li><a href="#data-usage">Data Usage</a></li>
                <li><a href="#data-ingestion">Data Ingestion</a></li>
                <li><a href="#temportal-coverage">Temportal Coverage</a></li>
                <li><a href="#taxon-coverage">Taxonomic Coverage</a></li>
                <li><a href="#data-quality">Data Quality</a></li>
                <li><a href="#google-analytics">Google Analytics Data</a></li>
            </ul>  
        );
    },
    render: function(){
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-7 col-lg-offset-2 col-md-9 col-md-offset-1 col-sm-10" id="container">
                        <Charts usage={this.props.usage} ingest={this.props.ingest} ingestCumulative={this.props.ingestCumulative} collected={this.props.collected} taxon={this.props.taxon} flags={this.props.flags} />
                        <h3><a name="google-analytics">Google Analytics Data</a></h3>
                        <iframe style={{"width": "880px", "height": "860px"}}src="https://datastudio.google.com/embed/reporting/0B_MqM-SMbq09eWhiN0NzMEZUSjg/page/1M"></iframe>
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
