const express = require('express');
const app = express();
const http = require('http').Server(app);
const path = require('path');
let dotenv = require('dotenv');
const PORT = process.env.PORT || 2112
const IP = process.env.IP;

const ssh = require(path.join(__dirname, 'ssh', 'ssh.js'))

app.get('/', (req, res) =>{
    res.send("Index Page");
})
app.get('/bob', (req, res) =>
{
	ssh.connect('54.211.114.44')	//ssh allows us to pass in a variable, thus we can pass in a number. This can allow us to query the api and then pass it in to be connected.
    console.log("Connected");
	//res.redirect('http://54.145.239.130:3113/ssh/user');
	res.redirect('http://localhost:3113/ssh/user');	//Localhost
	console.log("Redirected");
	//res.redirect('http://35.175.132.20:3113/ssh/host/127.0.0.1'); //Localhost only
	// ssh_path = 'https://paas-ssh.herokuapp.com:3113/ssh/host/:'+IP //Used for heroku
    // console.log("PATH: " + ssh_path)
    // res.redirect(ssh_path)
})

http.listen(PORT)  
console.log('Listening on port ' + PORT)
