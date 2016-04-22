$(document).ready(function() {
  'use strict'

  var scrollAtTop = true;
  var scrollTransitionTime = 200;
  var scrollThreshold = 50;
  var scrollAwareElements = $('#header, body, #banner');
  var scrollAdjust = function() {
    if ( scrollAtTop && $(window).scrollTop() > scrollThreshold) {
      scrollAwareElements.addClass('scrollingDown');
      setTimeout(function() { scrollAwareElements.removeClass('scrollingDown').addClass('scrolled'); }, scrollTransitionTime);
      scrollAtTop = false;
    } else if ( !scrollAtTop && $(window).scrollTop() < scrollThreshold) {
      scrollAwareElements.addClass('scrollingUp').removeClass('scrolled');
      setTimeout(function() { scrollAwareElements.removeClass('scrollingUp scrolled'); }, scrollTransitionTime);
      scrollAtTop = true;
    }
  }

  $(window).scroll(function() {
    scrollAdjust()
  })
  scrollAdjust()

});
