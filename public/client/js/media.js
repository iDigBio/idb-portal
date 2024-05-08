import React from 'react'
import ReactDOM from 'react-dom'
import MediaPage from './react/src/media'

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

// $('.scrollspy').scrollSpy({
//     offsetTop: -155
// });