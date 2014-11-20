/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({displayName: 'exports',
    currentBounds: function(){
        var b = this.props.bounds;
        return {
            top_left: {
                lat: b.top_left.lat,
                lon: b.top_left.lon
            },
            bottom_right: {
                lat: b.bottom_right.lat,
                lon: b.bottom_right.lon
            }
        }
    },
    degreeChange: function(event){
        var bounds = this.currentBounds();
        bounds[event.currentTarget.attributes['data-corner'].value][event.currentTarget.attributes['data-name'].value]=event.currentTarget.value;
        this.props.searchChange('bounds',bounds);
    },
    render: function(){
        var bounds = this.props.bounds;
        return(
            React.DOM.div({className: "option-group", id: "mapping-options"}, 
                React.DOM.h5(null, "Lat/Lon Bounding Box"), 
                React.DOM.div({className: "ordinates clearfix"}, 
                    React.DOM.label({className: "title"}, "NorthWest"), 
                    React.DOM.div({className: "pull-left ordinate"}, 
                        "Lat:", 
                        React.DOM.input({type: "text", 
                            onChange: this.degreeChange, 
                            value: !bounds.top_left.lat ? '' : bounds.top_left.lat, 
                            placeholder: "90.0", 
                            'data-corner': "top_left", 
                            'data-name': "lat", 
                            className: "coordinate form-control"})
                    ), 
                    React.DOM.div({className: "ordinate"}, 
                        "Lon:", 
                        React.DOM.input({type: "text", 
                            onChange: this.degreeChange, 
                            value: !bounds.top_left.lon ? '' : bounds.top_left.lon, 
                            placeholder: "-180.0", 
                            'data-corner': "top_left", 
                            'data-name': "lon", 
                            className: "coordinate form-control"})
                    )
                ), 
                React.DOM.div({className: "ordinates clearfix"}, 
                    React.DOM.label({className: "title"}, "SouthEast"), 
                    React.DOM.div({className: "pull-left ordinate"}, 
                        "Lat:", 
                        React.DOM.input({type: "text", 
                            onChange: this.degreeChange, 
                            value: !bounds.bottom_right.lat ? '' : bounds.bottom_right.lat, 
                            placeholder: "-90.0", 
                            'data-corner': "bottom_right", 
                            'data-name': "lat", 
                            className: "coordinate form-control"})
                    ), 
                    React.DOM.div({className: "ordinate"}, 
                        "Lon:", 
                        React.DOM.input({type: "text", 
                            onChange: this.degreeChange, 
                            value: !bounds.bottom_right.lon ? '' : bounds.bottom_right.lon, 
                            placeholder: "180.0", 
                            'data-corner': "bottom_right", 
                            'data-name': "lon", 
                            className: "coordinate form-control"})
                    )
                )
            )
        )
    }
})