const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const generator = require('generate-password');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const ec2 = new AWS.EC2();
const SSH = require('simple-ssh')

const {
    createAccessToken,
    createRefreshToken,
    sendRefreshToken,
    sendAccessToken
  } = require('./auth/token.js');

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
            reject(null);
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
 
var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

function validEmail(email) {
    if (!email)
        return false;

    if(email.length>254)
        return false;

    var valid = emailRegex.test(email);
    if(!valid)
        return false;

    // Further checking of some things regex can't handle
    var parts = email.split("@");
    if(parts[0].length>64)
        return false;

    var domainParts = parts[1].split(".");
    if(domainParts.some(function(part) { return part.length>63; }))
        return false;

    return true;
}

function validUsername(username){
    // return /[A-Z]/       .test(pw) &&
    // /[a-z]/       .test(pw) &&
    // /[0-9]/       .test(pw) &&
    // /[^A-Za-z0-9]/.test(pw) &&
    // pw.length > 4;
    return true;
}

function validPassword(password)
{
    // return /[A-Z]/       .test(pw) &&
    // /[a-z]/       .test(pw) &&
    // /[0-9]/       .test(pw) &&
    // /[^A-Za-z0-9]/.test(pw) &&
    // pw.length > 4;
    return true;
}

module.exports = (pool, redis_client) => {

    router.post('/', (req, res) => {
        console.log("Response recieved");
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        console.log(email + username + password);
        try{
            if(!email || !username || !password)     //Validate that all fields are filled in
            {
                console.log("Null fields");
                res.json({
                    message: "Please make sure all fields are filled in.",
                    code: -1
                });
            }
            else if(!validEmail(email))    //Validate valid email
            {
                console.log("Invalid email");
                res.json({
                    message: "Invalid email.  Please try again.",
                    code: -1
                });
            }
            else if(!validUsername(username))    //Validate valid username
            {
                console.log("Invalid username");
                res.json({
                    message: "Invalid username.  Please try again.",
                    code: -1
                });
            }
            else if(!validPassword(password))
            {
                console.log("Invalid password");
                res.json({
                    message: "Invalid password.  Please try again.",
                    code: -1
                });
            }
            else
            {
                console.log("Before connection.");
                (async () => {
                console.log("Pool connected");
                const client = await pool.connect();
                let query = "SELECT COUNT(1) FROM user_login WHERE username = $1;";
                let data = [username];
                console.log("Query: " + query);
                try {
                    let result = await client.query(query, data);
                    if(result.rows[0].count == 0)
                    {
                        console.log("User not found");

                        //  Hash Password and Generate Salt //

                        const salt = await bcrypt.genSalt(10);
                        const hash = await bcrypt.hash(password, salt);
                        const ssh_password = generator.generate({
                            length: 16, 
                            numbers: true,
                            symbols: true, 
                            strict: true
                        })

                        //      Query Database       //

                        query = "INSERT into user_login (username, email, password, salt, ssh_password) VALUES ($1, $2, $3, $4, $5) RETURNING userid;"
                        data = [username, email, hash, salt, ssh_password];
                        let result = await client.query(query, data);
                        const userid = result.rows[0].userid;
                        console.log("Successfully added to database user " + userid);

                        //      Add User to Machine     //

                        const IP = getIP();
                        if(!IP){
                            await bootMachine();
                            await checkIfRunning();
                        }

                        var ssh = new SSH({
                            host: IP,
                            user: process.env.EC2_SUDO_USER,
                            pass: process.env.EC2_SUDO_PASSWORD
                        });
                        
                        const command = 'sudo useradd -m -p $(openssl passwd -1 ' + ssh_password + ') -s /bin/bash ' + username

                        ssh.exec(command, {
                            out: function(stdout) {
                                console.log(stdout);
                            }
                        }).start();

                        //      Generate Tokens     //

                        const accessToken = createAccessToken(userid);
                        const refreshToken = createRefreshToken(userid);          

                        //      Store Refresh Token in Redis   //

                        redis_client.set(userid, refreshToken, (err, reply) => {
                            if (err) throw err;
                            console.log("Set new refresh token");
                            });
                        redis_client.expireat(userid, parseInt((+new Date)/1000) + (14 * 86400));   //    Expire key in 14 days

                        //      Send Token to Client        //

                        sendRefreshToken(res, refreshToken);
                        sendAccessToken(res, req, accessToken);

                        // const token = jwt.sign({
                        //     exp:  Math.floor(Date.now() / 1000) + (60 * 60),
                        //     user: username  
                        // }, 'secret');
                        // res.json({
                        //     message: "Successfully added to database.",
                        //     code: 1,
                        //     credentials: token
                        // });
                    }
                    else
                    {
                        console.log("User already exists");
                        res.json({
                            message: "User already exists",
                            code: -1
                        })
                    }
                } finally {
                    // Make sure to release the client before any error handling,
                    // just in case the error handling itself throws an error.
                    client.release()
                }
                })().catch(err => console.log(err.stack))
            }
        }
        catch (error){
            console.log("Server error");
            res.json({
                message: "There was an error on the server, please try again later.",
                code: 0
            })
        }
    });

    return router;
}