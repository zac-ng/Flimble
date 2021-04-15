'use strict'

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const ec2 = new AWS.EC2();
const getPort = require('get-port');

const params = {
  InstanceIds: [
     process.env.EC2_INSTANCE_ID
  ]
};

function getIP() {
  return new Promise((resolve, reject) => {
    ec2.describeInstances(params, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      }
      else{
        resolve(data.Reservations[0].Instances[0].PublicIpAddress)
      }
    });  
  });
}

function bootMachine(){
  return new Promise((resolve, reject) => {
    ec2.startInstances(params, (err, data) => {
      if (err) 
      {
        console.log(err, err.stack);
        reject(err);
      }
      else     
      {
        console.log("Machine initializing");
        resolve(data);
      }
    });
  })
}

function checkIfRunning(){
  return new Promise((resolve, reject) => {
    ec2.waitFor('instanceRunning', params, (err, data) => {
      if (err) 
      {
        console.log(err, err.stack);
        reject(err);
      }
      else
      {
        console.log("Machine successfully booted up.");
        resolve(data);
      }
    });
  })
}

module.exports.connect = async function(serverPort, req, res, pool) {
  const socketPort = await getPort({port: getPort.makeRange(5000, 5100)});
  const IP = await getIP();
  if(IP == undefined) //  Check if machine is running.  If it is running boot machine
  {
    await bootMachine();
    await checkIfRunning();
    IP = await getIP();
  }
  if(!IP){
    console.log("There was an error getting the IP of the instance.");
    return res.redirect('http://localhost:' + serverPort + '/home');
  }
  console.log("Socket server listening on port " + socketPort + " and IP " + IP)
  var config = require('./app')(IP, socketPort, pool).config
  var server = require('./app')(IP, socketPort, pool).server
  server.listen(config.listen.port);
  console.log("Server listening on port: " + config.listen.port);
  server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
      config.listen.port++
      console.warn('WebSSH2 Address in use, retrying on port ' + config.listen.port)
      setTimeout(function () {
        server.listen(config.listen.port)
      }, 250)
      console.log("WebSSH2 listening on port: " + config.listen.port)
    } else {
      console.log('WebSSH2 server.listen ERROR: ' + err.code)
      res.redirect('http://localhost:' + serverPort + '/home')
    }
  })
  res.redirect('http://localhost:' + socketPort + '/user/ssh');
}