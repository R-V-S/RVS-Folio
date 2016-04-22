if (process.env.NODE_ENV === 'dev') {
  var setting_aggregate = true
  var sass = require('node-sass') // https://github.com/sass/node-sass
  var postcss = require('postcss');
  var autoprefixer = require('autoprefixer');
  var sassDirectory = 'styles'
  var cssDirectory = 'public/css'
  var cssAggregateFilename = 'aggregate.css'

  var sassCompileIndividual = function() {
    fs.readdir(sassDirectory, function(err, list) {
      if (err) throw err
      if (!list) { return }
      console.log('Loaded files from sass directory: '.cyan + list)
      list.forEach(function(sassFilename) {
        sassCompileFile(sassFilename)
        fs.watchFile(sassDirectory + '/' + sassFilename, function(current, previous) {
          if (current.mtime !== previous.mtime) {
            sassCompileFile(sassFilename)
          }
        })
      })
    })
  }

  var virgin = true
  var sassCompileAggregate = function(cssFilename) {
    fs.readdir(sassDirectory, function(err, list) {
      if (err) throw err
      if (!list) { return }
      console.log('Loaded files from sass directory: '.cyan + list)
      var combinedSass = ''
      list.sort(function (a,b) {
        return a < b ? -1 : 1
      }).forEach(function(sassFilename) {
        var filePath = sassDirectory + '/' + sassFilename
        if ( fs.statSync(filePath).isDirectory() ) {
          return
        }
        // Combine
        combinedSass += fs.readFileSync(filePath)

        // Watch
        if (virgin) {
          fs.watchFile(sassDirectory + '/' + sassFilename, function(current, previous) {
            if (current.mtime !== previous.mtime) {
              sassCompileAggregate(cssFilename)
            }
          })
        }
      })
      sass.render({data: combinedSass}, function(err, result) {
        if (err) throw err
        postcss([ autoprefixer ]).process(result.css).then(function (result) {
          result.warnings().forEach(function (warn) {
            console.warn(warn.toString())
          })
          // Render
          fs.writeFile(cssDirectory + '/' + cssFilename, result.css, function(err) {
            if (err) throw err
            console.log('Wrote: '.cyan + cssDirectory + '/' + cssFilename)
            virgin = false
          })
        })
      })
    })
  }

  var sassCompileFile = function(sassFilename) {
    sass.render({file: sassDirectory + '/' + sassFilename}, function(err, result) {
      if (err) throw err
      console.log('Rendered: '.cyan + sassDirectory + '/' + sassFilename)
      postcss([ autoprefixer ]).process(result.css).then(function (result) {
        result.warnings().forEach(function (warn) {
          console.warn(warn.toString())
        })
        var cssFilename = sassFilename.replace('.scss', '.css')
        console.log('Auto-prefixed CSS in: '.cyan + cssDirectory + '/' + cssFilename)
        fs.writeFile(cssDirectory + '/' + cssFilename, result.css, function(err) {
          if (err) throw err
          console.log('Wrote: '.cyan + cssDirectory + '/' + cssFilename)
        })
      })
    })
  }

  if (setting_aggregate) {
    sassCompileAggregate(cssAggregateFilename)
  } else {
    sassCompileIndividual()
  }
}
