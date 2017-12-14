


$('#side-nav-list').affix({
    offset: {
        top: function(){
            return $('#introduction').offset().top - $(window).scrollTop();
        }
    }
})

// $('.scrollspy').scrollSpy({
//     offsetTop: -205
// });

