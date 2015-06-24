window.scrollToId = function(id){
      $('html,body').animate({scrollTop: $("#"+id).offset().top},'slow');
}

$(window).scroll(function() {
   
    if($('#content').width() > 700){
        var pos = $('#tutorial-nav').offset();
        $('#static-menu').css('width', $('#tutorial-nav').css('width'));
        if(pos.top < $(window).scrollTop() && $('#static-menu ul').length == 0) {
          
            $('#static-menu').html($('#tutorial-nav').html()).show();
           // $('#tbl-sorter').slideDown();
        } else if (pos.top + 10 > $(window).scrollTop()) {
           // $('#tbl-sorter').slideUp();
           $('#static-menu').hide();
            $('#static-menu ul').remove();
        } 
  
    }else{
        $('#static-menu').html('');
    }
            
});

$(window).resize(function(){
    if($('#content').width() > 700){
        $('#static-menu').css('width', $('#tutorial-nav').css('width'));
    }
})


