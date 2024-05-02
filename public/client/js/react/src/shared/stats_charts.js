var React = require('react');
var moment = require('moment')
var Datetime = require('react-datetime');
var _ = require('lodash');
var idbapi = require('../../../lib/idbapi');

import C3Chart from 'react-c3js';
import 'c3/c3.css';
import 'react-datetime/css/react-datetime.css'

class Usage extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        var totals = {};
        var preProc = {"x": []};
        if (this.props.data) {
            _.forEach(this.props.data, (stat, date) => {
                date = moment(date, "YYYY-MM-DD");
                if (this.props.startDate <= date && date <= this.props.endDate) {
                    preProc.x.push(date.format("YYYY-MM-DD"));
                    _.forEach(stat, (count, cat) => {

                        if (totals[cat]) {
                            totals[cat] += count;
                        } else {
                            totals[cat] = count;
                        }

                        if(this.props.log) {
                            if(count > 0){
                                count = Math.log(count) / Math.LN10;
                            } else{
                                count = 0;
                            }
                        }

                        if (preProc[cat]) {
                            preProc[cat].push(count);
                        } else {
                            preProc[cat] = [count]
                        }
                    });
                }
            });
        }
        var cols = [];
        _.forEach(preProc, (values, cat) => {
            values.unshift(cat)
            cols.push(values)
        })
        return (
            <div>
                <table>
                  <tbody>
                      <tr>
                        <td style={{"backgroundColor": "#C0C0C0", "fontSize": "120%"}}>Total Searches:&nbsp;<span id="totSeen" style={{"fontWeight": "bold", "float": "right"}}>{totals.search_count}</span></td>
                        <td style={{"fontSize": "25%"}}>&nbsp;</td>
                        <td style={{"backgroundColor": "#6AA850", "fontSize": "120%"}}>Total Downloads:&nbsp;<span id="totRecView" style={{"fontWeight": "bold", "float": "right"}}>{totals.download_count}</span></td>
                      </tr>
                      <tr>
                          <td style={{"fontSize": "25%"}} colSpan="3">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style={{"backgroundColor": "#C0C0C0", "fontWeight": "bold", "fontSize": "120%", "textAlign": "center"}} colSpan="3">Total records searched:&nbsp;<span id="totSearch">{totals.search}</span></td>
                      </tr>
                      <tr>
                          <td style={{"fontSize": "25%"}} colSpan="3">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style={{"backgroundColor": "#618CB8", "fontSize": "120%"}}>Total records seen:&nbsp;<span id="totSeen" style={{"fontWeight": "bold", "float": "right"}}>{totals.seen}</span></td>
                        <td style={{"fontSize": "25%"}}>&nbsp;</td>
                        <td style={{"backgroundColor": "#D58B28", "fontSize": "120%"}}>Total specimen records viewed:&nbsp;<span id="totRecView" style={{"fontWeight": "bold", "float": "right"}}>{totals.viewed_records}</span></td>
                      </tr>
                      <tr>
                        <td style={{"fontSize": "25%"}} colSpan="3">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style={{"backgroundColor": "#6AA850", "fontSize": "120%"}}>Total records downloaded:&nbsp;<span id="totDownload" style={{"fontWeight": "bold", "float": "right"}}>{totals.download}</span></td>
                        <td style={{"fontSize": "50%"}}>&nbsp;</td>
                        <td style={{"backgroundColor": "#D3B831", "fontSize": "120%"}}>Total media records viewed:&nbsp;<span id="totMedView" style={{"fontWeight": "bold", "float": "right"}}>{totals.viewed_media}</span></td>
                      </tr>
                  </tbody>
                </table>
                <h3><a name="data-usage">Data Usage</a></h3>
                <C3Chart data={{x: "x", columns: cols, "hide": ["search"]}} axis={{x: {type: "timeseries", tick: {"format": "%Y-%m-%d"}}, y: { tick: {format: (d) => {if(this.props.log){ return Math.pow(10, d).toLocaleString() } else { return d }}}}}} />
            </div>
        );
    }
}

