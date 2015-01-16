/**
 * @jsx React.DOM
 */

var React = require('react')
var dwc = require('../../lib/dwc_fields');
var _ = require('lodash');
var fields = require('../../lib/fields');

var Tab = React.createClass({
    showSection: function(event){
        event.preventDefault();
        $('li.tab').removeClass('active');
        $(event.currentTarget).addClass('active');
        $('.section').addClass('section-hide');
        $('#'+$(event.currentTarget).attr('data-tab')).removeClass('section-hide');
    },
    render: function(){
        return (
            <li className='tab' data-tab={this.props.key} onClick={this.showSection}>
                <a href={'#'+this.props.key}>
                    {dwc.names[this.props.key]}
                </a>
            </li>
        );
    }
});

var Row = React.createClass({
    render: function(){
        var name = _.isUndefined(dwc.names[this.props.key]) ? this.props.key : dwc.names[this.props.key];
        var regex = /(https?:\/\/(\S|\w)+)/;
        var str = this.props.data[this.props.key].replace(regex, "<a target=\"_outlink\" href=\"$1\">$1</a>");
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
        
        _.each(data, function(fld){
            var key = Object.keys(fld)[0];
            console.log(self.props.key + '-'+key);
            var name = _.isUndefined(dwc.names[key]) ? key : dwc.names[key];
            var regex = /(https?:\/\/(\S|\w)+)/;
            var str = fld[key].replace(regex, "<a target=\"_outlink\" href=\"$1\">$1</a>");
            rows.push( 
                <tr key={key} className="data-row">
                    <td className="field-name">{name}</td>
                    <td className="field-value" dangerouslySetInnerHTML={{__html: str}}></td>
                </tr>
            ); 
        });
        
        return (
            <div id={this.props.key} className="section section-hide" >
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
        sorder.forEach(function(sec){
            if(_.has(self.props.record,sec)){
                tabs.push(<Tab key={'tab-'+sec}/>)
                record.push(<Section key={'sec-'+sec} data={self.props.record[sec]}/>);
            } 
        })

        return (
            <div id="record-container">
                <ul className="tabs">
                    {tabs}
                </ul>
                <div className="record">
                    {record}
                </div>
            </div>
        );
    }
});

var Title = React.createClass({
    render: function(){
        var title = '',info=[];
        //build title
        var data = this.props.data;
        if(_.has(data,'dwc:scientificName')) { 
            title = data['dwc:scientificName'] ;
        }else if(_.has(data, 'dwc:genus')){
            title = data['dwc:genus'];
            if(_.has(data, 'dwc:specificEpithet')){
                title += data['dwc:specificEpithet'];
            }
        }
        if(_.isEmpty(title)){
            title = 'No Name';
        } 
        //var author = '';
        if(_.has(data,'dwc:scientificNameAuthorship')){
            info.push(data['dwc:scientificNameAuthorship']);
        }
        //build info ids,inst
        ['dwc:institutionCode','dwc:collectionCode','dwc:catalogNumber'].forEach(function(item){
            if(_.has(data,item)){
                info.push(data[item]);
            }
        }) 

        return (
            <h1 id="title" className="clearfix">
                <em>{title}</em>
                <span className="title-addition">
                    {info.join(', ')}
                </span>
            </h1>
        );       
    }
});

var Img = React.createClass({
    error: function(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    },
    render: function(){
        return (
            <a href={'/portal/mediarecords/'+this.props.key} title="click to open media record">
                <img className="gallery-image" onError={this.error} src={'//api.idigbio.org/v1/mediarecords/'+this.props.key+'/media?quality=webview'} /> 
            </a>
        );
    }
});

var Gallery = React.createClass({
    render: function(){
        if(_.has(this.props.data,'mediarecords')){
            var imgs = [];
            _.each(this.props.data.mediarecords,function(item){
                imgs.push(<Img key={item} />)
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
})

var Buttons = React.createClass({
    print: function(){
        window.print()
    },
    render: function(){

        return (
            <div id="actions" className="clearfix">
                
                <div id="action-buttons">
                    <a href={"/portal/recordsets/"+this.props.data.recordset}>
                        <button className="btn">Go To Recordset</button>
                    </a>
                    <button data-target="#raw" data-toggle="modal" className="btn">
                        View Raw Data
                    </button>
                </div>
            </div>
        )
    }
});


var Provider = require('./shared/provider');
var Raw = require('./shared/raw');

module.exports = Page = React.createClass({
    render: function(){
        var data = this.props.record.data, index = this.props.record.indexTerms;//resp._source.data['idigbio:data'];
        var has = [],canonical={};
        var record = {};

        //build canonical dictionary
        //first adding indexTerms which are most correct
        _.forOwn(index,function(v,k){
            if(_.has(fields.byTerm,k) && k != 'hasImage'){
                canonical[fields.byTerm[k].dataterm]=v;
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
                <div className="row-fluid">
                    <div className="span12">   

                        <div id="data-container" className="clearfix">
                            <Title data={canonical}/>
                            <div id="data-content">
                                <Record record={record} />
                            </div>
                            <div id="data-meta" className="clearfix">
                                <Buttons data={index} /> 
                                <Gallery data={index} />
                                <div id="map" className="clearfix">
                                    <h4 className="title">Georeference Data</h4>
                                    <div id="map-wrapper">
                                        <div id="map-box"></div>
                                    </div>
                                </div>
                            </div>
                            <Provider data={this.props.provider} />
                        </div>
                    </div>
                </div>
                <Raw data={data} />
            </div>
        )
    }

})
