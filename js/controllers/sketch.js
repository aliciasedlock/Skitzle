var CANVAS, CONTEXT, DRAW = 0,
Sketch = (function (controller) { 
  
  controller = {};
  controller.undoHistory = [];
  controller.redoHistory = [];
  
  controller.init = function() {
    var source = $('#sketch-template').html(),
    template   = Handlebars.compile(source),
    container  = $('.app-container');
    
    controller.dataURL = Path.params.dataURL ? Path.params.dataURL.replace(/\?/g, '/') : null;
    
    // Insert the view
    container.html(template);
    
    // Set canvas and context globally so we only fetch it once
    CANVAS = document.getElementById('sketch');
    CONTEXT = CANVAS.getContext('2d');

    // Set up our canvas
    controller.canvasReset();
    // Bind our events
    controller.bindEvents();
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
    $('a.options').not('open').on('click', controller.toggleOptions);

    /*$('.toolbar').bind('swipedown', function(){
      alert('fs');
      //$('.toolbar').animate('bottom', '-30px')
    });*/
    
  };
  
  /* Canvas reset for when starting a new sketch or want to clear all changes */
  controller.canvasReset = function() {
    // Sets our fresh canvas options
    $(CANVAS).attr({'width': window.innerWidth, 'height': window.innerHeight});
    CONTEXT.lineWidth = 4;
    CONTEXT.lineCap = 'round';
    CONTEXT.save();
    
    if (controller.dataURL != null) {
      var bg = new Image();
      
      $(bg).load(function(){
        CONTEXT.drawImage(bg, 0, 0);
      });
      bg.src = controller.dataURL;
    } else {
      CONTEXT.fillStyle = '#fff';
      CONTEXT.fillRect(0, 0, CONTEXT.canvas.width, CONTEXT.canvas.height);
      CONTEXT.restore();
    }
    
    // Clear the history since we no longer have one now
    controller.undoHistory = [];
    controller.redoHistory = [];
    controller.updateUndoHistory();
  };
  
  /* This handles our drawing functionality */
  controller.draw = function(event) {
    var top   = $(CANVAS).offset().top,
    left      = $(CANVAS).offset().left,
    moveLeft  = event.pageX-left,
    moveTop   = event.pageY-top;
    
    switch (event.type) {
      case 'mousedown':
        DRAW = 1;
        CONTEXT.beginPath();
        CONTEXT.moveTo(moveLeft, moveTop);
        break;
      case 'mouseup':
        DRAW = 0;
        CONTEXT.lineTo(moveLeft, moveTop);
        CONTEXT.stroke();
        CONTEXT.closePath();
        // Changes were made, so let's clear the redo history
        controller.redoHistory = [];
        break;
      case 'mousemove':
        if (DRAW == 1){
          CONTEXT.lineTo(moveLeft, moveTop);
          CONTEXT.stroke();
        }
        break;
    }
  };
  
  /**
    = Toolbar Functionality
    -----------------------
    The function below handle any functionality found in the bottom toolbar
  **/
  
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
      /**
        The last url in the array is what's currently visible on the canvas.
        So since we want to undo that, we go to the second to last url in the array and make it our canvas background.
        We then add the last url, the view we just undid, and add it to redoHistory.
      **/
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
    
    $('.palette a').removeClass('selected');
    CONTEXT.strokeStyle = color;
    e.addClass('selected');
  };
  
  controller.setEraser = function() {
    CONTEXT.strokeStyle = '#fff'
  };
  
  /** End toolbar functionality **/
  
  /**
    = Options Dialog
    -----------------
    The functions below all relate to the functionality for the options dialog
  **/
  
  controller.toggleOptions = function(event) {
    if ($(event.target).hasClass('open')) {
      controller.hideOptions();
      $(CANVAS).on('mousedown mouseup mousemove', controller.draw);
    } else {
      controller.showOptions();
      $(CANVAS).off();
    }
  };
  
  controller.showOptions = function() {
    var source = $('#options-template').html(),
    template   = Handlebars.compile(source),
    container  = $('.app-container');
    
    container.append(template);
    
    $('a.options').addClass('open');
    
    $('a.revert').on('click', function() {
      controller.canvasReset();
      controller.hideOptions();
    });
    $('a.download').on('click', controller.downloadSketch);
    $('a.send').on('click', controller.sendSketch);
  };
  
  controller.hideOptions = function() {
    $('a.options').removeClass('open');
    $('.options-container').remove();
  };
  
  controller.downloadSketch = function() {
    /* We can't actually save the file to the machine, so we just open it in a browser tab */
    return window.open(CANVAS.toDataURL('image/png'));
  };
  
  controller.sendSketch = function() {
    var sendTo = prompt('Who would you like to send this to?'),
    successCallback = function() {
      console.log('sketch sent!');
      window.location.href = '#/home'
    },
    failureCallback = function() {
      console.log('oops');
    };
    
    if (sendTo) {
      SketchData.add('user', 'id', CANVAS.toDataURL('image/png'), sendTo);
      SketchData.sendSketch(successCallback, failureCallback);
    }
  };
  
  /** End options dialog functionality **/
  
  controller.goHome = function (event) {
    if (controller.undoHistory.length > 1) {
      event.preventDefault();
      var answer = confirm('You have unsaved changes! You sure you want to leave?');
      
      if (answer)
        window.location.href = '#/home'
        
    } else {
      window.location.href = '#/home'
    }
    SketchData.clear();
  };
  
  return controller; 
  
}(Sketch));