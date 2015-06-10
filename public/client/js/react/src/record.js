
var React = require('react')
var dwc = require('../../lib/dwc_fields');
var _ = require('lodash');
var fields = require('../../lib/fields');

var Tab = React.createClass({
    showSection: function(event){
        event.preventDefault();
        $('li.tab').removeClass('active');
        $(event.currentTarget).addClass('active');
        $('.section').addClass('visible-print-block');
        $('#'+$(event.currentTarget).attr('data-tab')).removeClass('visible-print-block');
    },
    render: function(){
        var cl = "tab";
        if(this.props.active){
            cl="tab active";
        }
        return (
            <li className={cl} data-tab={this.props.name} onClick={this.showSection}>
                <a href={'#'+this.props.name}>
                    {dwc.names[this.props.name]}
                </a>
            </li>
        );
    }
});

var Row = React.createClass({
    render: function(){
        var name = _.isUndefined(dwc.names[this.props.keyid]) ? this.props.keyid : dwc.names[this.props.keyid];
        var regex = /[\A|\s]+(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=;]+)/g;
        var str = this.props.data.replace(regex, function(match){
            var href = match.replace(/(;|=|\+|!|&|,|\(|\)|\*|'|#)$/, '');
            return "<a target=\"_outlink\" href=\""+href+"\">"+match+"</a>";
           
        });
        return (
            <tr className="data-row">
                <td className="field-name">{name}</td>
                <td className="field-value" dangerouslySetInnerHTML={{__html: str}}></td>
            </tr>
        );   
    }
});

var Section = React.createClass({
    render: function(){
        var rows = [],self=this;
        var data = this.props.data;

        _.each(data,function(fld){
            var key = Object.keys(fld)[0];
            if(_.isString(fld[key])){
                rows.push(<Row key={key} keyid={key} data={fld[key]}/>);
            } 
        });        
        /*_.each(data, function(fld){
            var key = Object.keys(fld)[0];
            var name = _.isUndefined(dwc.names[key]) ? key : dwc.names[key];
            var regex = /(https?:\/\/(\S|\w)+)/;
            var val = fld[key];
            if(_.isString(val)){
               val = val.replace(regex, "<a target=\"_outlink\" href=\"$1\">$1</a>");
            }
            rows.push( 
                <Row keyid={key} key={key} className="data-row">
                    <td className="field-name">{name}</td>
                    <td className="field-value" dangerouslySetInnerHTML={{__html: val}}></td>
                </tr>
            ); 
        });*/
        var cl = "section visible-print-block";
        if(this.props.active){
            cl="section";
        }
        return (
            <div id={this.props.name} className={cl} >
                <table className="record-table">
                    {rows}
                </table>
            </div>
        );
    }
});

var Record = React.createClass({
    render: function(){
        var has = [];
        var sorder = ['taxonomy','specimen','collectionevent','locality','paleocontext','other'];
        var record =[],tabs=[],self=this;
        var cnt = 0;
        sorder.forEach(function(sec,index){
            if(_.has(self.props.record,sec)){
                var active=false;
                if(cnt===0){
                    active=true;
                }
                tabs.push(<Tab key={'tab-'+sec} keyid={'tab-'+sec} name={sec} active={active} />)
                record.push(<Section key={'sec-'+sec} key={'sec-'+sec} name={sec} data={self.props.record[sec]} active={active} />);
                cnt++;
            } 
        })

        return (
            <div id="record-container">
                <ul className="tabs hidden-print">
                    {tabs}
                </ul>
                <div className="record">
                    {record}
                </div>
            </div>
        );
    }
});

var Img = React.createClass({
    error: function(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    },
    render: function(){
        return (
            <a href={'/portal/mediarecords/'+this.props.keyid} title="click to open media record">
                <img className="gallery-image" onError={this.error} src={'//api.idigbio.org/v1/mediarecords/'+this.props.keyid+'/media?quality=webview'} /> 
            </a>
        );
    }
});

var Gallery = React.createClass({
    render: function(){
        if(_.has(this.props.data,'mediarecords')){
            var imgs = [];
            _.each(this.props.data.mediarecords,function(item){
                imgs.push(<Img key={item} keyid={item} />);
            })
        
            return (
                <div id="gallery-wrapper">       
                    <h4 className="title">Media</h4>
                    <div id="gallery">
                        {imgs}
                    </div>
                </div>
            );
        }else{
            return <span/>
        }
    }
});

var Buttons = React.createClass({
    print: function(){
        window.print()
    },
    render: function(){

        return (
            <div id="actions" className="clearfix hidden-print">
                
                <div id="action-buttons">
                    <a href={"/portal/recordsets/"+this.props.data.recordset}>
                        <button className="btn">Go To Recordset</button>
                    </a>
                    <button data-target="#raw" data-toggle="modal" className="btn">
                        View Raw Data
                    </button>
                    <button className="btn" title="print this page" onClick={this.print}>
                        <i className="glyphicon glyphicon-print"> </i>
                    </button>
                </div>
            </div>
        )
    }
});

var Map = React.createClass({
    render: function(){
        if(_.has(this.props.data,'geopoint')){
            return (
                <div id="map" className="clearfix">
                    <h4 className="title">Georeference Data</h4>
                    <div id="map-wrapper">
                        <div id="map-box"></div>
                        <div id="map-geopoint">
                            <span>Lat: {this.props.data.geopoint.lat}</span>
                            <span>Lon: {this.props.data.geopoint.lon}</span>
                        </div>
                    </div>
                </div>
            )
        }else{
            return <span/>
        }
    }
});

var Provider = require('./shared/provider');
var Raw = require('./shared/raw');
var Title = require('./shared/title');

module.exports = Page = React.createClass({
    render: function(){
        var data = this.props.record.data, index = this.props.record.indexTerms;//resp._source.data['idigbio:data'];
        var has = [],canonical={};
        var record = {};

        //build canonical dictionary
        //first adding indexTerms which can contain corrected/added data not in the raw data
        _.forOwn(index,function(v,k){
            if(_.has(fields.byTerm,k) && _.has(fields.byTerm[k],'dataterm')){
                var dt=fields.byTerm[k].dataterm;
                //use data dictionary term if it is exists because its not corrected data
                //and contains the orginal text caseing.
                if(_.has(data,dt)){
                    canonical[dt]=data[dt];
                }else{
                    canonical[dt]=v;
                }   
            }
        })
        //then add raw data that isn't supplied by indexTerms
        _.defaults(canonical,data);

        _.each(dwc.order,function(val,key){
            _.each(dwc.order[key],function(fld){
                if(_.has(canonical,fld)){
                    if(_.has(record,key)===false){
                        record[key]=[]
                    } 
                    var datum={};
                    datum[fld]=canonical[fld];
                    record[key].push(datum);
                    has.push(fld);
                }
            });
        });
        //add unidentified values to other section
        var dif = _.difference(Object.keys(canonical), has);
        _.each(dif,function(item){
            if(item.indexOf('idigbio:')===-1){
                if(_.isUndefined(record['other'])){
                    record['other']=[];
                }     
                var datum={};
                datum[item]=canonical[item];       
                record['other'].push(datum);
            }
        });
       
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-12">   

                        <div id="data-container" className="clearfix">
                            <Title data={this.props.record}/>
                            <div id="data-content">
                                <Record record={record} />
                            </div>
                            <div id="data-meta" className="clearfix">
                                <Buttons data={index} /> 
                                <Gallery data={index} />
                                <Map data={index} />
                            </div>
                            <Provider data={this.props.record.attribution} />
                        </div>
                    </div>
                </div>
                <Raw data={this.props.record} />
            </div>
        )
    }

})
