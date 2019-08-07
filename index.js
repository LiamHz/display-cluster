var myCanvas = document.getElementById('myCanvas');
canvasHeight = myCanvas.height;
canvasWidth = myCanvas.width;
var ctx = myCanvas.getContext('2d');

size = 50

// Get position of cursor in canvas
function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return [x, y]
}

// Draw an image to Canvas
function createImage(filename, xPos, yPos, size, ctx){
  var image = new Image();
  image.src = filename;
  image.onload = function(){
    ctx.drawImage(image, xPos, yPos, size, size)
  }
}

$.getJSON('http://0.0.0.0:9001/sample_image_set/files.json', function(data){
  const maxXPos = data.reduce((max, b) => Math.max(max, b.tsne1), data[0].tsne1);
  const maxYPos = data.reduce((max, b) => Math.max(max, b.tsne2), data[0].tsne2);

  for (i = 0; i < data.length; i++){
    xPos = data[i]['tsne1'] / maxXPos * canvasWidth
    yPos = data[i]['tsne2'] / maxYPos * canvasHeight
    filename = 'http://0.0.0.0:9001/sample_image_set/'+data[i]['filename'];
    createImage(filename, xPos, yPos, size, ctx)
  }

  // Convert cursor position to tsne coordinates
  function convertCanvasXCoordToTsne(x){
    return ((x / canvasWidth * maxXPos).toFixed(3))
  }

  function convertCanvasYCoordToTsne(y){
    return ((y / canvasHeight * maxYPos).toFixed(3))
  }

  function getTsneCoordsOnClick(e){
    const [x, y] = getCursorPosition(myCanvas, e)
    return[convertCanvasXCoordToTsne(x), convertCanvasYCoordToTsne(y)];
  }

  // Create event listeners to get cursor position in canvas
  myCanvas.addEventListener('mousedown', function(e) {
    console.log(getTsneCoordsOnClick(e))
  })

  myCanvas.addEventListener('mouseup', function(e) {
    console.log(getTsneCoordsOnClick(e))
  })
});
