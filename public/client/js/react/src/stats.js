import React from 'react'
import Charts from './shared/stats_charts'


const Stats = ({usage, ingest, ingestCumulative, collected, taxon, flags}) => {
    // constructor(props) {
    //     super(props);
    //     this.navList = this.navList.bind(this)
    // }
    const navLinkStyle = {
        display: "inline-block",
        minHeight: "24px",
        minWidth: "24px",
        padding: "4px 8px",
        lineHeight: "1.5"
    };

    const navList = () => {
        return (
            <ul id="side-nav-list">
                <li className="title">Contents</li>
                <li><a href="#data-usage" style={navLinkStyle}>Data Usage</a></li>
                <li><a href="#data-ingestion" style={navLinkStyle}>Data Ingestion</a></li>
                <li><a href="#temportal-coverage" style={navLinkStyle}>Temporal Coverage</a></li>
                <li><a href="#taxon-coverage" style={navLinkStyle}>Taxonomic Coverage</a></li>
                <li><a href="#data-quality" style={navLinkStyle}>Data Quality</a></li>
                <li><a href="#google-analytics" style={navLinkStyle}>Google Analytics Data</a></li>
            </ul>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-lg-7 col-lg-offset-2 col-md-9 col-md-offset-1 col-sm-10" id="container">
                    <Charts usage={usage} ingest={ingest} ingestCumulative={ingestCumulative} collected={collected}
                            taxon={taxon} flags={flags}/>
                    <h3><a name="google-analytics">Google Analytics Data</a></h3>

                    <iframe width="100%" height="600px"
                            src="https://lookerstudio.google.com/embed/reporting/e1efb265-1581-4bfe-961c-e7c3b1795208/page/kIV1C"
                            style={{"border":0}} allowFullScreen
                            title="iDigBio Google Analytics Dashboard"
                            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>
                </div>
                <div className="col-lg-2 col-md-2 col-sm-2">
                    <div id="side-nav">
                        {navList()}
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Stats;

