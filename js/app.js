$(document).ready(function(){
  
  
  Path.map('#/home').to(Home.init);
  
  Path.map('#/sketch').to(Sketch.init);

  Path.root('#/home');

  Path.listen();
  
  /*$('#canvas').sketch();
  
  $('.palette a').on('click', function(event){
    $('.palette a').removeClass('selected');
    $(event.target).addClass('selected');
  });
  
  $('.toolbar').bind('swipedown', function(){
    alert('fs');
    //$('.toolbar').animate('bottom', '-30px')
  });*/
  
});