var files = []

function getMaxPos(files){
  var maxXPos = maxYPos = 0

  for (i = 0; i < files.length; i++){
    maxXPos = Math.max(files[i]['tsne1'], maxXPos)
    maxYPos = Math.max(files[i]['tsne2'], maxYPos)
  }

  return [maxXPos, maxYPos]
}

function createImage(filename, xPos, yPos, size, ctx){
  var image = new Image();
  image.src = filename;
  image.onload = function(){
    ctx.drawImage(image, xPos, yPos, size, size)
  }
}

$.getJSON('http://0.0.0.0:9001/sample_image_set/files.json', function(data){
  files = data
  console.log(files)
  var myCanvas = document.getElementById('myCanvas');
  canvasHeight = myCanvas.height;
  canvasWidth = myCanvas.width;
  var ctx = myCanvas.getContext('2d');

  size = 40

  const [maxXPos, maxYPos] = getMaxPos(files)
  console.log(maxXPos)

  for (i = 0; i < files.length; i++){
    xPos = files[i]['tsne1'] / maxXPos * canvasWidth
    yPos = files[i]['tsne2'] / maxYPos * canvasHeight
    filename = 'http://0.0.0.0:9001/sample_image_set/'+files[i]['filename'];
    createImage(filename, xPos, yPos, size, ctx)
  }
});
