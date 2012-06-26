var Home = (function (controller) { 
  
  controller = {};
  
  controller.init = function() {
    var source = $('#home-template').html(),
    template   = Handlebars.compile(source),
    container  = $('.app-container');
    
    container.html(template);
  };
  
  return controller; 
  
}(Home));