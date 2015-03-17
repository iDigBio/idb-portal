
var React = require('react');

module.exports = React.createClass({displayName: "exports",
    getInitialState: function(){
        return {type: this.props.mapping.type};
    },
    defaultMappingProps: function(type){
        if(type=='box'){
            return Box.defaultBounds();
        }else if(type=='radius'){
            return Radius.defaultBounds();
        }
    },
    resetBounds: function(){
        /*var b = this.currentBounds();
        b.top_left.lat=false;
        b.top_left.lon=false;
        b.bottom_right.lat=false;
        b.bottom_right.lon=false;*/
        var t = this.state.type
        this.props.searchChange('mapping',{type: t, bounds: this.defaultMappingProps(t)});
    },

    mappingType: function(e){
        var t = e.target.value;
        this.setState({type: t});       
        //this.props.searchChange('mapping',{type: t, bounds: this.defaultMappingProps(t)});
    },
    componentWillReceiveProps: function(nextProps){
        if(nextProps.mapping.type !== this.state.type){
            this.setState({type: nextProps.mapping.type});
        }
    },
    render: function(){
        var mapping = this.props.mapping, type;
        switch(this.state.type){
            case 'box':
                type= React.createElement(Box, {searchChange: this.props.searchChange, mapping: mapping})
                break;
            case 'radius':
                type= React.createElement(Radius, {searchChange: this.props.searchChange, mapping: mapping})
                break;
        }
        return(
            React.createElement("div", {className: "clearfix section "+this.props.active, id: "mapping"}, 
                React.createElement("div", {className: "option-group", id: "mapping-options"}, 
                    React.createElement("span", {className: "title"}, "Lat/Lon Contraints"), 
                    React.createElement("a", {className: "btn pull-right", onClick: this.resetBounds}, 
                        "Clear"
                    ), 
                    React.createElement("div", {className: "form"}, 
                        React.createElement("label", {className: "radio-inline"}, 
                            React.createElement("input", {type: "radio", name: "mapping-type", id: "box", value: "box", checked: this.state.type=='box', onChange: this.mappingType}), "Bounding Box"
                        ), 
                        React.createElement("label", {className: "radio-inline"}, 
                            React.createElement("input", {type: "radio", name: "mapping-type", id: "radius", value: "radius", checked: this.state.type=='radius', onChange: this.mappingType}), "Radius"
                        )
                    ), 
                    type
                )
            )
        )
    }
})

var Box = React.createClass({displayName: "Box",
    statics: {
        defaultBounds: function(){
            return {
                top_left: {
                    lat: false,
                    lon: false
                },
                bottom_right: {
                    lat: false,
                    lon: false
                }
            }
        }
    },
    currentBounds: function(){
        //use this function instead of calling this.props.bounds so 
        //we always pass a new object when updating bound changes
        
        if(this.props.mapping.type=='box'){
            var b = this.props.mapping.bounds;
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
        }else{
            return Box.defaultBounds();
        }
    },
    degreeChange: function(event){
        var bounds = this.currentBounds();
        var val = event.currentTarget.value;
        if(_.isEmpty(helpers.strip(val))){
            val = false;
        }
        bounds[event.currentTarget.attributes['data-corner'].value][event.currentTarget.attributes['data-name'].value]=val;
        this.props.searchChange('mapping',{type: "box", bounds: bounds});
    },
    render: function(){
        var bounds = this.currentBounds();
        return (
            React.createElement("div", null, 
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
    }
});

var Radius = React.createClass({displayName: "Radius",
    statics: {
        defaultBounds: function(){
            return {
                distance: false,
                lat:false,
                lon:false
            }
        }
    },
    currentBounds: function(){
        if(this.props.mapping.type=='radius'){
            var bounds = this.props.mapping.bounds;
            return {
                distance: bounds.distance,
                lat: bounds.lat,
                lon: bounds.lon
            }            
        }else{
            return Radius.defaultBounds();
        }
    },

    boundsChange: function(e){
        var b = this.currentBounds();
        var val = _.isEmpty(e.target.value) ?  false : e.target.value;
        switch(e.target.name){
            case 'distance':
                b.distance=val;
                break;
            case 'lat':
                b.lat=val;
                break;
            case 'lon':
                b.lon=val;
                break;
        }
        //if(b.distance && b.lat && b.lon){
        this.props.searchChange('mapping',{type:'radius',bounds: b});
        //}
    },
    render: function(){
        var bounds = this.currentBounds();
        return(
            React.createElement("div", null, 
                React.createElement("div", {className: "ordinates clearfix"}, 
                    React.createElement("label", {className: "title"}, "Point Location"), 
                    React.createElement("div", {className: "pull-left ordinate"}, 
                        "Lat:", 
                        React.createElement("input", {type: "text", 
                            onChange: this.boundsChange, 
                            value: !bounds.lat ? '' : bounds.lat, 
                            name: "lat", 
                            className: "coordinate form-control"})
                    ), 
                    React.createElement("div", {className: "ordinate"}, 
                        "Lon:", 
                        React.createElement("input", {type: "text", 
                            onChange: this.boundsChange, 
                            value: !bounds.lon ? '' : bounds.lon, 
                            name: "lon", 
                            className: "coordinate form-control"})
                    )
                ), 
                React.createElement("div", {className: "ordinates clearfix"}, 
                    React.createElement("label", null, "Radius Length"), 
                    React.createElement("div", {className: " pull-left ordinate"}, 
                        React.createElement("input", {type: "text", 
                            onChange: this.boundsChange, 
                            value: !bounds.distance ? '' : bounds.distance, 
                            name: "distance", 
                            className: "coordinate form-control pull-left"})
                    )
                )
            )
        ) 
    }
})