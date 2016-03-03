/*
This file controls the behavior of the main menu bar. It (1) updates
the scroll position to show the section targetted by a menu item click, and
(2) updates the menu bar to reflect the section that's currently visible
to the user.
*/

// TODO: Update the URL using history pushstate.

$(window).load(function() {
  'use strict'

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
  var topMargin = 65
  var menuSelections = $('#menu-bar nav button')

  menuSelections.each(function() {
    var progressBar = $('<div />').addClass('progress-bar').appendTo( $(this) )
  })


  // Initialize is called once on window load and again on window resize
  function initialize() {
    windowSizeUpdate()
    scrollUpdate()
  }

  // Identify the sections that will trigger menu bar updates on scroll and
  // (re)create the scrollTargets object.
  function windowSizeUpdate() {
    windowHeight = parseInt( $(window).height() )
    topOffset = parseInt( $('#title-bar').height() ) + topMargin
    scrollTargets = {}
    var overflowFound = false
    menuSelections.each(function() {
      // Store sections and their positions (top offsets)
      var id = $(this).data('target')
      var section = $('#' + id)
      if (!section.length) {
        return false
      }
      var position = parseInt( section.offset().top )
      scrollTargets[id] = position
      scrollTargetsSortedKeys = Object.keys(scrollTargets).sort(function(a,b) {
        return scrollTargets[a] - scrollTargets[b]
      })

      // Check for overflows and hide text if any are detected
      if ( !overflowFound && $(this)[0].scrollWidth > $(this).innerWidth() ) {
        overflowFound = true
        menuSelections.addClass('text-overflow')
      }
    })

    if (overflowFound === false) {
      menuSelections.removeClass('text-overflow')
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
      var progress = (scrollPosition - floor) / (ceiling - floor)
      var progressBarWidth = activeElement.width() * progress
      $('.progress-bar', activeElement).width(progressBarWidth)
    }
  }

  // Scroll to the relevant section on menu item click
  function menuUpdate() {
    menuSelections.click(function() {
      var id = $(this).data('target')
      var targetPosition = Math.max(0, scrollTargets[id] - topOffset)
      $('html, body').animate( {scrollTop: targetPosition + 'px'}, 400)
    })
  }
  menuUpdate()

  $(window).resize(function() {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(initialize, 100)
  })

  $(window).scroll(function() { scrollUpdate() } )

  // kick the whole thing off
  initialize()

})
