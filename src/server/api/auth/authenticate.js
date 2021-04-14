const express = require('express');
const router = express.Router();

const { verify } = require('jsonwebtoken');

const isAuth = (req) => {
    try{
        const authorization = req.headers['authorization'];
        if (authorization == null)
            return null;
        const token = authorization.split(' ')[1];
        const { userId } = verify(token, process.env.ACCESS_TOKEN_SECRET);
        return userId;
    }
    catch(err){
        console.log("There was an error extracting the userid from header.")
        return null;
    }
};

router.post('/', (req, res) => {
    try{
        const userId = isAuth(req);
        console.log("USER ID: " + userId);
        if(userId != null)
        {   
            console.log("User is authenticated.");
            res.json({
                "error": null,
                code: 1
            })
        }
        else
        {
            console.log("Error")
            res.json({
                "error": "No access token sent.",
                "code": -1
            });
        }
    }
    catch(err){
        console.log(err);
        res.json({
            "error": "An error was encountered on the server, please try again later.",
            "code": -2
        });
    }
})

module.exports = router;