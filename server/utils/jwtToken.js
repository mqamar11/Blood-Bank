const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // build in package so don't need to install it
const config = require("@config");

const getJwtToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    //expiresIn is optional, if expiresIn is not given then token will not expire lifetime
    // expiresIn: config.jwt.expiryTime
  });
};

const verifyJwtToken = (token, secret) => {
  return jwt.verify(token, secret);
};

const getResetPasswordToken = () => {
  //Generate token
  //use crypto to generate some random bytes,
  // this is buffer so use toString method to convert to string and pass encoding that is hex
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash
  return crypto.createHash("sha256").update(resetToken).digest("hex");
};

const sendToken = (req, res, user, statusCode, message) => {
  //create jwt token
  const token = getJwtToken(user.id);

  //options for cookie
  const options = {
    //when this cookie will expire
    expires: new Date(
      // 24 hours,60 minutes, 60 seconds, 1000 milliseconds
      Date.now() + config.cookiesExpiryTime * 24 * 60 * 60 * 1000
    ),
    /*if we don't specify this then this will be no httpOnly cookie and if cookie is not httpOnly
     * then this cookie can be accessed via javascript code*/
    httpOnly: true,
  };

  // const path = req.path;
  // var action = path.replace('/api/', '');
  const action = config.apiPrefix + req.path;
  const data = {
    action,
    meta: {
      code: statusCode,
      message,
    },
    data: user,
  };

  return res.status(200).cookie("token", token, options).json(data);
};

module.exports = {
  getJwtToken,
  sendToken,
  getResetPasswordToken,
  verifyJwtToken,
};
