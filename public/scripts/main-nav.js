/*
This file controls the behavior of the main menu bar. It (1) updates
the scroll position to show the section targetted by a menu item click, and
(2) updates the menu bar to reflect the section that's currently visible
to the user.
*/

// TODO: Update the URL using history pushstate.

$(document).ready(function() {
  'use strict'

  if (window.console) {
    console.log('%cHi! Thanks for looking at my little portfolio/resume. If you have any questions, feel free to email me at rajeev.v.singh@gmail.com', ' font-size: 120%; color: #333; padding: 0 2em; border-radius: 20px; background-image: repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(50,30,0,0.03) 3px, rgba(50,30,0,0.03) 8px);')
  }
  // windowHeight cached for speed.
  var windowHeight = parseInt( $(window).height() )
  // An offset that accounts for the fixed header
  var topOffset = 60;
  var activeSection
  var activeElement
  // resizeTimer is used to control the rate at which windowSizeUpdate is
  // called, for performance reasons (I hate when my browser resize lags).
  var resizeTimer = false
  var scrollUpdateTimer = false
  // A fixed value that can be adjusted to taste
  var topMargin = 50
  var menuSelections = $('#menu button')
  var menuBar = $('#menu')

  menuSelections.each(function() {
    var progressBar = $('<div />').addClass('progress-bar').appendTo( $(this) )
  })


  // Initialize is called once on window load and again on window resize
  function initialize() {
    scrollUpdate()
    windowSizeUpdate()
    // Run it again, giving the browser plenty of time to adjust:
    setTimeout(windowSizeUpdate, 500)
    resizeTimer = false
  }
  initialize()
  $(window).ready(function() {
    initialize()
  })

  // Update variables that might have changed and check for text overflow
  // in the menu bar
  function windowSizeUpdate() {
    windowHeight = parseInt( $(window).height() )

    // Check for overflows and hide text if any are detected
    var overflowFound = false
    menuSelections.each(function() {
      var minWidth = $('.text', this).innerWidth() * 1.25
      var parentWidth = $(this).width()
      if ( !overflowFound && minWidth > parentWidth) {
        overflowFound = true
      }
    })
    if (overflowFound === false) {
      menuSelections.removeClass('text-overflow')
    } else {
      menuSelections.addClass('text-overflow')
    }
  }

  // Update the menu to reflect the section that's currently visible
  function scrollUpdate() {
    // get the position of the scrollbar relative to the top of the visible area
    var scrollPosition = $(window).scrollTop() + topOffset + 1
    var newSection
    // the floor is the beginning of the currently visible section
    var floor = 0
    // the ceiling is the end of the currently visible section (which
    // is either the beginning of the next currently visible section or the
    // end of the document
    var ceiling = 1000000
    // loop through menu item targets and establish (1) which section is
    // within the range of the scroll position, (2) what the floor and
    // ceiling variable values are
    menuSelections.each(function() {
      var targetId = $(this).data('target')
      var targetElement = $('#'+targetId)
      if (!targetElement.length) {
        return false
      }
      var targetPosition = targetElement.offset().top
      if (scrollPosition > targetPosition && targetPosition > floor) {
        floor = Math.max(0, targetPosition)
        newSection = targetId
      }
      if (scrollPosition < targetPosition && targetPosition < ceiling) {
        ceiling = targetPosition
      }
    })
    if (newSection && newSection !== activeSection) {
      if (activeSection) {
        menuSelections.filter('[data-target="'+activeSection+'"]').removeClass('active')
      }
      activeSection = newSection
      activeElement = menuSelections.filter('[data-target="'+activeSection+'"]')
      activeElement.addClass('active')
    }
    if (!newSection) {
      if (activeSection) {
        menuSelections.filter('[data-target="'+activeSection+'"]').removeClass('active')
        activeSection = null;
      }
    }

    // Update the progress bar that runs across the bottom of the active button
    if (activeElement && newSection) {
      if (ceiling === 1000000) {
        ceiling = $('html,body').height() - $(window).height()
      }
      var progress = (Math.max(0,scrollPosition) - floor) / (ceiling - floor)
      var progressBarWidth = Math.max(0, parseInt(activeElement.width() * progress) )
      $('.progress-bar', activeElement).width(progressBarWidth)
    }

    scrollUpdateTimer = false
  }


  menuSelections.click(function(e) {
    // Create a touch ripple on click

    var x = e.pageX - $(this).offset().left
    var y = e.pageY - $(this).offset().top
    var touchRippleElement = $('<div />').addClass('touch-ripple').css('left', x + 'px').css('top', y + 'px').appendTo( $(this) )
    var scale = Math.max( $(this).width(), $(this).height() ) * 1.5
    var offset = (-scale / 2) + 'px'
    setTimeout(function() {
      touchRippleElement.addClass('grow').width(scale).height(scale).css('marginLeft', offset).css('marginTop', offset)
    }, 10)
    setTimeout(function() {
      touchRippleElement.addClass('fade-out')
    }, 410)
    setTimeout(function() {
      touchRippleElement.remove()
    }, 1010)


    // Scroll to the relevant section on menu item click
    var id = $(this).data('target')
    if (id === 'contact') {
      $('a#contact-link').get(0).click()
    } else {
      var targetPosition = Math.max(0, $('#'+id).offset().top - topOffset)
      $('body, html').animate( {scrollTop: targetPosition + 'px'}, 500, 'easeOutCirc')
    }
  })

  $('#icon').click(function() {
    $('body, html').animate( {scrollTop: '0px'}, 500, 'easeOutCirc')
  })



  $(window).resize(function() {
    if (!resizeTimer) {
      resizeTimer = setTimeout(initialize, 200)
    }
  })

  $(window).scroll(function() {
    if (!scrollUpdateTimer) {
      scrollUpdateTimer = setTimeout(scrollUpdate, 20)
    }
  })

  // kick the whole thing off
  setTimeout(initialize, 100)

})
