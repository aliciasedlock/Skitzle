var SketchData = (function (model) { 
  
  model = {};
  
  model.add = function(user, sketchURL, sketchID, sendTo) {
    model.data = {
      'user': user,
      'sketchID': sketchID,
      'sketchURL': sketchURL,
      'sendTo': sendTo
    };
  };
  
  model.clear = function() {
    model.data = {};
  };
  
  model.sendSketch = function(success, failure) {
    success();
  };
  
  return model;
  
}(SketchData));