/*
Elements with the class "pannable" are converted into interactive images.
The image enclosed in the parent element is copied. The original is given the
class 'large' and the copy is given the class 'thumbnail'. Two semi-opaque boxes
are laid over the thumbnail image. One above the visible slice and one below the
visible slice. The visible slice moves up and down when the user drags their
mouse over the thumbnail image.
*/
$(window).load(function() {
  'use strict'

  $('img.pannable').each(function() {
    // resizeTimer is used to control the rate at which windowSizeUpdate is
    // called, for performance reasons (I hate when my browser resize lags).
    var resizeTimer = false
    var visibleRatio = false
    var containerHeight = $(this).data('height').replace('px','')
    var thumbnailVisibleHeight
    var dragging = false
    var lastDragPosition = 0

    // remove the class pannable since CSS hides the element by default (to
    // prevent a noticeable jitter on the page as the HTML is restructured)
    $(this).removeClass('pannable')

    var container = $('<div />').addClass('pannable-container').insertBefore( $(this) )
    var thumbnailContainer = $('<div />').addClass('pannable-thumbnail-container').appendTo(container)
    var thumbnail = $(this).clone(false).addClass('pannable-thumbnail').appendTo(thumbnailContainer)
    var thumbnailOverlay = $('<div />')
      .addClass('pannable-thumbnail-overlay')
      .appendTo(thumbnailContainer)
      .css('top', 0)
    var thumbnailOverlayAbove = $('<div />')
      .addClass('pannable-thumbnail-overlay-top pannable-cover')
      .height( 0 )
      .appendTo(thumbnailOverlay)
    var thumbnailOverlayMiddle = $('<div />')
      .addClass('pannable-thumbnail-overlay-middle pannable-clear')
      .appendTo(thumbnailOverlay)
      .html('<i class="fa fa-arrows-v"></i>')
    var thumbnailOverlayBelow = $('<div />')
      .addClass('pannable-thumbnail-overlay-bottom pannable-cover')
      .height( containerHeight )
      .appendTo(thumbnailOverlay)
    var large = $(this).addClass('pannable-large').attr('draggable', 'false').prependTo(container)
    container.height( containerHeight )

    thumbnailOverlay.mousemove(function(e) {
      var panPosition = e.pageY - $(this).offset().top - (thumbnailVisibleHeight / 2)
      panPosition = Math.max(0, Math.min( containerHeight - thumbnailVisibleHeight, panPosition ) )
      thumbnailOverlayAbove.height( panPosition )

      var largeOffset = (panPosition / containerHeight) * large.height()
      large.css('marginTop', '-' + largeOffset + 'px')
    })

    function windowSizeUpdate() {
      large.css('marginTop', 0)
      thumbnailOverlayAbove.height(0)
      // If the ratio is very small, it means that the panning isn't
      // accomplishing very much, so add a CSS class and remove the 'width'
      // element style so that the class can determine the width
      if (container.width() < 600) {
        container.addClass('small-ratio').height('auto')
        large.width('')
        return true
      } else if( container.hasClass('small-ratio') ) {
        container.removeClass('small-ratio').height( containerHeight )
      }
      var largeWidth = parseInt(container.width() - (thumbnail.width() * 1.3) )
      visibleRatio = largeWidth / containerHeight
      large.width(largeWidth)
      thumbnailVisibleHeight = parseInt(thumbnail.width() / visibleRatio)
      thumbnailOverlayMiddle
        .height( thumbnailVisibleHeight + 'px')
        .css('lineHeight', thumbnailVisibleHeight + 'px')
    }

    $(window).resize(function() {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(windowSizeUpdate, 20)
    })

    windowSizeUpdate()
  })
})
