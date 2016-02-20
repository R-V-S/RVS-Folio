$(document).ready(function() {
  window.onload = function() {

    $('.dot-dodger').each(function() {
      var parent = $(this)

      var refSrc = $(this).data('reference')
      var refWidth = $(this).data('reference-width')
      var refHeight = $(this).data('reference-height')
      var refCanvas = $('<canvas />')
      refCanvas[0].width = refWidth
      refCanvas[0].height = refHeight
      var refCtx = refCanvas[0].getContext('2d')

      var dotSize = $(this).data('upscale-by')
      var sensitivity = 10
      var reset = false // a setTimeout to be set on mouse move

      var refImage = new Image(refWidth, refHeight)
      refImage.src = refSrc
      refImage.onload = function() {
        refCtx.drawImage(this,0,0)

        var dots = $('<div />').addClass('dot-container').css('height', refHeight * dotSize).appendTo( parent )

        for (var y = 0; y < refCanvas[0].height; y++) {
          for (var x = 0; x < refCanvas[0].width; x++) {
            var pixelData = refCtx.getImageData(x,y,1,1)
            var rgba = pixelRgb(pixelData);
            if (rgba.a > 50) {
              xPos = (x * dotSize) - (dotSize / 2)
              yPos = (y * dotSize) - (dotSize / 2)
              var dotBoundary = $('<div />')
              .addClass('dot-boundary')
              .attr('data-origin-x', xPos)
              .attr('data-origin-y', yPos)
              .css('left',xPos+'px')
              .css('top',yPos+'px')
              .css('width', dotSize+50+'px')
              .css('height', dotSize+50+'px')
              .appendTo(dots);

              var dot = $('<div />')
              .addClass('dot')
              .css('width', dotSize+'px')
              .css('height', dotSize+'px')
              .css('background-color', 'rgba('+rgba.r+','+rgba.g+','+rgba.b+','+(rgba.a / 255)+')')
              .appendTo(dotBoundary);


            }
          }
        }

        parent.mousemove(function(e) {
          var x = e.pageX - $(this).offset().left;
          var y = e.pageY - $(this).offset().top;
          var i = 0;
          clearTimeout(reset)
          reset = setTimeout(function() {
            $('.dot-boundary', parent).each(function() {
              var dot = $('.dot', this)
              dot.css('left', '0px')
              dot.css('top', '0px')
            })
          }, 100)
          $('.dot-boundary', this).each(function() {
            i++;
            var dot = $('.dot', this)
            var xOrigin = $(this).attr('data-origin-x');
            var yOrigin = $(this).attr('data-origin-y');
            var xDistance = Math.abs(xOrigin - x)
            var yDistance = Math.abs(yOrigin - y)
            var xPush = Math.max(0, 15 - xDistance)
            var yPush = Math.max(0, 15 - yDistance)
            var effect = xPush * yPush * 3
            if (i === 10) {
              console.log(xPush)
            }
            if (x > xOrigin ) {
              dot.css('left', '-' + effect + 'px');
            } else {
              dot.css('left', effect + 'px');
            }
            if (y > yOrigin ) {
              dot.css('top', '-' + effect + 'px');
            } else {
              dot.css('top', effect + 'px');
            }
          })
        })



      }
    })

    function pixelRgb(pixelData) {
      return {'r': pixelData.data[0], 'g': pixelData.data[1], 'b' : pixelData.data[2], 'a': pixelData.data[3] };
    }
  };
});
