/**
 * @jsx React.DOM
 */

var React = require('react')
var dwc = require('./lib/dwc_fields');
var _ = require('underscore');


module.exports = React.createClass({
    render: function(){

        return(
            <div key='react'>
                <div key={'left'} className="row">
                    <div key='fulltext' id="search-fulltext" className="col-lg-4 clearfix">
                        <h3>Start Searching</h3>
                        <div className="input-group">
                            <input type="text" className="form-control" placeholder="search any field" />
                            <a className="btn input-group-addon">Go</a>
                        </div>
                        <div className="checkbox">
                            <label>
                                <input type="checkbox" />
                                Must have image
                            </label>
                        </div>
                        <div className="checkbox">
                            <label>
                                <input type="checkbox" />
                                Must have map point
                            </label>
                        </div>
                        <div key='filters' id="search-filters">
                            <div className="clearfix" id="filter-control">
                                <h4>Add a Filter</h4>
                                <select><option value="select">select</option></select>
                            </div>
                            <div className="filter">
                                Scientific Name
                                <textarea></textarea>
                            </div>
                        </div>
                    </div>
                    <div id="map-holder" className="col-lg-8">
                        <div id="map"></div>
                    </div>
                </div>
            </div>
        )
    }
})