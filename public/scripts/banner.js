'use strict'

var Layer = {
  // options is a required argument expected to be an object with these parameters:
  // * id: string. Required.
  // * parent: jQuery or JS element. If a jQuery element is used, the width
  //   and height of the canvas element can be set to match the parent's
  //   automatically. Required.
  init: function(options) {
    this.element = document.createElement('canvas');
    this.element.id = options.id;
    this.context = this.element.getContext('2d');
    // Check if the parent is a jQuery element.
    // If so, we can set the width and height automatically
    if (typeof options.parent.append === 'function') {
      this.element.width = options.parent.width();
      this.element.height = options.parent.height();
      options.parent.append(this.element);
    } else if (typeof options.parent.appendChild === 'function') {
      options.parent.appendChild(this.element);
    } else {
      console.error('Layer.init: could not be appended to parent');
    }
  },
  renderBg: function() {
    this.context.fillStyle = "rgb(5,6,8)";
    this.context.fillRect(0, 0, this.element.width, this.element.height);
  },
  // options is an optional argument expected to be an object with these parameters:
  // * count: number. Defaults to 200.
  // * shape: string. Accepts 'circle'. Defaults to rectangle.
  // * radius: number. For circle only.
  renderStars: function(options) {
    var count, color;
    if (options && options.count) {
      count = options.count;
    } else {
      count = 200;
    }
    if (options && options.color) {
      color = options.color
    } else {
      color = 'hsl(220, 30%, 50%)';
    }
    for (var i = 0; i < count; i++) {
      var x, y;
      if (options && options.shape === 'circle' ) {
        var center, radius;
        if (options.center) {
          center = options.center;
        } else {
          center = { 'x': parseInt(this.element.width*0.5), 'y': parseInt(this.element.height*0.5) };
        }
        if (options.radius) {
          radius = options.radius;
        } else {
          radius = this.element.height * 0.5;
        }
        // Equation for drawing a circle:
        // > x = center + radius * cos(angle)
        // > y = center + radius * sin(angle)
        //
        // Getting random points within the circle by randomizing the radius.
        x = parseInt( center.x + (Math.random() * radius) * Math.cos(i) );
        y = parseInt( center.y + (Math.random() * radius) * Math.sin(i) );
      } else {
        // Fall back to randomizing points within a rectangle of the element's
        // dimensions.
        x = parseInt(Math.random() * this.element.width);
        y = parseInt(Math.random() * this.element.height);
      }
      var size = Math.random() * 0.6 + 0.3;
      this.context.beginPath();
      this.context.arc(x, y, size, 0, Math.PI*2);
      this.context.fillStyle = color;
      this.context.fill();
      this.context.closePath();
    }
  },
  followParticles: function(options) {
    var count = options && options.count ? options.count : 50;
    this.element.onmousemove = function(e) {
      console.log(e);
    }
  }
}

var Particle = {
  // options is a required argument expected to be an object with these parameters:
  // * id: string. Required.
  // * parent: jQuery or JS element. If a jQuery element is used, the width
  //   and height of the canvas element can be set to fit within the parent's
  //   automatically. Required.
  init: function(options) {
    this.element = document.createElement('canvas');
    this.element.id = options.id;
    if (typeof options.parent.append === 'function') {
      var size = Math.min( options.parent.width(), options.parent.height() ) * 0.666;
      this.element.width = size;
      this.element.height = size;
      options.parent.append(this.element);
    }
  },
  calculateLocation: function() {

  }
}

$(document).ready(function() {
  var $banner = $('#banner');
  $banner.height( $(window).height() );

  var backgroundLayer = Object.create(Layer);
  backgroundLayer.init( {id: 'backgroundLayer', parent: $banner} );
  backgroundLayer.renderBg();

  var layer1 = Object.create(Layer);
  layer1.init( {id: 'layer1', parent: $banner} );
  layer1.renderStars( {count: 200, shape: 'circle', radius: 200, color: 'hsl(230, 30%, 50%)'} );

  var layer2 = Object.create(Layer);
  layer2.init( {id: 'layer2', parent: $banner} );
  layer2.renderStars( {count: 200, shape: 'circle', color: 'hsl(220, 27%, 40%)'} );

  var layer3 = Object.create(Layer);
  layer3.init( {id: 'layer3', parent: $banner} );
  layer3.renderStars( {count: 200, shape: 'circle', radius: 600, color: 'hsl(200, 23%, 50%)'} );

  var layer4 = Object.create(Layer);
  layer4.init( {id: 'layer4', parent: $banner} );
  layer4.renderStars( {count: 200, shape: 'circle', radius: 900, color: 'hsl(190, 20%, 50%)'} );
})
