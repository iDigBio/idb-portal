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
                    <div key='fulltext' id="search" className="clearfix">
                        
                        <div id="search-any" className="clearfix">
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
                        </div>
                        <div key='filters' id="options">
                            <ul id="options-menu">
                                <li>Sorting </li>
                                <li>Advanced Filters </li>
                                <li>Download &amp; History</li>
                            </ul>
                            <div className="clearfix panel active" id="filter-sort">
                                <label>Sort by</label>
                                <select><option value="select">select</option></select>
                                <label>Sort direction</label>
                                <select><option value="select">select</option></select>
                            </div>
                            <div className="clearfix panel" id="filter-control">
                                <h4>Advanced Filters</h4>
                                <select placeholder="select to add"><option value="select">select to add</option></select>
                            </div>
                            <div className="panel">
                                Scientific Name
                                <textarea></textarea>
                            </div>
                        </div>
                    </div>
                    <div id="map-box">
                        <div id="map"></div>
                    </div>
                </div>
            </div>
        )
    }
})