class Ingest extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        var preProc = {"x": []};
        if (this.props.data) {
            _.forEach(this.props.data, (stat, date) => {
                date = moment(date, "YYYY-MM-DD");
                if (this.props.startDate <= date && date <= this.props.endDate) {
                    preProc.x.push(date.format("YYYY-MM-DD"));
                    _.forEach(stat, (count, cat) => {
                        if (preProc[cat]) {
                            preProc[cat].push(count);
                        } else {
                            preProc[cat] = [count]
                        }
                    });
                }
            });
        }
        var cols = [];
        _.forEach(preProc, (values, cat) => {
            values.unshift(cat)
            cols.push(values)
        })
        return (
            <div>
                <h3><a name="data-ingestion">Data Ingestion</a></h3>
                <C3Chart data={{x: "x", columns: cols, "hide": ["recordsets"]}} axis={{x: {type: "timeseries", tick: {"format": "%Y-%m-%d"}}, y: { tick: {format: function(d) {return d.toLocaleString()}}}}} />
            </div>
        );
    }
}

class Collected extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: moment("1700-01-01", "YYYY-MM-DD"),
            endDate: moment(),
        };
    }


    render() {
        var preProc = {"x": []};
        if (this.props.data) {
            _.forEach(this.props.data, (stat, date) => {
                date = moment(date, "YYYY-MM-DD");
                if (this.state.startDate <= date && date <= this.state.endDate) {
                    preProc.x.push(date.format("YYYY-MM-DD"));
                    _.forEach(stat, (count, cat) => {
                        if (preProc[cat]) {
                            preProc[cat].push(count);
                        } else {
                            preProc[cat] = [count]
                        }
                    });
                }
            });
        }
        var cols = [];
        _.forEach(preProc, (values, cat) => {
            values.unshift(cat)
            cols.push(values)
        })
        return (
            <div>
                <h3><a name="temporal-coverage">Temporal Coverage</a></h3>
                <form className="form-inline">
                    <div className="form-group">
                        <label className="control-label" htmlFor="startDate">Start:</label>
                        <Datetime viewMode="months" defaultValue={this.state.startDate} timeFormat={false} onChange={m => this.setState({startDate: m})} inputProps={{name: "startDate"}} />
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="endDate">End:</label>
                        <Datetime viewMode="months" defaultValue={this.state.endDate} timeFormat={false} onChange={m => this.setState({endDate: m})} inputProps={{name: "endDate"}} />
                    </div>
                </form>
                <C3Chart data={{x: "x", columns: cols}} axis={{x: {type: "timeseries", tick: {"format": "%Y-%m-%d"}}, y: { tick: {format: function(d) {return d.toLocaleString()}}}}} />
            </div>
        );
    }
}

class Taxon extends React.Component {
    constructor(props) {
        super(props);

        var preProc = {};
        this.kingdomData = {}

        if (this.props.data) {
            _.forEach(this.props.data.kingdom, (stat, kingdom) => {
                preProc[kingdom] = [ stat.itemCount ];
                this.kingdomData[kingdom] = {}
                _.forEach(stat.family, (count, cat) => {
                    if (this.kingdomData[kingdom][cat]) {
                        this.kingdomData[kingdom][cat].push(count.itemCount);
                    } else {
                        this.kingdomData[kingdom][cat] = [count.itemCount]
                    }
                });
            });
        }
        this.state = {
            activeData: "base"
        };

        var cols = [];
        _.forEach(preProc, (values, cat) => {
            values.unshift(cat)
            cols.push(values)
        })
        _.forEach(this.kingdomData, (kd, k) => {
            var kc = [];
            _.forEach(kd, (values, f) => {
                values.unshift(f)
                kc.push(values)
            })
            this.kingdomData[k] = kc;
        })
        this.kingdomData["base"] = cols;
    }

