import React, {useEffect, useState, useRef} from 'react'
import moment from 'moment'
import Datetime from 'react-datetime'
import _ from 'lodash'
import idbapi from '../../../lib/idbapi'

import C3Chart from 'react-c3js';
import 'c3/c3.css';
import 'react-datetime/css/react-datetime.css'

const Usage = ({data, startDate, endDate, log}) => {

    var totals = {};
    var preProc = {"x": []};
    if (data) {
        _.forEach(data, (stat, date) => {
            date = moment(date, "YYYY-MM-DD");
            if (startDate <= date && date <= endDate) {
                preProc.x.push(date.format("YYYY-MM-DD"));
                _.forEach(stat, (count, cat) => {

                    if (totals[cat]) {
                        totals[cat] += count;
                    } else {
                        totals[cat] = count;
                    }

                    if(log) {
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
            <C3Chart data={{x: "x", columns: cols, "hide": ["search"]}} axis={{x: {type: "timeseries", tick: {"format": "%Y-%m-%d"}}, y: { tick: {format: (d) => {if(log){ return Math.pow(10, d).toLocaleString() } else { return d }}}}}} />
        </div>
    );

}

const Ingest = ({data, startDate, endDate}) => {

    var preProc = {"x": []};
    if (data) {
        _.forEach(data, (stat, date) => {
            date = moment(date, "YYYY-MM-DD");
            if (startDate <= date && date <= endDate) {
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

const Collected = ({data}) => {
    const [startDate, setStartDate] = useState(moment("1700-01-01", "YYYY-MM-DD"))
    const [endDate, setEndDate] = useState(moment())

    var preProc = {"x": []};
    if (data) {
        _.forEach(data, (stat, date) => {
            date = moment(date, "YYYY-MM-DD");
            if (startDate <= date && date <= endDate) {
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
                    <label className="control-label" htmlFor="collectedStartDate">Start:</label>
                    <Datetime viewMode="months" defaultValue={startDate} timeFormat={false} onChange={m => setStartDate(m)} inputProps={{id: "collectedStartDate", name: "startDate"}} />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="collectedEndDate">End:</label>
                    <Datetime viewMode="months" defaultValue={endDate} timeFormat={false} onChange={m => setEndDate(m)} inputProps={{id: "collectedEndDate", name: "endDate"}} />
                </div>
            </form>
            <C3Chart data={{x: "x", columns: cols}} axis={{x: {type: "timeseries", tick: {"format": "%Y-%m-%d"}}, y: { tick: {format: function(d) {return d.toLocaleString()}}}}} />
        </div>
    );

}

const Taxon = (props) => {
    const [activeData, setActiveData] = useState("base");
    const [kingdomData, setKingdomData] = useState({ base: [] }); // Initialize with a base key

    useEffect(() => {
        let preProc = {};
        let localKingdomData = {};

        if (props.data) {
            _.forEach(props.data.kingdom, (stat, kingdom) => {
                preProc[kingdom] = [stat.itemCount];
                localKingdomData[kingdom] = {};
                _.forEach(stat.family, (count, cat) => {
                    if (localKingdomData[kingdom][cat]) {
                        localKingdomData[kingdom][cat].push(count.itemCount);
                    } else {
                        localKingdomData[kingdom][cat] = [count.itemCount];
                    }
                });
            });
        }

        _.forEach(preProc, (values, cat) => {
            values.unshift(cat);
            preProc[cat] = values;
        });

        _.forEach(localKingdomData, (kd, k) => {
            var kc = [];
            _.forEach(kd, (values, f) => {
                values.unshift(f);
                kc.push(values);
            });
            localKingdomData[k] = kc;
        });

        localKingdomData["base"] = Object.values(preProc);
        setKingdomData(localKingdomData);

    }, [props.data]);


    // Conditional rendering
    return (
        kingdomData[activeData] && kingdomData[activeData].length > 0 ? (
            <C3Chart
                unloadBeforeLoad={true}
                data={{
                    columns: kingdomData[activeData],
                    type: "pie",
                    onclick: (d) => {
                        setActiveData(d.name);
                    },
                }}
                axis={{
                    y: {
                        tick: {
                            format: function (d) {
                                return d.toLocaleString();
                            },
                        },
                    },
                }}
            />
        ) : (
            <div>Loading chart...</div> // Placeholder while data is loading
        )
    );
};

const Flags = (props) => {
    const [cols, setCols] = useState([["x"], ["flags"]]);
    const colsRef = useRef(cols);

    useEffect(() => {
        if (props.data) {
            const newCols = [["x"], ["flags"]];

            _.forEach(props.data.flags, (stat, f) => {
                newCols[0].push(f);
                newCols[1].push(stat.itemCount);
            });

            setCols(newCols);
            colsRef.current = newCols; // Update the ref whenever cols is updated
        }
    }, [props.data]);

    return (
        <div>
            <h3><a name="data-quality">Data Quality</a></h3>
            <C3Chart
                data={{
                    x: "x",
                    columns: cols,
                    type: "bar",
                }}
                axis={{
                    x: {
                        type: "category",
                        tick: {
                            rotate: -60,
                        }
                    },
                    y: {
                        tick: {
                            format: (d) => d.toLocaleString()
                        }
                    }
                }}
            />
        </div>
    );
};


const TaxonPies = ({data}) => {

    return (
        <div>
            <h3><a name="taxon-coverage">Taxonomic Coverage</a></h3>

            <h4>Records</h4>
            <Taxon data={data.records} />

            <h4>Media</h4>
            <Taxon data={data.mediarecords} />
        </div>
    )

}

const StatsCharts = (props) => {
    const [startDate, setStartDate] = useState(moment().subtract(3,'years').startOf('month'));
    const [endDate, setEndDate] = useState(moment().subtract(1, 'months').endOf('month'));
    const [log, setLog] = useState(true);
    const [cumulative, setCumulative] = useState(true);
    const [ingestData, setIngestData] = useState(props.ingestCumulative);

    const toggleCumulative = () => {
        const newcumulative = !cumulative;
        setIngestData(newcumulative ? props.ingestCumulative : props.ingest);
        setCumulative(newcumulative);
    };

    return (
        <div>
            <form className="form-inline">
                <div className="form-group">
                    <label className="control-label" htmlFor="statsStartDate">Start:</label>
                    <Datetime
                        viewMode="months"
                        defaultValue={startDate}
                        timeFormat={false}
                        onChange={m => setStartDate(m)}
                        inputProps={{ id: "statsStartDate", name: "startDate" }}
                    />
                </div>
                <div className="form-group">
                    <label className="control-label" htmlFor="statsEndDate">End:</label>
                    <Datetime
                        viewMode="months"
                        defaultValue={endDate}
                        timeFormat={false}
                        onChange={m => setEndDate(m)}
                        inputProps={{ id: "statsEndDate", name: "endDate" }}
                    />
                </div>
            </form>

            <Usage startDate={startDate} endDate={endDate} data={props.usage} log={log} />
            <div className="form-group">
                <label className="control-label" htmlFor="logcheck">Log Scale: </label>
                <input
                    id="logcheck"
                    name="logcheck"
                    type="checkbox"
                    checked={log}
                    onChange={() => setLog(!log)}
                />
            </div>

            <Ingest startDate={startDate} endDate={endDate} data={ingestData} />
            <div className="form-group">
                <label className="control-label" htmlFor="cumulativecheck">Cumulative: </label>
                <input
                    id="cumulativecheck"
                    name="cumulativecheck"
                    type="checkbox"
                    checked={cumulative}
                    onChange={toggleCumulative}
                />
            </div>
        </div>
    );
};


const Charts = ({ingest, collected, taxon, flags, usage, ingestCumulative}) => {

    return (
        <div>
            <StatsCharts ingest={ingest} ingestCumulative={ingestCumulative} usage={usage} />
            <Collected data={collected} />
            <TaxonPies data={taxon} />
            <Flags data={flags} />
        </div>
    )

};

Charts.defaultProps = {ingest: {dates:{}}, ingestCumulative: {dates:{}}, usage: {dates:{}}, collected:{dates:{}}, taxon:{records:{}, mediarecords:{}}, flags: {}}

export default Charts;
