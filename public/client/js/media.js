/**
 * @jsx React.DOM
 */

var React = require('react');
var MediaPage = require('./react/build/media');
var async = require('async');
var _ = require('underscore');

var id = $('#recordID').val();
var qu = {size:1,from:0,query:{term:{uuid: id}}};
//must use query style to get mediarecord because its a child of record
searchServer.esQuery('mediarecords',qu,function(resp){
    if(resp=='error' || resp.hits.total === 0){
        $("#data-container").html('<h3>Record Not Found</h3>');
    }else{
        var source = resp.hits.hits[0];
        var record = {};
        var provider;
        async.parallel([
            function(callback){
                searchServer.esGetRecord('recordsets',source._source.recordset,function(response){
                    provider=response;
                    callback();
                });
            },
            function(callback){
                if(_.has(source._source,'records')){
                    searchServer.esGetRecord('records',source._source.records[0],function(d){
                        if(d != 'error'){
                            record = d;               
                        }
                        callback();
                    })
                }else{
                    callback();
                }
            }
        ],function(err){
            React.renderComponent(
                <MediaPage mediarecord={source} record={record} provider={provider} />,
                 document.getElementById('react-wrapper')
            )
        })
    }
})
