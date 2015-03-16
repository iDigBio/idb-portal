
var React = require('react');

module.exports = React.createClass({
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
    render: function(){
        var mapping = this.props.mapping, type;
        switch(this.state.type){
            case 'box':
                type= <Box searchChange={this.props.searchChange} mapping={mapping}/>
                break;
            case 'radius':
                type= <Radius searchChange={this.props.searchChange} mapping={mapping}/>
                break;
        }
        return(
            <div className={"clearfix section "+this.props.active} id="mapping">
                <div className="option-group" id="mapping-options"> 
                    <span className="title">Lat/Lon Contraints</span>
                    <a className="btn pull-right" onClick={this.resetBounds}>
                        Clear
                    </a>
                    <div className="form" >
                        <label className="radio-inline">
                            <input type="radio" name="mapping-type" id="box" value="box" checked={this.state.type=='box'} onChange={this.mappingType}/>Bounding Box
                        </label>
                        <label className="radio-inline">
                            <input type="radio" name="mapping-type" id="radius" value="radius" checked={this.state.type=='radius'} onChange={this.mappingType}/>Radius
                        </label>     
                    </div>
                    {type}
                </div>
            </div>
        )
    }
})

var Box = React.createClass({
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
            <div>
                <div className="ordinates clearfix">
                    <label className="title">NorthWest</label>
                    <div className="pull-left ordinate">
                        Lat:
                        <input type="text" 
                            onChange={this.degreeChange} 
                            value={!bounds.top_left.lat ? '' : bounds.top_left.lat} 
                            placeholder="90.0"
                            data-corner="top_left" 
                            data-name="lat" 
                            className="coordinate form-control"/>
                    </div>
                    <div className="ordinate">
                        Lon:
                        <input type="text" 
                            onChange={this.degreeChange} 
                            value={!bounds.top_left.lon ? '' : bounds.top_left.lon} 
                            placeholder="-180.0"
                            data-corner="top_left" 
                            data-name="lon" 
                            className="coordinate form-control" />
                    </div>
                </div>
                <div className="ordinates clearfix">
                    <label className="title">SouthEast</label>
                    <div className="pull-left ordinate">
                        Lat:
                        <input type="text" 
                            onChange={this.degreeChange} 
                            value={!bounds.bottom_right.lat ? '' : bounds.bottom_right.lat} 
                            placeholder="-90.0"
                            data-corner="bottom_right" 
                            data-name="lat" 
                            className="coordinate form-control"/>
                    </div>
                    <div className="ordinate">
                        Lon:
                        <input type="text" 
                            onChange={this.degreeChange} 
                            value={!bounds.bottom_right.lon ? '' : bounds.bottom_right.lon} 
                            placeholder="180.0"
                            data-corner="bottom_right" 
                            data-name="lon" 
                            className="coordinate form-control" />
                    </div>
                </div>
            </div>
        )
    }
});

var Radius = React.createClass({
    statics: {
        defaultBounds: function(){
            return {
                distance: false,
                location:{
                    lat:false,
                    lon:false
                }
            }
        }
    },
    currentBounds: function(){
        if(this.props.mapping.type=='radius'){
            var bounds = this.props.mapping.bounds;
            return {
                distance: bounds.distance,
                location:{
                    lat: bounds.location.lat,
                    lon: bounds.location.lon
                }
            }            
        }else{
            return Radius.defaultBounds();
        }
    },

    boundsChange: function(e){
        var b = this.currentBounds();
        switch(e.target.name){
            case 'distance':
                b.distance=e.target.value;
                break;
            case 'lat':
                b.location.lat=e.target.value;
                break;
            case 'lon':
                b.location.lon=e.target.value;
                break;
        }
        this.props.searchChange('mapping',{type:'radius',bounds: b});
    },
    render: function(){
        var bounds = this.currentBounds();
        return(
            <div>
                <div className="ordinates clearfix">
                    <label className="title">Point Location</label>
                    <div className="pull-left ordinate">
                        Lat:
                        <input type="text" 
                            onChange={this.boundsChange} 
                            value={!bounds.location.lat ? '' : bounds.location.lat} 
                            name="lat" 
                            className="coordinate form-control"/>
                    </div>
                    <div className="ordinate">
                        Lon:
                        <input type="text" 
                            onChange={this.boundsChange} 
                            value={!bounds.location.lon ? '' : bounds.location.lon} 
                            name="lon" 
                            className="coordinate form-control" />
                    </div>
                </div>
                <div className="ordinates clearfix">
                    <label className="title">Radius Length</label>
                    <div className="pull-left ordinate">
                        <input type="text" 
                            onChange={this.boundsChange} 
                            value={!bounds.distance ? '' : bounds.distance} 
                            name="distance" 
                            className="coordinate form-control"/>
                    </div>
                </div>                
            </div>
        ) 
    }
})