/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({
    
    render: function(){
        var options = [];

        searchHistory.history.forEach(function(item,ind){
            options.push(
                <option value={ind}>{JSON.stringify(item)}</option>
            )
        })
        return (
            <div>
                <div>
                    <select className="form-field">
                        {options}
                    </select>
                </div>
            </div>
        )
    }
});