var React = require('react');
var Datetime = require('react-datetime');
var _ = require('lodash');

module.exports = React.createClass({
    render: function(){
        var startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        var endDate = new Date();
        return (
            <div>
                <Datetime viewMode="months" defaultValue={startDate} timeFormat={false} />
                <Datetime viewMode="months" defaultValue={endDate} timeFormat={false} />
            </div>
        )
    }

});
