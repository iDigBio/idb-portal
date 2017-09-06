var React = require('react');
var moment = require('moment')
var Datetime = require('react-datetime');
var _ = require('lodash');

class Charts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: moment().subtract(1, "years"),
            endDate: moment(),
            period: "year",
        };
    }

    render() {

        return (
            <div>
                <form className="form-inline">
                    <div className="form-group">
                        <label className="control-label" for="startDate">Start:</label>
                        <Datetime viewMode="months" defaultValue={this.state.startDate} timeFormat={false} onChange={m => this.setState({startDate: m})} inputProps={{name: "startDate"}} />
                    </div>
                    <div className="form-group">
                        <label className="control-label" for="endDate">End:</label>
                        <Datetime viewMode="months" defaultValue={this.state.endDate} timeFormat={false} onChange={m => this.setState({endDate: m})} inputProps={{name: "endDate"}} />
                    </div>
                    <div className="form-group">
                        <label className="control-label" for="period">Period:</label>
                        <div>
                            <select value={this.state.period} onChange={e => this.setState({period: e.target.value})} className="form-control" name="period">
                                <option value="year">Year</option>
                                <option value="month">Month</option>
                                <option value="week">Week</option>
                                <option value="day">Day</option>
                            </select>
                        </div>
                    </div>
                </form>

                <ul>
                    <li> Start Date: {this.state.startDate.format()}</li>
                    <li> End Date: {this.state.endDate.format()}</li>
                    <li> Period Date: {this.state.period}</li>
                </ul>
            </div>
        )
    }
};

module.exports = Charts
