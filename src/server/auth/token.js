const jwt = require('jsonwebtoken');

// Create tokens
// ----------------------------------
const createAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
};

const createRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

// Send tokens
// ----------------------------------
const sendAccessToken = (res, req, accessToken, id) => {
  console.log("Access Token Sent");
  res.send({
    token: accessToken,
    email: "HELLO"
  });
};

const sendRefreshToken = (res, token) => {
  console.log("Refresh Token Sent");
  res.cookie('refreshtoken', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: 'api/refresh_token',
    expires: new Date(Date.now() + 7 * 216000000)   //    Token expires in 7 days
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken
};