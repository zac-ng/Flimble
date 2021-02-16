'use strict'
// /* jshint esversion: 6, asi: true, node: true */
// /*
// * index.js
// *
// * WebSSH2 - Web to SSH2 gateway
// * Bill Church - https://github.com/billchurch/WebSSH2 - May 2017
// *
// */
// function connect(){
//   var config = require('./app').config
//   var server = require('./app').server
//   console.log("NUM:" + num);
//   server.listen({ host: config.listen.ip, port: config.listen.port })

//   console.log('WebSSH2 service listening on the following IP and Port: ' + config.listen.ip + ':' + config.listen.port)

//   server.on('error', function (err) {
//     if (err.code === 'EADDRINUSE') {
//       config.listen.port++
//       console.warn('WebSSH2 Address in use, retrying on port ' + config.listen.port)
//       setTimeout(function () {
//         server.listen(config.listen.port)
//       }, 250)
//     } else {
//       console.log('WebSSH2 server.listen ERROR: ' + err.code)
//     }
//   })
// }
module.exports.connect = function(num) {  //Export this as a function called connect that takes in a number num. This allows us to pass in the ip.
      var config = require('./app')(num).config
      var server = require('./app')(num).server
      console.log("NUM:" + num);
      server.listen({ host: config.listen.ip, port: config.listen.port })

      console.log('WebSSH2 service listening on the following IP and Port: ' + config.listen.ip + ':' + config.listen.port)

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
