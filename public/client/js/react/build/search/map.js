'use strict';

var React = require('react');
var IDBMap = require('../../../lib/mapper');
var helpers = require('../../../lib/helpers');

var map;
module.exports = React.createClass({
    displayName: 'exports',

    currentQuery: '',

    componentDidMount: function componentDidMount() {
        var self = this;
        map = new IDBMap('map', {
            queryChange: function queryChange(query) {
                var mapping;
                if (_.has(query, 'geopoint')) {
                    switch (query.geopoint.type) {
                        case 'geo_bounding_box':
                            mapping = {
                                type: 'box',
                                bounds: {
                                    top_left: query.geopoint.top_left,
                                    bottom_right: query.geopoint.bottom_right
                                }
                            };
                            break;
                        case 'geo_distance':
                            mapping = {
                                type: 'radius',
                                bounds: {
                                    distance: query.geopoint.distance,
                                    lat: query.geopoint.lat, //e.layer._latlng.lat,
                                    lon: query.geopoint.lon //e.layer._latlng.lng
                                }
                            };
                            break;
                    }
                    self.props.viewChange('optionsTab', 'mapping');
                    self.props.searchChange('mapping', mapping);
                }
            }
        });

        var query = queryBuilder.buildQueryShim(this.props.search);
        map.query(query);
    },
    shouldComponentUpdate: function shouldComponentUpdate() {
        return false;
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var q = queryBuilder.buildQueryShim(nextProps.search);
        var next = JSON.stringify(q);
        //debugger
        if (next !== this.currentQuery) {
            this.currentQuery = next;
            map.query(q);
        }
    },
    render: function render() {
        return React.createElement(
            'div',
            { id: "map-wrapper" },
            React.createElement('div', { id: "map" })
        );
    }
});