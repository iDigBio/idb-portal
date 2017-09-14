var React = require('react');
var moment = require('moment')
var Datetime = require('react-datetime');
var _ = require('lodash');
var idbapi = require('../../../lib/idbapi');

import C3Chart from 'react-c3js';
import 'c3/c3.css';

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

                        if(count > 0){
                            count = Math.log(count) / Math.LN10;
                        } else{
                            count = 0;
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
                <C3Chart data={{x: "x", columns: cols}} axis={{x: {type: "timeseries", tick: {"format": "%Y-%m-%d"}}, y: { tick: {format: function(d) {return Math.pow(10, d).toFixed(0)}}}}} />
            </div>
        );
    }
}

class Charts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: moment("2015-01-01", "YYYY-MM-DD"),
            endDate: moment(),
        };
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

                <ul>
                    <li> Start Date: {this.state.startDate.format("YYYY-MM-DD")}</li>
                    <li> End Date: {this.state.endDate.format("YYYY-MM-DD")}</li>
                </ul>

                <Usage startDate={this.state.startDate} endDate={this.state.endDate} recordset={this.props.recordset} data={this.props.usage} />
            </div>
        )
    }
};

module.exports = Charts
