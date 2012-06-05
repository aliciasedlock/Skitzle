$(document).ready(function(){
  
  $('#canvas').sketch();
  
  $('.palette a').on('click', function(event){
    $('.palette a').removeClass('selected');
    $(event.target).addClass('selected');
  });
  
  $('.toolbar').bind('swipedown', function(){
    alert('fs');
    //$('.toolbar').animate('bottom', '-30px')
  });
  
});