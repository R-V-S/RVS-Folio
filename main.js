if (typeof process.env.NODE_ENV === 'undefined') {
  process.env.NODE_ENV = 'dev'
}

// Global modules
global.fs = require('fs')
// Console colors: https://www.npmjs.com/package/colors
global.colors = require('colors')

// Compile sass files
var compileSass = require('./compile-sass')
