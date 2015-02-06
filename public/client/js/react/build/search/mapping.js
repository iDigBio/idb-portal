/**
 * @jsx React.DOM
 */

var React = require('react');

module.exports = React.createClass({displayName: "exports",
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
    resetBounds: function(){
        var b = this.currentBounds();
        b.top_left.lat=false;
        b.top_left.lon=false;
        b.bottom_right.lat=false;
        b.bottom_right.lon=false;
        this.props.searchChange('bounds',b);
    },
    degreeChange: function(event){
        var bounds = this.currentBounds();
        var val = event.currentTarget.value;
        if(_.isEmpty(helpers.strip(val))){
            val = false;
        }
        bounds[event.currentTarget.attributes['data-corner'].value][event.currentTarget.attributes['data-name'].value]=val;
        this.props.searchChange('bounds',bounds);
    },
    render: function(){
        var bounds = this.props.bounds;
        return(
            React.createElement("div", {className: "clearfix section "+this.props.active, id: "mapping"}, 
                React.createElement("div", {className: "option-group", id: "mapping-options"}, 
                    React.createElement("span", {className: "title"}, "Lat/Lon Bounding Box"), 
                    React.createElement("a", {className: "btn", onClick: this.resetBounds}, 
                        "Clear"
                    ), 
                    React.createElement("div", {className: "ordinates clearfix"}, 
                        React.createElement("label", {className: "title"}, "NorthWest"), 
                        React.createElement("div", {className: "pull-left ordinate"}, 
                            "Lat:", 
                            React.createElement("input", {type: "text", 
                                onChange: this.degreeChange, 
                                value: !bounds.top_left.lat ? '' : bounds.top_left.lat, 
                                placeholder: "90.0", 
                                "data-corner": "top_left", 
                                "data-name": "lat", 
                                className: "coordinate form-control"})
                        ), 
                        React.createElement("div", {className: "ordinate"}, 
                            "Lon:", 
                            React.createElement("input", {type: "text", 
                                onChange: this.degreeChange, 
                                value: !bounds.top_left.lon ? '' : bounds.top_left.lon, 
                                placeholder: "-180.0", 
                                "data-corner": "top_left", 
                                "data-name": "lon", 
                                className: "coordinate form-control"})
                        )
                    ), 
                    React.createElement("div", {className: "ordinates clearfix"}, 
                        React.createElement("label", {className: "title"}, "SouthEast"), 
                        React.createElement("div", {className: "pull-left ordinate"}, 
                            "Lat:", 
                            React.createElement("input", {type: "text", 
                                onChange: this.degreeChange, 
                                value: !bounds.bottom_right.lat ? '' : bounds.bottom_right.lat, 
                                placeholder: "-90.0", 
                                "data-corner": "bottom_right", 
                                "data-name": "lat", 
                                className: "coordinate form-control"})
                        ), 
                        React.createElement("div", {className: "ordinate"}, 
                            "Lon:", 
                            React.createElement("input", {type: "text", 
                                onChange: this.degreeChange, 
                                value: !bounds.bottom_right.lon ? '' : bounds.bottom_right.lon, 
                                placeholder: "180.0", 
                                "data-corner": "bottom_right", 
                                "data-name": "lon", 
                                className: "coordinate form-control"})
                        )
                    )
                )
            )
        )
    }
})