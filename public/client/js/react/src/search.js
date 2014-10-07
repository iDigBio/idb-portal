/**
 * @jsx React.DOM
 */

var React = require('react')
var dwc = require('./lib/dwc_fields');
var _ = require('underscore');


module.exports = React.createClass({
    render: function(){

        return(
            <div>
                <div className="row">
                    <div id="search-fulltext"className="col-md-3 clearfix">
                        <h3>Start Searching</h3>
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="search any field" />
                            <a className="btn input-group-addon">Go</a>
                        </div>
                        <div className="checkbox">
                            <label>
                                <input type="checkbox"/>Must have image
                            </label>
                        </div>
                        <div className="checkbox">
                            <label>
                                <input type="checkbox"/>Must have map point
                            </label>
                        </div>
                    </div>
                    <div id="search-filters" className="col-md-8">
                        <div className="clearfix" id="filter-control">
                            <h4>Add a Filter</h4>
                            <select><option value="select">select</option></select>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div id="search-history" className="col-lg-4">
                    </div>
                    <div id="map-holder" className="col-lg-8">
                        <div id="map"></div>
                    </div>
                </div>
            </div>
        )
    }
})