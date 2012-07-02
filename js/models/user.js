var User = (function (model) { 
  
  model = {};
  
  model.getUserData = function(callback){
    $.ajax({
      url: 'assets/samples/user.json',
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        // Run the callback
        callback();
      },
      error : function(data) {
        console.log('error');
      }
    });
  };
  
  model.getUserSketches = function(callback){
    $.ajax({
      url: 'assets/samples/sketches.json',
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      success: function (data) {
        
        var sketches;
        
        $.each(data, function(i){
          data[i].safeURL = data[i].sketchURL.replace(/\//g, '?');
        });
        
        sketches = {
          'sketches': data
        };
        
        callback(sketches);
      },
      error : function(data) {
        console.log('error');
      }
    });
  };
  
  return model;
  
}(User));