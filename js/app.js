$(document).ready(function(){
  
  Path.map('#/home').to(Home.init);
  
  Path.map('#/sketch').to(Sketch.init);
  
  Path.map('#/sketch/:dataURL').to(Sketch.init);

  Path.root('#/home');

  Path.listen();

});