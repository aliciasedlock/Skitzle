var Home = (function (controller) { 
  
  controller = {};
  
  controller.init = function() {
    
    var source = $('#home-template').html(),
    template   = Handlebars.compile(source),
    container  = $('.app-container'),
    sketches = User.getUserSketches(function(sketches){
      container.html(template(sketches));
    });
    
  };

  return controller; 
  
}(Home));