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
    this.context.translate(0.5, 0.5);
    this.context.imageSmoothingEnabled = true;
  },
  clear: function() {
    this.context.clearRect(0, 0, this.element.width, this.element.height);
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
  setSize: function(options) {
    this.clear();
    this.element.width = options.width;
    this.element.height = options.height;
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
    this.element.className = 'particle';
    this.context = this.element.getContext('2d');
    this.angle = 0;
    this.angleStep = 0.02;
    this.center = {};
    this.radius = 120;
    this.particleRadius = 3;
    if (options && options.size) { this.size = options.size; } else { this.size = 3 };
    if (options && options.center) {
      this.center = options.center;
    } else {
      this.center.x = 100;
      this.center.y = 100;
    }
    if (typeof options.parent.append === 'function') {
      var size = Math.min( options.parent.width(), options.parent.height() ) * 0.666;
      this.element.width = size;
      this.element.height = size;
      this.center.x = size / 2;
      this.center.y = size / 2;
      this.position = this.calculatePosition( {center: this.center, radius: this.radius, angle: this.angle} );
      options.parent.append(this.element);
    } else if (typeof options.parent.appendChild === 'function') {
      options.parent.appendChild(this.element);
    }
  },
  calculatePosition: function( options ) {
    return { x: options.center.x + options.radius * Math.sin(options.angle) * 0.5, y: options.center.y + options.radius * Math.cos(options.angle) }
  },
  setRadius: function(radius) {
    this.radius = radius;
  },
  setParticleRadius: function(particleRadius) {
    this.particleRadius = particleRadius;
  },
  render: function(options) {
    this.context.beginPath();
    this.context.fillStyle = options.color;

    this.context.arc(options.position.x, options.position.y, options.particleRadius, 0, Math.PI*2);
    this.context.fill();
    this.context.closePath();
  },
  tick: function(options) {
    var trailLength = 51;
    var colorTarget = [200,220,250];
    var colorValues = [0,0,0];
    var colorSteps = [];
    for (var i=0; i<3; i++) {
      colorSteps.push(colorTarget[i] / trailLength);
    }

    //if (options && options.trailLength) { trailLength = options.trailLength; }

    var loopedAngle = this.angle - (this.angleStep * trailLength);
    var particleRadius = this.particleRadius + 5;
    for (var i = 0; i<trailLength; i++) {
      if (i === 1) {
        particleRadius = this.particleRadius + 5;
      } else {
        particleRadius = particleRadius * 0.98;
      }

      var color = 'rgb('+colorValues[0]+','+colorValues[1]+','+colorValues[2]+')';
      var position = this.calculatePosition( {center: this.center, radius: this.radius, angle: loopedAngle} );
      this.render( {color: color, particleRadius: particleRadius, position: position} );

      for (var j=0; j<3; j++) {
        colorValues[j] = parseInt(colorValues[j] + colorSteps[j]);
      }
      loopedAngle = loopedAngle + this.angleStep;
    }

    // Step the current angle forward & position
    this.angle = this.angle + this.angleStep;
    if (this.angle > 360) { this.angle = 0};
    this.position = this.calculatePosition( {center: this.center, radius: this.radius, angle: this.angle} );
  },
  start: function(speed) {
    this.interval = setInterval(this.tick(), speed);
    //this.render( {color: '#aaa', size: 4, position: this.position} );
  },
  stop: function() {
    clearInterval(this.interval);
  }
}

$(document).ready(function() {
  var $banner = $('#banner');
  var originalHeight = $banner.height();
  var layers = [];

  var backgroundLayer = Object.create(Layer);
  layers.push(backgroundLayer);
  backgroundLayer.init( {id: 'backgroundLayer', parent: $banner} );

  for (var i=1; i<=4; i++) {
    var newLayer = Object.create(Layer);
    newLayer.init( {id: 'layer' + i, parent: $banner} );
    layers.push(newLayer);
  }

  /*
  var particle1 = Object.create(Particle);
  particle1.init( {id: 'particle1', parent: $banner} );
  var interval = setInterval(function() {particle1.tick()}, 30);
  */

  var bannerResize = function() {
    var bannerHeight = $(window).height();
    $banner.height(bannerHeight);
    backgroundLayer.setSize( {'width': $banner.width(), 'height': bannerHeight} );
    backgroundLayer.renderBg();
    for (var i=1; i<=4; i++) {
      layers[i].setSize( {'width': $banner.width(), 'height': bannerHeight} );
    }
    layers[1].renderStars( {count: 200, shape: 'circle', radius: 200, color: 'hsl(230, 30%, 50%)'} );
    layers[2].renderStars( {count: 200, shape: 'circle', color: 'hsl(220, 27%, 40%)'} );
    layers[3].renderStars( {count: 200, shape: 'circle', radius: 600, color: 'hsl(200, 23%, 50%)'} );
    layers[4].renderStars( {count: 200, shape: 'circle', radius: 900, color: 'hsl(190, 20%, 50%)'} );
  }

  $(window).resize(function() {bannerResize() });
  bannerResize();

})
