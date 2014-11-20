/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({
    render: function(){
        return(
            <div className="option-group" id="mapping-options"> 
                <div className="ordinates clearfix">
                    <label className="title">NorthWest</label>
                    <div className="pull-left ordinate">
                        Lat:
                        <input type="text"  className="coordinate form-control"/>
                    </div>
                    <div className="ordinate">
                        Lon:
                        <input type="text" className="coordinate form-control" />
                    </div>
                </div>
                <div className="ordinates clearfix">
                    <label className="title">SouthEast</label>
                    <div className="pull-left ordinate">
                        Lat:
                        <input type="text"  className="coordinate form-control"/>
                    </div>
                    <div className="ordinate">
                        Lon:
                        <input type="text" className="coordinate form-control" />
                    </div>
                </div>
            </div>
        )
    }
})