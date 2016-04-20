'use strict'

$(document).ready(function() {

  var banner = $('canvas#banner')
  var bannerCanvas = banner[0]
  var ctx = banner[0].getContext('2d')
  var trianglesDown = 6
  var triangleHeight = banner.height() / trianglesDown
  var trianglesAcross = ( $(window).width() / triangleHeight ) + 1
  var triangleWidth = triangleHeight
  var triangleOffset = triangleHeight / 2

  // generate color palette
  var colorMultiplier = [1.03,1.04,1.05]
  var colorCount = 6
  var palette = [ [20, 32, 40] ]
  for (var i=0; i<colorCount; i++) {
    var newColor = [0,0,0]
    for (var j=0;j<3;j++) {
      newColor[j] = parseInt( palette[i][j] * colorMultiplier[j] )
    }
    palette.push(newColor)
  }

  var getRgbStringFromColor = function(color) {
    return 'rgba('+color[0]+','+color[1]+','+color[2]+', 1)'
  }

  var getRandomColor = function(palette, returnType) {
    var color = palette[parseInt(Math.random() * palette.length)]

    switch(returnType) {
      case 'string':
        return getRgbStringFromColor(color)
      case 'array':
      default:
        return color
    }
  }

  var shiftColor = function(color, amount) {
    var r = color[0]
    var g = color[1]
    var b = color[2]
    if (amount % 1 > 0.66) {
      amount = Math.round(amount)
      r += amount
      g += amount
      b += amount
    } else if (amount % 1 > 0.5) {
      r += Math.floor(amount)
      g += Math.round(amount)
      b += Math.round(amount)
    } else if (amount % 1 > 0.33) {
      r += Math.floor(amount)
      g += Math.floor(amount)
      b += Math.round(amount)
    } else {
      amount = Math.floor(amount)
      r += amount
      b += amount
      g += amount
    }
    return [r, g, b]
  }

  var shiftColors = function(colorArray, amount) {
    var newArray = []
    for (var i=0; i<colorArray.length; i++) {
      newArray[i] = shiftColor(colorArray[i], amount)
    }

    return newArray
  }

  bannerCanvas.width = $(window).width()
  banner.css('zIndex', 1000).css('position', 'relative')

  function setTriangleData() {
    var triangleData = []
    for (var x=0; x<trianglesAcross; x++) {
      for (var y=0; y<trianglesDown; y++) {
        var triangle = {x: x, y: y, colors: [getRandomColor(palette, 'array'), getRandomColor(palette, 'array')]}
        triangleData.push(triangle)
      }
    }

    return triangleData
  }

  function renderSquare(x, y, colors) {
    var topLeft = {x: x*triangleWidth-triangleOffset, y: y*triangleHeight}
    var topRight = {x: topLeft.x+triangleWidth, y: topLeft.y}
    var bottomRight = {x: topRight.x, y: topLeft.y-triangleHeight}
    var bottomLeft = {x: topLeft.x, y: bottomRight.y}
    // draw first triangle
    ctx.beginPath()
    ctx.moveTo(topLeft.x, topLeft.y)
    ctx.lineTo(topRight.x, topRight.y)
    ctx.lineTo(bottomRight.x, bottomRight.y)
    ctx.closePath()
    ctx.fillStyle = getRgbStringFromColor(colors[0])
    ctx.strokeStyle = ctx.fillStyle
    ctx.fill()
    ctx.stroke()
    // now second triangle
    ctx.beginPath()
    ctx.moveTo(topLeft.x, topLeft.y)
    ctx.lineTo(bottomLeft.x, bottomLeft.y)
    ctx.lineTo(bottomRight.x, bottomRight.y)
    ctx.closePath()
    ctx.fillStyle = getRgbStringFromColor(colors[1])
    ctx.strokeStyle = ctx.fillStyle
    ctx.fill()
    ctx.stroke()
  }

  function drawBaseTrianges() {
    for (var i=0; i<triangleData.length; i++) {
      renderSquare(triangleData[i].x, triangleData[i].y, triangleData[i].colors)
    }
  }

  function horizontalWave() {
    var minLength = 10
    var start = parseInt(Math.min(trianglesAcross/3, Math.random() * trianglesAcross))
    var sequenceLength = parseInt(Math.max( (trianglesAcross - start - minLength)/2, Math.random() * trianglesAcross) ) * 2  + 1
    var yFocalPoint = parseInt( Math.random() * (trianglesDown - 1) )
    var influenceSequences = [
      [0,1,2,4,8,4,2,1,1,0],
      [0,-1,-2,-4,-8,-4,-2,-1,-1,0]
    ]
    var influenceSequence = influenceSequences[parseInt(Math.random() * influenceSequences.length)]
    start = 0
    for (var x=start; x<start+sequenceLength; x++) {
      (function(x) {
        var divider = (sequenceLength - 1) / 2;
        var multiplier = ( divider - Math.abs(x - start - divider ) ) / divider;
        setTimeout( function(){renderColumn(x, multiplier, yFocalPoint, influenceSequence)} , x*100)
      })(x)
    }

    function renderColumn(x, multiplier, yFocalPoint, influenceSequence) {
      var ySpread = 5
      for (var c=0; c<10; c++) {
        if (x+c > trianglesAcross-1) { continue }
        for (var y=0; y<trianglesDown; y++) {
          var yMultiplier = Math.max(0, (ySpread - Math.abs(yFocalPoint - y) ) / ySpread )
          var influence = parseInt(influenceSequence[c] * multiplier * yMultiplier)
          var triangleArray = triangleData.filter(function(obj) {
            return obj.x === x+c && obj.y === y
          })
          var triangle = triangleArray[0]
          var shiftedColors = shiftColors(triangle.colors, influence)
          renderSquare(triangle.x, triangle.y, shiftedColors)
        }
      }
    }

  }

  function liftColumn(x, amount, duration) {
    var multiplier = amount / duration

    for (var frame=0; frame<duration; frame++) {
      (function(frame) {
        var influence = frame * multiplier
        setTimeout( function(){renderLift(influence)} , x*100)
      })(frame)
    }

    function renderLift(influence) {
      for (var y=0; y<trianglesDown; y++) {
        var triangleArray = triangleData.filter(function(obj) {
          return obj.x === x && obj.y === y
        })
        var triangle = triangleArray[0]
        var shiftedColors = shiftColors(triangle.colors, influence)
        renderSquare(triangle.x, triangle.y, shiftedColors)
      }
    }
  }

  var triangleData = setTriangleData()
  drawBaseTrianges()

  setTimeout(function() {
    liftColumn(3, 10, 100)
    liftColumn(2, 15, 100)
    liftColumn(1, 20, 100)
    liftColumn(0, 20, 100)
  }, 100)

  setInterval(horizontalWave, 4100)
})
