var canvas = document.getElementById('imageCanvas');
canvasHeight = canvas.height;
canvasWidth = canvas.width;
var ctx = canvas.getContext('2d');

var selectionCanvas = document.getElementById('selectionCanvas');
var ctx2 = selectionCanvas.getContext('2d');

var mousedown = false;
var coord1 = coord2 = null;

imgSize = 20

// Get position of cursor in canvas
function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return [x, y]
}

// Log and display tSNE coords
function updateCoords(coord1, coord2){
  minTsne1 = Math.min(coord1[0], coord2[0])
  maxTsne1 = Math.max(coord1[0], coord2[0])
  minTsne2 = Math.min(coord1[1], coord2[1])
  maxTsne2 = Math.max(coord1[1], coord2[1])

  console.log("minTsne1: " + minTsne1)
  console.log("maxTsne1: " + maxTsne1)
  console.log("minTsne2: " + minTsne2)
  console.log("maxTsne2: " + maxTsne2)

  $('#minTsne1').text(minTsne1)
  $('#maxTsne1').text(maxTsne1)
  $('#minTsne2').text(minTsne2)
  $('#maxTsne2').text(maxTsne2)
}

// Draw an image to Canvas
function createImage(filename, xPos, yPos, imgSize, ctx, isSelectedImage=false){
  var image = new Image();
  image.src = filename;
  image.onload = function(){
    ctx.drawImage(image, xPos, yPos, imgSize, imgSize)
    if (isSelectedImage){
      ctx.strokeStyle = '#fff'
    } else {
      ctx.strokeStyle = '#00008b'
    }
    ctx.lineWidth = 4;
    ctx.strokeRect(xPos, yPos, imgSize, imgSize);
  }
}

function displayImages(data, maxXPos, maxYPos, imgSize, selectedImage){
  for (i = 0; i < data.length; i++){
    xPos = data[i]['tsne1'] / maxXPos * canvasWidth
    yPos = data[i]['tsne2'] / maxYPos * canvasHeight
    filename = 'http://0.0.0.0:9001/sample_image_set/'+data[i]['filename'];
    if (data[i]['filename'] == selectedImage){
      console.log('Liam was here')
    }
    else {
      createImage(filename, xPos, yPos, imgSize, ctx)
    }
  }

  // call createImage and pass paramter isSpecial = True
  filename = 'http://0.0.0.0:9001/sample_image_set/'+selectedImage;
  createImage(filename, xPos, yPos, imgSize, ctx, isSelectedImage=true)
}

function selectionBox(){
  var stage = new createjs.Stage("selectionCanvas");
  createjs.Ticker.on("tick", tick);

  var selection = new createjs.Shape(),
      g = selection.graphics.setStrokeStyle(1).beginStroke("#000").beginFill("rgba(0,0,0,0.15)"),
      sd = g.setStrokeDash([10,5], 0).command,
      r = g.drawRect(0,0,100,100).command,
      moveListener;

  stage.on("stagemousedown", dragStart);
  stage.on("stagemouseup", dragEnd);

  function dragStart(event) {
    stage.addChild(selection).set({x:event.stageX, y:event.stageY});
    r.w = 0; r.h = 0;
    moveListener = stage.on("stagemousemove", drag);
  };

  function drag(event) {
    r.w = event.stageX - selection.x;
    r.h = event.stageY - selection.y;
  }

  function dragEnd(event) {
    stage.off("stagemousemove", moveListener);
  }

  function tick(event) {
    stage.update(event);
    sd.offset--;
  }
}

$.getJSON('http://0.0.0.0:9001/sample_image_set/files.json', function(data){
  const maxXPos = data.reduce((max, b) => Math.max(max, b.tsne1), data[0].tsne1);
  const maxYPos = data.reduce((max, b) => Math.max(max, b.tsne2), data[0].tsne2);

  min = 0
  max = data.length
  randIdx = Math.floor(Math.random() * (+max - +min)) + +min
  selectedImage = data[randIdx]['filename']

  displayImages(data, maxXPos, maxYPos, imgSize, selectedImage)

  // Convert cursor position to tsne coordinates
  function convertCanvasXCoordToTsne(x){
    return ((x / canvasWidth * maxXPos).toFixed(3))
  }

  function convertCanvasYCoordToTsne(y){
    return ((y / canvasHeight * maxYPos).toFixed(3))
  }

  function getTsneCoordsOnClick(e){
    const [x, y] = getCursorPosition(canvas, e)
    return[convertCanvasXCoordToTsne(x), convertCanvasYCoordToTsne(y)];
  }

  selectionBox();

  // Create event listeners to get cursor position in canvas
  $(selectionCanvas).on('mousedown', function(e) {
    mousedown = true;
    coord1 = getTsneCoordsOnClick(e)
  })

  $(selectionCanvas).on('mouseup mouseleave', function(e) {
    if (mousedown){
      mousedown = false;
      coord2 = getTsneCoordsOnClick(e)

      updateCoords(coord1, coord2)
    }
  })

  $('#zoom-in').click(function(){
    imgSize += 10
    ctx.clearRect(0,0,canvasWidth,canvasHeight)
    displayImages(data, maxXPos, maxYPos, imgSize, selectedImage)
  })

  $('#zoom-out').click(function(){
    if (imgSize > 10){
      imgSize -= 10
      ctx.clearRect(0,0,canvasWidth,canvasHeight)
      displayImages(data, maxXPos, maxYPos, imgSize, selectedImage)
    }
  })
});
