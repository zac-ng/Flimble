'use strict'

module.exports.connect = function(IP) {  //Export this as a function called connect that takes in a number num. This allows us to pass in the ip.
      var config = require('./app')(IP).config
      var server = require('./app')(IP).server
		  server.listen(config.listen.port);
      console.log("Server listening on port: " + config.listen.port);
      server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
          config.listen.port++
          console.warn('WebSSH2 Address in use, retrying on port ' + config.listen.port)
          setTimeout(function () {
            server.listen(config.listen.port)
          }, 250)
        } else {
          console.log('WebSSH2 server.listen ERROR: ' + err.code)
        }
      })
}
