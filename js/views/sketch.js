var CANVAS, CONTEXT, DRAW = 0,
Sketch = (function (controller) { 
  
  controller = {};
  controller.undoHistory = [];
  controller.redoHistory = [];
  
  controller.init = function() {
    var source = $('#sketch-template').html(),
    template   = Handlebars.compile(source),
    container  = $('.app-container');
    
    container.html(template);
    
    // Set canvas and context globally so we only fetch it once
    CANVAS = document.getElementById('sketch');
    CONTEXT = CANVAS.getContext('2d');
    
    // Set up our canvas
    controller.canvasReset();
    // Bind our events
    controller.bindEvents();
  };
  
  controller.canvasReset = function() {
    // Sets our fresh canvas options
    $(CANVAS).attr({'width': window.innerWidth, 'height': window.innerHeight})
    CONTEXT.lineWidth = 4;
    CONTEXT.lineCap = 'round';
    CONTEXT.save();
    CONTEXT.fillStyle = '#fff';
    CONTEXT.fillRect(0, 0, CONTEXT.canvas.width, CONTEXT.canvas.height);
    CONTEXT.restore();
    // Clear the history since we no longer have one now
    controller.undoHistory = [];
    controller.redoHistory = [];
    controller.updateUndoHistory();
  };
  
  controller.bindEvents = function() {
    
    // Bind ALL the events
    $('#sketch').on('mouseup', controller.updateUndoHistory);
    $('a.eraser').on('click', controller.setEraser);
    $('a.undo').not('disabled').on('click', controller.undo);
    $('a.redo').not('disabled').on('click', controller.redo);
    $('a.clear').on('click', controller.canvasReset);
    $('.palette a').on('click', controller.changeDrawingColor);
    $(CANVAS).on('mousedown mouseup mousemove', controller.draw);
    $('a.back').on('click', controller.goHome);
    
    // Effects for switching colors
    $('.palette a').on('click', function(event){
      $('.palette a').removeClass('selected');
      $(event.target).addClass('selected');
    });

    /*$('.toolbar').bind('swipedown', function(){
      alert('fs');
      //$('.toolbar').animate('bottom', '-30px')
    });*/
    
  };
  
  controller.updateUndoHistory = function() {
    /**
      The canvas element currently does not let you save what has been drawn natively.
      So we'll create an image after each change and stuff them into an array
      and base our 'undos' off of that.
    **/
    var imageData = CANVAS.toDataURL('image/png');
    controller.undoHistory.push(imageData);
    // The first url in our array will be blank, so we don't have to allow
    // users to undo until a second url is pushed
    if (controller.undoHistory.length > 1)
      $('a.undo').removeClass('disabled');
  };
  
  controller.undo = function(event) {
    var e = $(event.target);

    if (controller.undoHistory.length > 0) {
      var undoImage = new Image();
      
      $(undoImage).load(function(){
        CONTEXT.drawImage(undoImage, 0, 0);
      });
      
      undoImage.src = controller.undoHistory[controller.undoHistory.length - 2];
      controller.redoHistory.push(controller.undoHistory[controller.undoHistory.length - 1]);
      $('a.redo').removeClass('disabled');
      
      controller.undoHistory.pop();
      
      if (controller.undoHistory.length == 1)
        $('a.undo').addClass('disabled');
    }

  };
  
  controller.redo = function(event) {
    var e = $(event.target);
    
    if (controller.redoHistory.length > 0) {
      var redoImage = new Image(),
      img = controller.redoHistory.pop();
      
      $(redoImage).load(function(){
        CONTEXT.drawImage(redoImage, 0, 0);
      });
      
      redoImage.src = img;
      controller.undoHistory.push(img);
      $('a.undo').removeClass('disabled');
      
      if (controller.redoHistory.length == 0)
        $('a.redo').addClass('disabled');
    }
  };
  
  controller.changeDrawingColor = function(event) {
    var e = $(event.target),
    color = e.data('color');
    CONTEXT.strokeStyle = color;
  };
  
  controller.setEraser = function() {
    CONTEXT.strokeStyle = '#fff'
  };
  
  controller.draw = function(event) {
    var top = $(CANVAS).offset().top,
    left    = $(CANVAS).offset().left;
    
    switch (event.type) {
      case 'mousedown':
        DRAW = 1;
        CONTEXT.beginPath();
        CONTEXT.moveTo(event.pageX-left, event.pageY-top);
        break;
      case 'mouseup':
        DRAW = 0;
        CONTEXT.lineTo(event.pageX-left, event.pageY-top);
        CONTEXT.stroke();
        CONTEXT.closePath();
        // Changes were made, so let's clear the redo history
        controller.redoHistory = [];
        break;
      case 'mousemove':
        if (DRAW == 1){
          CONTEXT.lineTo(event.pageX-left, event.pageY-top);
          CONTEXT.stroke();
        }
        break;
    }
  };
  
  controller.goHome = function (event) {
    if (controller.undoHistory.length > 0) {
      event.preventDefault();
      var answer = confirm('You have unsaved changes! You sure you want to leave?');
      if (answer) {
        window.location.href = '#/home'
      }
    } else {
      window.location.href = '#/home'
    }
  }
  
  return controller; 
  
}(Sketch));