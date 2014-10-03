/**
 * @jsx React.DOM
 */

var React = require('react')
var dwc = require('./lib/dwc_fields');
var _ = require('underscore');

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
        var rows = [];
        var data = this.props.data._source.data['idigbio:data'];
        
        _.each(this.props.fields,function(fld){
            if(_.isString(data[fld])){
                rows.push(<Row key={fld} data={data}/>);
            } 
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
        var sorder = ['taxonomy','specimen','collectionevent','locality','other'];
        var record =[],tabs=[],self=this;
        _.each(this.props.record,function(val,key){
            record.push(<Section fields={val} key={key} data={self.props.data}/>);
        });

        var reckeys = Object.keys(this.props.record);
        _.each(sorder,function(sec){
            if(reckeys.indexOf(sec)!==-1){
                tabs.push(<Tab key={sec}/>)
            }
        });

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
        var author = '';
        if(_.has(data,'dwc:scientificNameAuthorship')){
            author = ', '+data['dwc:scientificNameAuthorship'];
        }
        //build info ids,inst
        ['dwc:institutionCode','dwc:collectionCode','dwc:catalogNumber'].forEach(function(item){
            if(_.has(data,item)){
                info.push(data[item]);
            }
        }) 

        return (
            <div>
                <em>{title}</em>
                {author}&nbsp;
                {info.join(', ')}
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
                    <div id="images" className="clearfix">
                        <h4 className="title">Associated Media</h4>
                        <div id="gallery">
                            {imgs}
                        </div>
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
            <div id="action-buttons">
                <a className="btn btn-material-indigo" href={"/portal/recordsets/"+this.props.data.recordset}>
                    Go To Recordset
                </a>
                <a href="#raw" data-toggle="modal" className="btn btn-material-lightblue">
                    View Raw Data
                </a>
            </div>
        )
    }
});


var Provider = require('./shared/provider');
var Raw = require('./shared/raw');

module.exports = Page = React.createClass({
    render: function(){
        var data = this.props.record._source.data['idigbio:data'];//resp._source.data['idigbio:data'];
        var has = [];
        var record = {};
        _.each(dwc.order,function(val,key){
            _.each(dwc.order[key],function(fld){
                if(_.has(data,fld)){
                    if(_.has(record,key)===false){
                        record[key]=[]
                    } 
                    record[key].push(fld);
                    has.push(fld);
                }
            });
        });
        //add unidentified values to other section
        var dif = _.difference(Object.keys(data), has);
        _.each(dif,function(item){
            if(item.indexOf('idigbio:')===-1){
                if(_.isUndefined(record['other'])){
                    record['other']=[];
                }            
                record['other'].push(item);
            }
        });
        return (
            <div className="container-fluid">
                <div className="row-fluid">
                    <div className="span12">   
                        <h1 id="title" className="clearfix">
                            <Title data={this.props.record._source.data['idigbio:data']}/>
                        </h1>
                        <div id="data-container" className="clearfix">
                            <div id="data-content">
                                <Record record={record} data={this.props.record} />
                            </div>
                            <div id="data-meta">
                                <div id="actions">
                                    <Buttons data={this.props.record._source} />
                                </div>
                                
                                <Gallery data={this.props.record._source} />
                                    
                                <div id="map" className="clearfix">
                                    <h4 className="title">Specimen Georeference</h4>
                                    <div id="map-box"></div>
                                </div>
                            </div>
                            <div id="collection" className="clearfix">
                                <Provider data={this.props.provider} />
                            </div>
                        </div>
                    </div>
                </div>
                <Raw data={this.props.record._source.data['idigbio:data']} />
            </div>
        )
    }

})