
var React = require('react')
var idbapi = require('../../lib/idbapi');

function formatNum (num){
  return num.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function toTitleCase(str){
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
var StatsTable = React.createClass({displayName: "StatsTable",
  render: function(){        
      return (
          React.createElement("div", null, 
              React.createElement("table", {className: "table table-bordered table-condensed", id: "statstable"}, 
                  React.createElement("tr", null, 
                      React.createElement("th", null, " "), 
                      React.createElement("th", {className: "statcol"}, "Record Count"), 
                      React.createElement("th", {className: "statcol"}, "Media Record Count")
                  ), 
                  React.createElement("tr", null, 
                      React.createElement("td", null, "Total from Providers"), 
                      React.createElement("td", {className: "valcol"}, formatNum(totals.digestrecords)), 
                      React.createElement("td", {className: "valcol"}, formatNum(totals.digestmedia))
                  ), 
                  React.createElement("tr", null, 
                      React.createElement("td", null, "Total in API"), 
                      React.createElement("td", {className: "valcol"}, formatNum(totals.apirecords)), 
                      React.createElement("td", {className: "valcol"}, formatNum(totals.apimedia))
                  ), 
                  React.createElement("tr", null, 
                      React.createElement("td", null, "Total Indexed (all data) *"), 
                      React.createElement("td", {className: "valcol"}, formatNum(totals.indexrecords)), 
                      React.createElement("td", {className: "valcol"}, formatNum(totals.indexmedia))
                  )
              ), 
              React.createElement("p", null, "* Data that is marked deleted in iDigBio remains indexed until a cleanup is run.")
          )
      )
  }
});

var Publishers = React.createClass({displayName: "Publishers",
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
    
      return (
        React.createElement("tr", {key: key}, 
          React.createElement("td", null, React.createElement("a", {href: "#", onClick: self.clickScroll, "data-id": key}, toTitleCase(val.name))), 
          React.createElement("td", {className: "valcol"}, formatNum(dr)), 
          React.createElement("td", {className: "valcol"}, formatNum(ar)), 
          React.createElement("td", {className: "valcol"}, formatNum(ir)), 
          React.createElement("td", {className: "valcol"}, formatNum(dm)), 
          React.createElement("td", {className: "valcol"}, formatNum(am)), 
          React.createElement("td", {className: "valcol"}, formatNum(im))
        )
      );
    });
    return (
      React.createElement("table", {className: "table table-bordered datatable table-condensed tablesorter-blue"}, 
        React.createElement("thead", null, 
          React.createElement("tr", null, React.createElement("th", null), React.createElement("th", {colSpan: "3"}, "Records"), React.createElement("th", {colSpan: "3"}, "Media")), 
          React.createElement("tr", null, 
            React.createElement("th", null, "Publisher Name"), 
            React.createElement("th", {className: "statcol"}, "Digest"), 
            React.createElement("th", {className: "statcol"}, "API"), 
            React.createElement("th", {className: "statcol"}, "Index"), 
            React.createElement("th", {className: "statcol"}, "Digest"), 
            React.createElement("th", {className: "statcol"}, "API"), 
            React.createElement("th", {className: "statcol"}, "Index")
          )
        ), 
        React.createElement("tbody", null, 
          prows
        )
      )
    )
  }
});

var Recordsets = React.createClass({displayName: "Recordsets",
  render: function(){
    var rows = _.map(this.props.recordsets,function(name,uuid){
      if(_.isUndefined(rsets[uuid])){
        rsets[uuid]=defsets();
      }
      return (
        React.createElement("tr", null, 
          React.createElement("td", null, React.createElement("a", {href: '/portal/recordsets/'+uuid, target: "_new"}, toTitleCase(name))), 
          React.createElement("td", {className: "valcol"}, formatNum(rsets[uuid].digestrecords)), 
          React.createElement("td", {className: "valcol"}, formatNum(rsets[uuid].apirecords)), 
          React.createElement("td", {className: "valcol"}, formatNum(rsets[uuid].indexrecords)), 
          React.createElement("td", {className: "valcol"}, formatNum(rsets[uuid].digestmedia)), 
          React.createElement("td", {className: "valcol"}, formatNum(rsets[uuid].apimedia)), 
          React.createElement("td", {className: "valcol"}, formatNum(rsets[uuid].indexmedia))
        )
      )
    });

    return (
      React.createElement("div", {id: this.props.uuid}, 
        React.createElement("h4", null, toTitleCase(this.props.name)), 
        React.createElement("table", {className: "table table-bordered datatable table-condensed tablesorter-blue"}, 
          React.createElement("thead", null, 
            React.createElement("tr", null, React.createElement("th", null), React.createElement("th", {colSpan: "3"}, "Records"), React.createElement("th", {colSpan: "3"}, "Media")), 
            React.createElement("tr", null, React.createElement("th", null, "Dataset Name"), React.createElement("th", null, "Digest"), React.createElement("th", null, "API"), React.createElement("th", null, "Index"), React.createElement("th", null, "Digest"), React.createElement("th", null, "API"), React.createElement("th", null, "Index"))
          ), 
          React.createElement("tbody", null, 
            rows
          )
        )
      )
    )
  }
});

var Page = React.createClass({displayName: "Page",
  render: function(){
    var recordsets = _.map(pubs,function(val,key){
      return React.createElement(Recordsets, {recordsets: val.recordsets, key: key+'_recordsets', uuid: key, name: val.name})
    });
    
    return(
      React.createElement("div", null, 
        React.createElement(StatsTable, null), 
        React.createElement("h4", null, "Publisher Summary"), 
        React.createElement(Publishers, null), 
        recordsets
      )
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
            pubs[item.uuid]=defpub();
        }

        if(_.isEmpty(item.data.name)){
          pubs[item.uuid].name=item.data.base_url;
        }else{
          pubs[item.uuid].name=item.data.name;
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
      React.createElement(Page, null),
      document.getElementById('main')
    );  
    $('.datatable').tablesorter();
})





