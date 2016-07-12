var React = require('react');
var ReactDOM = require('react-dom');
var MediaPage = require('./react/src/media');

ReactDOM.render(
    <MediaPage mediarecord={data.mediarecord} record={data.record} />,
     document.getElementById('react-wrapper')
);

$('#side-nav-list').affix({
    offset: {
        top: function(){
            return $('#media-wrapper').offset().top - $(window).scrollTop();
        }
    }
})

$('.scrollspy').scrollSpy({
    offsetTop: -155
});