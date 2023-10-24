
var React = require('react');
var IDBMap = require('../../../lib/mapper');
var helpers = require('../../../lib/helpers');

var map; 
export default class Map extends React.Component{
    // currentQuery = '';

    constructor(props) {
        super(props);
        this.state = {
            currentQuery: '',
        }
    }

    componentDidMount(){
        var self=this;
        map = new IDBMap('map',{
            queryChange: function(query){
                var mapping;
                if(_.has(query,'geopoint')){
                    switch(query.geopoint.type){
                        case 'geo_bounding_box':
                            mapping={
                                type: 'box',
                                bounds: {
                                    top_left: query.geopoint.top_left,
                                    bottom_right: query.geopoint.bottom_right
                                }
                            }
                            break;
                        case 'geo_distance':
                            mapping={
                                type: 'radius',
                                bounds: {
                                    distance: query.geopoint.distance,
                                    lat: query.geopoint.lat,//e.layer._latlng.lat,
                                    lon: query.geopoint.lon //e.layer._latlng.lng
                                }
                            }
                            break;
                    } 
                    self.props.viewChange('optionsTab','mapping');
                    self.props.searchChange('mapping',mapping);                     
                }
            }
        });

        var query = queryBuilder.buildQueryShim(this.props.search);
        map.query(query)
    }
    shouldComponentUpdate(){
        return false;
    }

    componentDidUpdate(nextProps) {
        var q = queryBuilder.buildQueryShim(nextProps.search);
        var next=JSON.stringify(q);
        //debugger
        if(next!==this.currentQuery){
            this.currentQuery=next;
            map.query(q);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        var q = queryBuilder.buildQueryShim(nextProps.search);
        var next=JSON.stringify(q);
        //debugger
        if(next!==this.currentQuery){
            this.currentQuery=next;
            map.query(q);
        }
    }
    render(){
        return (
            <div id="map-wrapper">
                <div id="map"></div>
            </div>
        )
    }
}