    render() {
        return (
            <C3Chart unloadBeforeLoad={true} data={{
                columns: this.kingdomData[this.state.activeData],
                type: "pie",
                onclick: (d, element) => {
                    this.setState({activeData: d.name});
                }
            }} axis={{y: { tick: {format: function(d) {return d.toLocaleString()}}}}} />
        );
    }
}

class Flags extends React.Component {
    constructor(props) {
        super(props);

        this.cols = [["x"],["flags"]]

        if (this.props.data) {
            _.forEach(this.props.data.flags, (stat, f) => {
                this.cols[0].push(f)
                this.cols[1].push(stat.itemCount)
            });
        }
    }

    render() {
        return (
            <div>
                <h3><a name="data-quality">Data Quality</a></h3>
                <C3Chart data={{
                    x: "x",
                    columns: this.cols,
                    type: "bar",
                }} axis={{x: {type: "category", tick: {rotate: -60}}, y: { tick: {format: function(d) {return d.toLocaleString()}}}}} />
            </div>
        );
    }
}

class TaxonPies extends React.Component {
    constructor(props) {
        super(props);        
    }


    render() {
        return (
            <div>
                <h3><a name="taxon-coverage">Taxonomic Coverage</a></h3>

                <h4>Records</h4>
                <Taxon data={this.props.data.records} />

                <h4>Media</h4>
                <Taxon data={this.props.data.mediarecords} />
            </div>
        )
    }
}

class StatsCharts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: moment("2021-01-01", "YYYY-MM-DD"),
            endDate: moment().subtract(1,'months').endOf('month'),
            log: true,
            cumulative: true,
            ingestData: props.ingestCumulative,
        };
    }

    toggleCumulative() {
        var id, newcumulative = !this.state.cumulative;
        if (newcumulative) {
            id = this.props.ingestCumulative;
        } else {
            id  = this.props.ingest;
        }

        this.setState({
            cumulative: newcumulative,
            ingestData: id,
        })
    }

    render() {
        return (
            <div>
                <form className="form-inline">
                    <div className="form-group">
                        <label className="control-label" htmlFor="startDate">Start:</label>
                        <Datetime viewMode="months" defaultValue={this.state.startDate} timeFormat={false} onChange={m => this.setState({startDate: m})} inputProps={{name: "startDate"}} />
                    </div>
                    <div className="form-group">
                        <label className="control-label" htmlFor="endDate">End:</label>
                        <Datetime viewMode="months" defaultValue={this.state.endDate} timeFormat={false} onChange={m => this.setState({endDate: m})} inputProps={{name: "endDate"}} />
                    </div>
                </form>

                <Usage startDate={this.state.startDate} endDate={this.state.endDate} data={this.props.usage} log={this.state.log} />
                <div className="form-group">
                    <label className="control-label" htmlFor="logcheck">Log Scale: </label>
                    <input name="logcheck" type="checkbox" checked={this.state.log} onChange={() => this.setState({log: !this.state.log})}/>
                </div>

                <Ingest startDate={this.state.startDate} endDate={this.state.endDate} data={this.state.ingestData}/>
                <div className="form-group">
                    <label className="control-label" htmlFor="cumulativecheck">Cumulative: </label>
                    <input name="cumulativecheck" type="checkbox" checked={this.state.cumulative} onChange={this.toggleCumulative.bind(this)}/>
                </div>
            </div>
        )
    }
};


class Charts extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <StatsCharts ingest={this.props.ingest} ingestCumulative={this.props.ingestCumulative} usage={this.props.usage} />
                <Collected data={this.props.collected} />
                <TaxonPies data={this.props.taxon} />
                <Flags data={this.props.flags} />
            </div>
        )
    }
};

Charts.defaultProps = {ingest: {dates:{}}, ingestCumulative: {dates:{}}, usage: {dates:{}}, collected:{dates:{}}, taxon:{records:{}, mediarecords:{}}, flags: {}}

module.exports = Charts
