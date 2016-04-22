$(document).ready(function() {
  var $header = $('#header');
  var $headerContents = $('#header-contents');
  var minWidth = 600;
  var resizeHeader = function() {
    $header.height( $(window).height() );

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
