var CANVAS, CONTEXT, DRAW = 0,
Sketch = (function (controller) { 
  
  controller = {};
  controller.undoHistory = [];
  
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
    CONTEXT.lineWidth = 4;
    CONTEXT.lineCap = 'round';
    CONTEXT.save();
    CONTEXT.fillStyle = '#fff';
    CONTEXT.fillRect(0, 0, CONTEXT.canvas.width, CONTEXT.canvas.height);
    CONTEXT.restore();
    
    controller.undoHistory = [];
  };
  
  controller.bindEvents = function() {
    
    // Bind our undo functionality
    $('#sketch').on('mousedown', controller.updateUndoHistory);
    $('a.eraser').on('click', controller.setEraser);
    $('a.undo').on('click', controller.undo);
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
    $('a.undo').removeClass('disabled');
  };
  
  controller.undo = function(event) {
    var e = $(event.target);
    if (!e.hasClass('disabled')) {
      
      if (controller.undoHistory.length > 0) {
        var undoImage = new Image();
        $(undoImage).load(function(){
          CONTEXT.drawImage(undoImage, 0, 0);
        });
        undoImage.src = controller.undoHistory.pop();
      } 
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
        controller.updateUndoHistory();
        CONTEXT.beginPath();
        CONTEXT.moveTo(event.pageX-left, event.pageY-top);
        break;
      case 'mouseup':
        DRAW = 0;
        CONTEXT.lineTo(event.pageX-left, event.pageY-top);
        CONTEXT.stroke();
        CONTEXT.closePath();
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