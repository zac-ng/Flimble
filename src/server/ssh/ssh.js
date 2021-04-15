'use strict'

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const ec2 = new AWS.EC2();
const getPort = require('get-port');
const Client = require('ssh2').Client;
const conn  = new Client();
const { verify } = require('jsonwebtoken');


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

async function addUser(command, IP){
  return new Promise((resolve, reject) => {
      conn.on('ready', function() {
      //console.log('Client :: ready');
      conn.exec(command, function(err, stream) {
        if (err)
          reject()
        stream.on('close', function(code, signal) {
          //console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
          conn.end();
          resolve()
        }).on('data', function(data) {
          //console.log('STDOUT: ' + data);
        }).stderr.on('data', function(data) {
          //console.log('STDERR: ' + data);
        });
      });
      }).connect({
          host: IP,
          username: process.env.EC2_SUDO_USER,
          password: process.env.EC2_SUDO_PASSWORD
      });
    });
}

async function getLogin(token, pool){
  return new Promise((resolve, reject) => {
    console.log("Token: " + token);
    const { userId } = verify(token, process.env.ACCESS_TOKEN_SECRET);
    (async () => {
      const client = await pool.connect();
      let query = "SELECT username, ssh_password FROM user_login WHERE userid = $1;";
      let data = [userId];
      try {
          let result = await client.query(query, data);
          if(result.rows.length > 0)
          {
              resolve([result.rows[0].username, result.rows[0].ssh_password]);
          }
          else
          {
            reject([null, null])
          }
      } finally {
          // Make sure to release the client before any error handling,
          // just in case the error handling itself throws an error.
          client.release()
      }
      })().catch(err => console.log(err.stack))
  });
}

module.exports.connect = async function(serverPort, req, res, pool) {
  const socketPort = await getPort({port: getPort.makeRange(5000, 5100)});

  //    Boot Machine    //

  const IP = await getIP();

  if(IP == undefined)
  {
    await bootMachine();
    await checkIfRunning();
    IP = await getIP();
  }

  //    Add User to Machine   //

  const login = await getLogin(req.cookies.accesstoken, pool);

  const command = 'sudo useradd -m -p $(openssl passwd -1 \'' + login[1] + '\') -s /bin/bash \'' + login[0] + '\'';

  await addUser(command, IP);

  console.log("User added to machine");
  
  if(!IP){
    console.log("There was an error getting the IP of the instance.");
    return res.redirect('http://localhost:' + serverPort + '/home');
  }

  console.log("Socket server listening on port " + socketPort + " and IP " + IP)
  var config = require('./app')(IP, socketPort, login[0], login[1]).config
  var server = require('./app')(IP, socketPort, login[0], login[1]).server
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