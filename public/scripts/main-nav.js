/*
This file controls the behavior of the main menu bar. It (1) updates
the scroll position to show the section targetted by a menu item click, and
(2) updates the menu bar to reflect the section that's currently visible
to the user.
*/

// TODO: Update the URL using history pushstate.

$(document).ready(function() {
  'use strict'

  if (console) {
    console.log('Hi!')
  }
  // scrollTargets stores the ID and relative height for each section targetted
  // by a menu item.
  var scrollTargets = {}
  // scrollTargetsSortedKeys stores the keys for scrollTargets sorted by
  // numeric value. It addresses the fact that we can't rely on the
  // sorted order of an object. Likewise, we don't want to sort the target
  // keys on every scroll event.
  var scrollTargetsSortedKeys = []
  // windowHeight cached for speed. It's updated on window resize (I hate
  // hate HATE a laggy scroll).
  var windowHeight = parseInt( $(window).height() )
  // An offset that accounts for the fixed header
  var topOffset = parseInt( $('#title-bar').height() )
  var activeSection
  var activeElement
  // resizeTimer is used to control the rate at which windowSizeUpdate is
  // called, for performance reasons (I hate when my browser resize lags).
  var resizeTimer = false
  // A fixed value that can be adjusted to taste
  var topMargin = 50
  var menuSelections = $('#menu-bar nav button')
  var menuBar = $('#menu-bar')

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

  // Identify the sections that will trigger menu bar updates on scroll and
  // (re)create the scrollTargets object.
  function windowSizeUpdate() {
    windowHeight = parseInt( $(window).height() )
    topOffset = parseInt( $('#title-bar').height() ) + topMargin
    scrollTargets = {}
    var overflowFound = false
    menuSelections.each(function() {
      // Store sections and their positions (top offsets) in var scrollTargets
      var id = $(this).data('target')
      var section = $('#' + id)
      if (!section.length) {
        return false
      }
      var position = parseInt( section.offset().top )
      scrollTargets[id] = position

      // Check for overflows and hide text if any are detected
      var minWidth = $('.text', this).innerWidth() * 1.25
      var parentWidth = $(this).width()
      if ( !overflowFound && minWidth > parentWidth) {
        overflowFound = true
      }
    })

    // Store a sorted array of the scroll targets
    scrollTargetsSortedKeys = Object.keys(scrollTargets).sort(function(a,b) {
      return scrollTargets[a] - scrollTargets[b]
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
    var scrollPosition = $(document).scrollTop() + topOffset
    // fall back on the top-most section
    var newSection = scrollTargetsSortedKeys[0]
    var nextSection = false
    // loop through scroll targets in order until I find one whose value is
    // greater than the scroll position.
    for (var i=0; i<scrollTargetsSortedKeys.length; i++) {
      var id = scrollTargetsSortedKeys[i]
      if (scrollTargets[id] > scrollPosition) {
        nextSection = id
        break;
      } else {
        newSection = id
      }
    }
    if (newSection !== activeSection) {
      if (activeSection) {
        menuSelections.filter('[data-target="'+activeSection+'"]').removeClass('active')
      }
      activeSection = newSection
      activeElement = menuSelections.filter('[data-target="'+activeSection+'"]')
      activeElement.addClass('active')
    }

    // Update the progress bar that runs across the bottom of the active button
    if (activeElement) {
      var floor = scrollTargets[newSection]
      var ceiling = scrollTargets[nextSection]
      if (!ceiling) {
        ceiling = $('body').height() - $(window).height()
      }
      var progress = (scrollPosition - floor) / (ceiling - floor)
      var progressBarWidth = activeElement.width() * progress
      $('.progress-bar', activeElement).width(progressBarWidth)
    }
  }


  menuSelections.click(function(e) {
    // Create a touch ripple on click
    var x = e.pageX - $(this).offset().left
    var y = e.pageY - $(this).offset().top
    var touchRippleElement = $('<div />').addClass('touch-ripple').css('left', x + 'px').css('top', y + 'px').appendTo( $(this) )
    var scale = Math.max( $(this).width(), $(this).height() ) * 2
    var offset = (-scale / 2) + 'px'
    setTimeout(function() {
      touchRippleElement.addClass('grow').width(scale).height(scale).css('marginLeft', offset).css('marginTop', offset)
    }, 10)
    setTimeout(function() {
      touchRippleElement.addClass('fade-out')
    }, 410)
    setTimeout(function() {
      touchRippleElement.remove()
    }, 2010)

    // Scroll to the relevant section on menu item click
    var id = $(this).data('target')
    if (id === 'contact') {
      $('a#contact-link').get(0).click()
    } else {
      var targetPosition = Math.max(0, scrollTargets[id] - topOffset)
      $('html, body').animate( {scrollTop: targetPosition + 'px'}, 500, 'easeOutCirc')
    }
  })



  $(window).resize(function() {
    if (!resizeTimer) {
      resizeTimer = setTimeout(initialize, 200)
    }
  })

  $(window).scroll(function() { scrollUpdate() } )

  // kick the whole thing off
  setTimeout(initialize, 100)

})
