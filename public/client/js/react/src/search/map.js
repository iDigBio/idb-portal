import React, { useState, useEffect, useRef } from 'react';
import IDBMap from '../../../lib/mapper';
import * as helpers from '../../../lib/helpers';

let map; // Declare map variable

const Map = (props) => {
    const [currentQuery, setCurrentQuery] = useState(JSON.stringify(queryBuilder.buildQueryShim(props.search)));
    const mapRef = useRef(null); // To store the map instance without triggering re-renders
    const searchRef = useRef(props.search);

    // Equivalent to componentDidMount and componentDidUpdate
    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = new IDBMap('map', {
                queryChange: function(query) {
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
                                        lat: query.geopoint.lat,
                                        lon: query.geopoint.lon
                                    }
                                };
                                break;
                        }
                        props.viewChange('optionsTab', 'mapping');
                        props.searchChange('mapping', mapping);
                    }
                }
            });
        }

        if (!searchRef.current) {
            searchRef.current = props.search
        }

        const query = queryBuilder.buildQueryShim(props.search);
        mapRef.current.query(query);
    }, []);

    // Equivalent to UNSAFE_componentWillReceiveProps and shouldComponentUpdate
    useEffect(() => {
        const prevSearch = searchRef.current
        if (prevSearch === props.search) {
            return
        }

        const q = queryBuilder.buildQueryShim(props.search);
        const next = JSON.stringify(q);

        if (next !== currentQuery) {
            setCurrentQuery(next);
            mapRef.current.query(q);
            searchRef.current = props.search
        }
    }, [props.search, currentQuery]);

    return (
        <div id="map-wrapper">
            <div id="map"></div>
        </div>
    );
}

export default Map;