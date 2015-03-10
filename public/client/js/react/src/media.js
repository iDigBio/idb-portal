
var React = require('react');
var dwc = require('../../lib/dwc_fields');
var _ = require('lodash');

var Media = React.createClass({
    error: function(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    },
    render: function(){
        var link='';
        if(_.has(this.props.data,'ac:accessURI')){
            link = this.props.data['ac:accessURI'];
        }else if(_.has(this.props.data,'ac:bestQualityAccessURI')){
            link = this.props.data['ac:bestQualityAccessURI'];
        }else if(_.has(this.props.data, 'dcterms:identifier')){
            link = this.props.data['dcterms:identifier'];
        }

        return (
            <div key={this.props.keyid} id="media-wrapper" className="clearfix">
                <a className="clearfix" target={'_'+this.props.keyid} href={link} title="click to open original media file">
                    <img className="media" src={'//api.idigbio.org/v1/mediarecords/'+this.props.keyid+'/media?quality=webview'} onError={this.error}/>
                </a>
                <a href={link} download={this.props.keyid} target={'_'+this.props.keyid} className="hidden-print">
                    Download Media File
                </a>
            </div>
        );
    }
});

var Buttons = React.createClass({
    print: function(e){
        e.preventDefault();
        window.print();
    },
    render: function(){
        var el=[];
        if(_.has(this.props.data,'records')){
            var link = '/portal/records/'+this.props.data.records[0];
            el.push(
                <a className="btn button" href={link} key={link} keyid={link}>
                    Go To Specimen Record
                </a>
            )
        }else{
            el.push(
                <span className="no-assoc">Media is not associated with any record</span>
            )
        }
        var rlink = '/portal/recordsets/'+this.props.data.recordset;

        el.push(
            <a className="btn button" href={rlink} key={rlink} keyid={rlink}>
                Go To Recordset
            </a>
        );

        el.push(
            <a href="#raw" data-toggle="modal" data-target="#raw" className="btn button" key={'raw-data'}>
                View Raw Data
            </a>            
        );
        
        return (
            <div id="action-buttons" key={'buttons'}>
                {el}
                <button className="btn button" title="print this page" onClick={this.print}>
                    <i className="glyphicon glyphicon-print"> </i>
                </button>
            </div>
        );
    }
});

var Table = React.createClass({
    render: function(){
        var order=[],rows=[],self=this;

        //make ordered name keys
        _.each(dwc.order.media,function(val){
            if(_.has(self.props.record, val)){
                order.push(val);
            }
        });
        //add unknown keys to end of list
        var dif = _.difference(Object.keys(this.props.record),order);
        var merged = order.concat(dif), count=0;
        var regex = /(\bhttps?:\/\/(\S|\w)+)/;
        _.each(order,function(key){
            var name = _.isUndefined(dwc.names[key]) ? key: dwc.names[key];
            var val = self.props.record[key];
            if(_.isString(val)){
                var str;
                if(val.indexOf('<a')===0){
                    str = val;
                }else{
                    str = val.replace(regex, "<a href=\"$1\">$1</a>");
                }
                rows.push(
                    <tr key={count}>
                        <td className="name">{name}</td>
                        <td className="value" dangerouslySetInnerHTML={{__html: str}}></td>
                    </tr>
                );                
            }else if(_.isArray(val)){
                rows.push(
                    <tr key={count}>
                        <td className="name">{name}</td>
                        <td className="value">{val.join(', ')}</td>
                    </tr>
                );                 
            }else{
                rows.push(
                    <tr key={count}>
                        <td className="name">{name}</td>
                        <td className="value">{val}</td>
                    </tr>
                );                 
            }
            count++
        });

        return (
            <div id="meta-table">
                <table>
                    {rows}
                </table>
            </div>
        );
    }
});

var Group = React.createClass({
    error: function(event){
        $(event.currentTarget).attr('src','/portal/img/missing.svg');
    },
    render: function(){
        if(_.has(this.props.record, 'indexTerms') && this.props.record.indexTerms.mediarecords.length > 1){
            var imgs = [];
            var media = this.props.record.indexTerms.mediarecords;
            for(id in media){
                if(media[id] != this.props.keyid){
                    imgs.push(
                        <a href={'/portal/mediarecords/'+media[id]} title="click to open media record" key={media[id]} className="hidden-print" >
                            <img className="gallery-image visible-print-block" src={'//api.idigbio.org/v1/mediarecords/'+media[id]+'/media?quality=webview'} onError={this.error} /> 
                        </a>
                    )                    
                }
            }
            return (
                <div id="other-images" className="clearfix">
                    <h4 className="title">Other Media</h4>
                    <div id="images-wrapper">
                        {imgs}
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

module.exports = React.createClass({
    render: function(){
        var source = this.props.mediarecord;
        var name ='',info=[];
        if(_.has(this.props.record, 'indexTerms')){
            var data = this.props.record.data;
            var title = '';
            //build title
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

            if(_.has(data,'dwc:scientificNameAuthorship')){
                info.push(data['dwc:scientificNameAuthorship']);
            }
            //build info ids,inst
            ['dwc:institutionCode','dwc:collectionCode','dwc:catalogNumber'].forEach(function(item){
                if(_.has(data,item)){
                    info.push(data[item]);
                }
            }) 

            name =  <h1 id="title" className="clearfix">
                <em>{title}</em>
                <span className="title-addition">
                    {info.join(', ')}
                </span>
            </h1>
            //name = '<em>'+title+'</em><span class="title-addition">'+info.join(', ')+'</span>';             
        }
        
        return (
            <div className="container-fluid">
                <div className="row-fluid">
                    <div className="span12" id="container">   
                        <div id="data-container" className="clearfix">
                            {name}
                            <div id="data-content">
                                <Media key={source.uuid+'_media'} keyid={source.uuid} data={source.data} />
                            </div>
                            <div id="data-meta" className="clearfix">
                                <div id="actions" className="hidden-print"> 
                                    <Buttons data={source.indexTerms} />
                                </div>
                                <div id="data-table" className="clearfix">
                                    <h4 className="title">Media Metadata</h4>
                                    <Table record={source.data} />
                                </div>
                            </div>
                            <Group record={this.props.record} key={source.uuid} keyid={source.uuid}/>
                            <Provider data={this.props.mediarecord.attribution} />
                            
                        </div>
                    </div>
                </div>
                <Raw data={source.data} />
            </div>
        )
    }
})
