
var React = require('react');
//var PureRender = require('react/addons').addons.PureRenderMixin;
export default class Mapping extends React.Component{
    //mixins: [PureRender],
    // getInitialState(){
    //     return {type: this.props.mapping.type};
    // }
    constructor(props) {
        super(props)
        this.state = {
            type: props.mapping.type
        }
        this.defaultMappingProps = this.defaultMappingProps.bind(this)
        this.resetBounds = this.resetBounds.bind(this)
        this.mappingType = this.mappingType.bind(this)

    }
    defaultMappingProps(type){
        if(type=='box'){
            return Box.defaultBounds();
        }else if(type=='radius'){
            return Radius.defaultBounds();
        }
    }
    resetBounds(){
        var t = this.state.type
        this.props.searchChange('mapping',{type: t, bounds: this.defaultMappingProps(t)});
    }

    mappingType(e){
        var t = e.target.value;
        this.setState({type: t});       
    }
    // static getDerivedStateFromProps(nextProps) {
    //     if(nextProps.mapping.type !== this.state.type){
    //         return {type: nextProps.mapping.type}
    //     }
    // }
    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps.mapping.type !== this.state.type){
            this.setState({type: nextProps.mapping.type});
        }
    }
    render(){
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
                    <span className="title">Lat/Lon Bounds</span>
                    <a className="btn" onClick={this.resetBounds}>
                        Clear
                    </a>
                    <div className="form" >
                        <label className="radio-inline">
                            <input type="radio" name="mapping-type" id="box" value="box" checked={this.state.type=='box'} onChange={this.mappingType}/>Rectangle
                        </label>
                        <label className="radio-inline">
                            <input type="radio" name="mapping-type" id="radius" value="radius" checked={this.state.type=='radius'} onChange={this.mappingType}/>Circle
                        </label>     
                    </div>
                    {type}
                </div>
            </div>
        )
    }
}

class Box extends React.Component{
    constructor(props) {
        super(props)
        this.currentBounds = this.currentBounds.bind(this)
        this.degreeChange = this.degreeChange.bind(this)
    }
    static defaultBounds(){
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
    
    currentBounds(){
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
    }
    degreeChange(event){
        var bounds = this.currentBounds();
        var val = event.currentTarget.value;
        if(_.isEmpty(helpers.strip(val))){
            val = false;
        }
        bounds[event.currentTarget.attributes['data-corner'].value][event.currentTarget.attributes['data-name'].value]=val;
        this.props.searchChange('mapping',{type: "box", bounds: bounds});
    }
    render(){
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
};

class Radius extends React.Component{
        constructor(props) {
            super(props)
            this.currentBounds = this.currentBounds.bind(this)
            this.boundsChange = this.boundsChange.bind(this)
        }
        static defaultBounds(){
            return {
                distance: false,
                lat:false,
                lon:false
            }
        }
    
    currentBounds(){
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
    }

    boundsChange(e){
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
    }
    render(){
        var bounds = this.currentBounds();
        return(
            <div>
                <div className="ordinates clearfix">
                    <label className="title">Point Location</label>
                    <div className="pull-left ordinate">
                        Lat:
                        <input type="text" 
                            onChange={this.boundsChange} 
                            value={!bounds.lat ? '' : bounds.lat} 
                            name="lat" 
                            className="coordinate form-control"/>
                    </div>
                    <div className="ordinate">
                        Lon:
                        <input type="text" 
                            onChange={this.boundsChange} 
                            value={!bounds.lon ? '' : bounds.lon} 
                            name="lon" 
                            className="coordinate form-control" />
                    </div>
                </div>
                <div className="ordinates clearfix">
                    <label>Radius Length</label>
                    <div className=" pull-left distance">
                        <input type="text" 
                            onChange={this.boundsChange} 
                            value={!bounds.distance ? '' : bounds.distance} 
                            name="distance" 
                            className="coordinate form-control"/> km
                    </div>
                </div>                
            </div>
        ) 
    }
}