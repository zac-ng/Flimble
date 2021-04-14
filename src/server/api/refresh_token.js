const express = require('express');
const cookieParser = require('cookie-parser');
const {verify} = require('jsonwebtoken');
const router = express.Router();

router.use(cookieParser())

const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} = require('./auth/token.js');

module.exports = (pool, redis_client) => {
  router.post('/', (req, res) => {
      const token = req.cookies.refreshtoken;

      if (!token) 
        return res.send({ accesstoken: '' });

      let payload;
      try {
        payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
      } catch (err) {
        return res.send({ accesstoken: '' });
      }

      //    If token is valid, check against user Postgres and Redis   //

      ( async () => {
        const client = await pool.connect();
        let query = "SELECT COUNT(1) FROM user_login WHERE userid = $1;";
        let data = [payload.userId];
        console.log("Query: " + query);
        try {
          let result = await client.query(query, data);

          //    If user not found send an empty access token back   //

          if(result.rows[0].count == 0)
          {
              console.log("User not found");
              return res.send({ accesstoken: '' });
          }
        }
        catch(error){
          console.log("Error found: " + error);
        } 
        finally {
            client.release()    //    Release client
        }
      });
      
      //    Check if user exists on Redis and hasn't expired    //
      
      redis_client.get(payload.userId, (err, reply) => {
        if (err) throw err;
        if(token == reply)
        {
          console.log("Token found in Redis.  Generating new tokens.");
          const accesstoken = createAccessToken(payload.userId);
          const refreshtoken = createRefreshToken(payload.userId);
          
          redis_client.set(payload.userId, refreshtoken, (err, reply) => {
            if (err) throw err;
            console.log("Storing new refresh token in Redis");
          });
          redis_client.expireat(payload.userId, parseInt((+new Date)/1000) + (14 * 86400));   //    Expire key in 14 days
        
          // All good to go, send new refreshtoken and accesstoken
          sendRefreshToken(res, refreshtoken);
          return res.send({ accesstoken });
        }
        else
        {
          console.log("Token was not found in Redis");
          return res.send({accesstoken: ''});
        }
      });
    });

  return router;
}