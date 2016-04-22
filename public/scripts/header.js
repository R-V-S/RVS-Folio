$(document).ready(function() {
  var $header = $('#header');
  var $headerContents = $('#header-contents');
  var minWidth = 600;
  var loaded = false;

  var resizeHeader = function() {
    $header.height( $(window).height() );

    if (!loaded) {
      loaded = true;
      setTimeout( function() { $header.addClass('loaded'); }, 380);
    }

    if ( $(window).width() < minWidth) {
      var newScale = $(window).width() / minWidth;
      $headerContents.css('transform', 'scale('+newScale+')');
    } else {
      $headerContents.css('transform', 'none');
    }
  }

  $(window).resize(function() {
    resizeHeader();
  });
  resizeHeader();
});
