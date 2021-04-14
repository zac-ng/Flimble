const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const {
    createAccessToken,
    createRefreshToken,
    sendRefreshToken,
    sendAccessToken
  } = require('../auth/token.js');

//  Shorthand Email Regex, not RFC compliant
 
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
        const username = req.body.username;
        const password = req.body.password;
        console.log(username + password);
        try{
            if(!username || !password)     //Validate that all fields are filled in
            {
                console.log("Null fields");
                res.json({
                    message: "Please make sure all fields are filled in.",
                    code: -1
                });
            }
            else if(!validUsername(username))    //Validate valid email
            {
                console.log("Invalid email");
                res.json({
                    message: "Invalid email.  Please try again.",
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
                    let query = "SELECT SALT FROM user_login WHERE username = $1;";
                    let data = [username];
                    console.log("Query: " + query);
                    try {
                        let result = await client.query(query, data);
                        console.log(result.rows[0]);
                        if(result.rows.length > 0 && result.rows[0].salt)
                        {
                            const password_salt = result.rows[0].salt;
                            console.log("Pw: " + password + "\nSalt: "+password_salt);
                            const hash = await bcrypt.hash(password, password_salt);

                            //      Query Database       //

                            query = "SELECT userid FROM user_login WHERE username = $1 AND password = $2";
                            data = [username, hash];
                            result = await client.query(query, data);
                            if(result.rows.length > 0)
                            {
                                console.log("Credentials are correct")
                                const userid = result.rows[0].userid;
                                
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

                            }
                            else
                            {
                                console.log("Incorrect username or password.");
                                res.json({
                                    message: "Incorrect username or password.",
                                    code: -1
                                })
                            }
                        }
                        else
                        {
                            console.log("User does not exist in database");
                            res.json({
                                message: "User does not exist.",
                                code: -1
                            })
                        }
                    } finally {
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