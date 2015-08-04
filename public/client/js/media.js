

var React = require('react');
var MediaPage = require('./react/src/media');

React.render(
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