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

module.exports = { isAuth };