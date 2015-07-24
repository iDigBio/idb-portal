
var React = require('react')
var idbapi = require('../../lib/idbapi');

function formatNum (num){
  return num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function toTitleCase(str){
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}
var StatsTable = React.createClass({
  render: function(){        
      return (
          <div>
              <table className="table table-bordered table-condensed" id="statstable">
                  <tr>
                      <th>&nbsp;</th>
                      <th className="statcol">Record Count</th>
                      <th className="statcol">Media Record Count</th>
                  </tr>
                  <tr>
                      <td>Total from Providers</td>
                      <td className="valcol">{formatNum(totals.digestrecords)}</td>
                      <td className="valcol">{formatNum(totals.digestmedia)}</td>
                  </tr>    
                  <tr>
                      <td>Total in API</td>
                      <td className="valcol">{formatNum(totals.apirecords)}</td>
                      <td className="valcol">{formatNum(totals.apimedia)}</td>
                  </tr>                                
                  <tr>
                      <td>Total Indexed (all data) *</td>
                      <td className="valcol">{formatNum(totals.indexrecords)}</td>
                      <td className="valcol">{formatNum(totals.indexmedia)}</td>
                  </tr>    
              </table>
              <p>* Data that is marked deleted in iDigBio remains indexed until a cleanup is run.</p>
          </div>
      )
  }
});

var Publishers = React.createClass({
  clickScroll: function(event) {

    event.preventDefault();
    $('html,body').animate({scrollTop: $("#"+event.target.attributes['data-id'].value).offset().top},'slow');
    return false
  },
  render: function(){
    var self=this;
    var prows = _.map(pubs,function(val,key){
      var ar=0,am=0,dr=0,dm=0,ir=0,im=0;
      _.each(val.recordsets,function(name,uuid){
        if(_.has(rsets,uuid)){
          ar+=rsets[uuid].apirecords;
          am+=rsets[uuid].apimedia;
          dr+=rsets[uuid].digestrecords;
          dm+=rsets[uuid].digestmedia;
          ir+=rsets[uuid].indexrecords;
          im+=rsets[uuid].indexmedia;
        }
      });
    
      if(_.without([ar,am,dr,dm,ir,im],0).length === 0){
        return null;
      }else{
        var qp = getQueryParams(window.location.search);
        var rec_cols, media_cols;
        if (qp.merged && dr == ar && ar == ir) {
          rec_cols = (
            <td className="valcol" colSpan="3">{formatNum(dr)}</td>
          )
        } else {
          rec_cols = (
            <span>
              <td className="valcol">{formatNum(dr)}</td>
              <td className="valcol">{formatNum(ar)}</td>
              <td className="valcol">{formatNum(ir)}</td>
            </span>
          )
        }

        if (qp.merged && dm == am && am == im) {
          media_cols = (
            <td className="valcol" colSpan="3">{formatNum(dm)}</td>
          )
        } else {
          media_cols = (
            <span>
              <td className="valcol">{formatNum(dm)}</td>
              <td className="valcol">{formatNum(am)}</td>
              <td className="valcol">{formatNum(im)}</td>
            </span>
          )
        }

        return (
          <tr key={key}>
            <td><a href={"#"} onClick={self.clickScroll} data-id={key}>{val.name}</a></td>
            {rec_cols}
            {media_cols}
          </tr>
        );        
      }
    });
  
    return (
      <table className="table table-bordered datatable table-condensed tablesorter-blue">
        <thead>
          <tr><th></th><th colSpan="3">Records</th><th colSpan="3">Media</th></tr>
          <tr>
            <th>Publisher Name</th>
            <th className="statcol">Digest</th>
            <th className="statcol">API</th>
            <th className="statcol">Index</th>
            <th className="statcol">Digest</th>
            <th className="statcol">API</th>
            <th className="statcol">Index</th>
          </tr>
        </thead>
        <tbody>
          {_.without(prows,null)}
        </tbody>
      </table>
    )
  }
});

var Recordsets = React.createClass({
  render: function(){
    var rows = _.map(this.props.recordsets,function(name,uuid){
      if(_.isUndefined(rsets[uuid]) || _.without(_.values(rsets[uuid]),0).length === 0 ){
        //rsets[uuid]=defsets();
        return null;
      }else{
        var qp = getQueryParams(window.location.search);
        var rec_cols, media_cols;
        if (qp.merged && rsets[uuid].digestrecords == rsets[uuid].apirecords && rsets[uuid].apirecords == rsets[uuid].indexrecords) {
          rec_cols = (
            <td className="valcol" colSpan="3">{formatNum(rsets[uuid].digestrecords)}</td>
          )
        } else {
          rec_cols = (
            <span>
              <td className="valcol">{formatNum(rsets[uuid].digestrecords)}</td>
              <td className="valcol">{formatNum(rsets[uuid].apirecords)}</td>
              <td className="valcol">{formatNum(rsets[uuid].indexrecords)}</td>
            </span>
          )
        }

        if (qp.merged && rsets[uuid].digestmedia == rsets[uuid].apimedia && rsets[uuid].apimedia == rsets[uuid].indexmedia) {
          media_cols = (
            <td className="valcol" colSpan="3">{formatNum(rsets[uuid].digestmedia)}</td>
          )
        } else {
          media_cols = (
            <span>
              <td className="valcol">{formatNum(rsets[uuid].digestmedia)}</td>
              <td className="valcol">{formatNum(rsets[uuid].apimedia)}</td>
              <td className="valcol">{formatNum(rsets[uuid].indexmedia)}</td>
            </span>
          )
        }

        return (
          <tr>
            <td><a href={'/portal/recordsets/'+uuid} target="_new">{name}</a></td>
            {rec_cols}
            {media_cols}
          </tr>
        )
      }
    });

    return (
      <div id={this.props.uuid}>
        <h4>{this.props.name}</h4>
        <table className="table table-bordered datatable table-condensed tablesorter-blue">
          <thead>
            <tr><th></th><th colSpan="3">Records</th><th colSpan="3">Media</th></tr>
            <tr><th>Recordset</th><th>Digest</th><th>API</th><th>Index</th><th>Digest</th><th>API</th><th>Index</th></tr>
          </thead>
          <tbody>
            {_.without(rows,null)}
          </tbody>
        </table>
      </div>
    )
  }
});

var Page = React.createClass({
  render: function(){
    var recordsets = _.map(pubs,function(val,key){
      return <Recordsets recordsets={val.recordsets} key={key+'_recordsets'} uuid={key} name={val.name}/>
    });
    
    return(
      <div>
        <StatsTable />
        <h4>Publisher Summary</h4>
        <Publishers />
        {recordsets}
      </div>
    )
  }
})


var pubs={},rsets={};
var defpub= function(){
  return {recordsets:{},name:''};
}
var defsets = function(){
  return {
    apimedia: 0,
    apirecords: 0,
    digestmedia: 0,
    digestrecords: 0,
    indexmedia:0,
    indexrecords:0
  }
};
var totals = defsets();
async.parallel([
  function(callback){
    idbapi.publishers({"fields":["data.name","data.base_url"],"limit":1000},function(resp){
      resp.items.forEach(function(item){
        if(_.isUndefined(pubs[item.uuid])){
            pubs[item.uuid] = defpub();
        }

        if(_.isEmpty(item.data.name)){
          pubs[item.uuid].name = item.data.base_url;
        }else{
          pubs[item.uuid].name = item.data.name;
        }
      })
      callback();
    });
  },
  function(callback){
    idbapi.recordsets({"fields":["data.collection_name","publisher"],"limit":1000},function(resp){
      resp.items.forEach(function(item){
        if(_.isUndefined(pubs[item.indexTerms.publisher])){
          pubs[item.indexTerms.publisher]=defpub();
        }
        pubs[item.indexTerms.publisher].recordsets[item.uuid]=item.data.collection_name;//(item.data) 
        //pubs[item.indexTerms.publisher].recordsets[item.uuid].name = ;
      });
      callback();
    });    
  },
  function(callback){
    idbapi.summary('stats/api',{inverted: "true",minDate:"now-1h"},function(resp){
      _.forEach(resp.recordsets,function(val,key){
        var d = _.keys(val).sort().reverse()[0];
        if(_.isUndefined(rsets[key])){
          rsets[key]=defsets();
        }
        rsets[key]['apimedia']=val[d].mediarecords;
        rsets[key]['apirecords']=val[d].records;
        totals.apimedia+=val[d].mediarecords;
        totals.apirecords+=val[d].records;
      })
      callback();
    });
  },
  function(callback){
    idbapi.summary('stats/digest',{inverted: "true",dateInterval:"day"},function(resp){
      _.forEach(resp.recordsets,function(val,key){
        var d = _.keys(val).sort().reverse()[0];
        if(_.isUndefined(rsets[key])){
          rsets[key]=defsets();
        }
        rsets[key]['digestmedia']=val[d].mediarecords;
        rsets[key]['digestrecords']=val[d].records;
        totals.digestmedia+=val[d].mediarecords;
        totals.digestrecords+=val[d].records;
      })
      callback();
    });
  },
  function(callback){
    idbapi.summary('top/records',{top_fields:["recordset"],count: 1000}, function(resp){
      _.forEach(resp.recordset,function(val,key){
        if(_.isUndefined(rsets[key])){
          rsets[key]=defsets();
        }
        rsets[key]['indexrecords']=val.itemCount;
        totals.indexrecords+=val.itemCount;
      })
      callback();
    });
  },
  function(callback){
    idbapi.summary('top/media',{top_fields:["recordset"],count: 1000}, function(resp){
      _.forEach(resp.recordset,function(val,key){
        if(_.isUndefined(rsets[key])){
          rsets[key]=defsets();
        }
        rsets[key]['indexmedia']=val.itemCount;
        totals.indexmedia+=val.itemCount;
      })
      callback();
    });
  }
],function(error){
    React.render(
      <Page/>,
      document.getElementById('main')
    );  
    $('.datatable').tablesorter();
})





