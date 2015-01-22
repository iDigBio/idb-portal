/**
 * @jsx React.DOM
 */

var React = require('react');
var MediaPage = require('./react/build/media');
var async = require('async');
var _ = require('underscore');

var id = $('#recordID').val();
var qu = {size:1,from:0,query:{term:{uuid: id}}};
var base = '//beta-search.idigbio.org/v2/view/';
//must use query style to get mediarecord because its a child of record
var media, record = {};
var render = function(){
    React.renderComponent(
        <MediaPage mediarecord={media} record={record} />,
         document.getElementById('react-wrapper')
    )
};

$.getJSON(base+'mediarecords/'+$('#recordID').val(),function(resp){
    media=resp;
    if(_.has(media.indexTerms,'records')){
        $.getJSON(base+'records/'+media.indexTerms.records[0],function(response){
            record = response;
            render();
        })
    }else{
        render();
    }    
});
