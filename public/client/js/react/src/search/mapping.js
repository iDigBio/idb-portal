import React, {useEffect, useState} from "react";

function defaultBoxBounds(){
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

function defaultRadiusBounds(){
    return {
        distance: false,
        lat:false,
        lon:false
    }
}
const Mapping = ({mapping, searchChange, active}) => {
    const [type, setType] = useState(mapping.type)

    useEffect(() => {
        if (mapping.type !== type) {
            setType(mapping.type)
        }
    }, [mapping.type])

    function defaultMappingProps(type){
        if(type=='box'){
            return defaultBoxBounds();
        }else if(type=='radius'){
            return defaultRadiusBounds();
        }
    }
    function resetBounds(e){
        e.preventDefault();
        var t = type
        searchChange('mapping',{type: t, bounds: defaultMappingProps(t)});
    }

    function mappingType(e){
        var t = e.target.value;
        setType(t)
    }

    var localMapping = mapping, localType;
    switch(type){
        case 'box':
            localType= <Box searchChange={searchChange} mapping={mapping}/>
            break;
        case 'radius':
            localType= <Radius searchChange={searchChange} mapping={mapping}/>
            break;
    }
    return(
        <div className={"clearfix section "+active} id="mapping">
            <div className="option-group" id="mapping-options">
                <span className="title">Lat/Lon Bounds</span>
                <a href="#" role="button" className="btn" onClick={resetBounds} style={{fontSize: '14px', color: '#0088cc'}}>
                    Clear
                </a>
                <div className="form" >
                    <label className="radio-inline">
                        <input type="radio" name="mapping-type" id="box" value="box" checked={type=='box'} onChange={mappingType}/>Rectangle
                    </label>
                    <label className="radio-inline">
                        <input type="radio" name="mapping-type" id="radius" value="radius" checked={type=='radius'} onChange={mappingType}/>Circle
                    </label>
                </div>
                {localType}
            </div>
        </div>
    )

}

const Box = ({mapping, searchChange}) => {
    
    function currentBounds(){
        //use this function instead of calling this.props.bounds so 
        //we always pass a new object when updating bound changes
        
        if(mapping.type=='box'){
            var b = mapping.bounds;
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
            return defaultBoxBounds();
        }
    }

    function degreeChange(event){
        var bounds = currentBounds();
        var val = event.currentTarget.value;
        if(_.isEmpty(helpers.strip(val))){
            val = false;
        }
        bounds[event.currentTarget.attributes['data-corner'].value][event.currentTarget.attributes['data-name'].value]=val;
        searchChange('mapping',{type: "box", bounds: bounds});
    }

    var bounds = currentBounds();
    return (
        <div>
            <div className="ordinates clearfix">
                <label className="title">NorthWest</label>
                <div className="pull-left ordinate">
                    Lat:
                    <input type="text"
                        onChange={degreeChange}
                        value={!bounds.top_left.lat ? '' : bounds.top_left.lat}
                        placeholder="90.0"
                        data-corner="top_left"
                        data-name="lat"
                        className="coordinate form-control"/>
                </div>
                <div className="ordinate">
                    Lon:
                    <input type="text"
                        onChange={degreeChange}
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
                        onChange={degreeChange}
                        value={!bounds.bottom_right.lat ? '' : bounds.bottom_right.lat}
                        placeholder="-90.0"
                        data-corner="bottom_right"
                        data-name="lat"
                        className="coordinate form-control"/>
                </div>
                <div className="ordinate">
                    Lon:
                    <input type="text"
                        onChange={degreeChange}
                        value={!bounds.bottom_right.lon ? '' : bounds.bottom_right.lon}
                        placeholder="180.0"
                        data-corner="bottom_right"
                        data-name="lon"
                        className="coordinate form-control" />
                </div>
            </div>
        </div>
    )

};

const Radius = ({mapping, searchChange}) => {

    function currentBounds(){
        if(mapping.type=='radius'){
            var bounds = mapping.bounds;
            return {
                distance: bounds.distance,
                lat: bounds.lat,
                lon: bounds.lon
            }            
        }else{
            return defaultRadiusBounds();
        }
    }

    function boundsChange(e){
        var b = currentBounds();
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
        searchChange('mapping',{type:'radius',bounds: b});
        //}
    }

    var bounds = currentBounds();
    return(
        <div>
            <div className="ordinates clearfix">
                <label className="title">Point Location</label>
                <div className="pull-left ordinate">
                    Lat:
                    <input type="text"
                        onChange={boundsChange}
                        value={!bounds.lat ? '' : bounds.lat}
                        name="lat"
                        className="coordinate form-control"/>
                </div>
                <div className="ordinate">
                    Lon:
                    <input type="text"
                        onChange={boundsChange}
                        value={!bounds.lon ? '' : bounds.lon}
                        name="lon"
                        className="coordinate form-control" />
                </div>
            </div>
            <div className="ordinates clearfix">
                <label>Radius Length</label>
                <div className=" pull-left distance">
                    <input type="text"
                        onChange={boundsChange}
                        value={!bounds.distance ? '' : bounds.distance}
                        name="distance"
                        className="coordinate form-control"/> km
                </div>
            </div>
        </div>
    )
}

export default Mapping;