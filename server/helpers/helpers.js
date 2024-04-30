const bcrypt = require("bcryptjs");
const fs = require("fs");
const datetime = require("./datetime");
const config = require("@config");
const logger = require("@base/logger");

const apiResponse = (req, res, data, code, message) => {
  if (req == undefined) throw Error("req is required");
  if (res == undefined) throw Error("res is required");
  if (data == undefined) throw Error("data is required");
  if (code == undefined) throw Error("code is required");
  if (message == undefined) throw Error("message is required");

  let path = req.path;
  if (!path.includes("api")) path = `/${config.apiPrefix}${req.path}`;
  const action = path.replace("/", "");

  var data = {
    action,
    meta: {
      code,
      message,
    },
    data,
  };

  return res.status(200).json(data);
};

const makePostSimple = (post) => {
  var active_buffer = Buffer.from(post);
  var active_boolean = Boolean(active_buffer.readInt8());
  return active_boolean;
};

const getSixDigitCode = () => {
  //generate 6 digit random number
  const min = 100000;
  const max = 999999;

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createHash = async (value) => {
  return await bcrypt.hash(value, 10);
};

const requestFilled = (body, property) => {
  //Check if property exists in request body and not empty
  if (body.hasOwnProperty([property]) && body[property] !== "") {
    return true;
  }
  return false;
};

const uploadFile = async (
  file,
  dirPath = "",
  unique_name = false,
  old_file_name = null
) => {
  let old_file_path = null;
  const file_name =
    unique_name === false
      ? file.name
      : `${datetime.getCurrentTimeUnix()}${file.name}`;

  if (old_file_name !== null) {
    old_file_path = `${dirPath}/${old_file_name}`;
  }

  const path = `${dirPath}/${file_name}`;

  return new Promise(async (resolve, reject) => {
    file.mv(path, (err) => {
      if (!err) {
        if (old_file_path !== null) {
          //check that old file exists in folder or not

          //fs.R_OK:  check for read permission
          fs.access(old_file_path, fs.R_OK, (err) => {
            logger.warn(`File upload error:`, err);
            if (!err) {
              logger.warn("File exists");

              //delete old file from folder
              fs.unlink(old_file_path, (err) => {
                if (!err) logger.info("File deleted");
              });
            }
          });
        }
        resolve(file_name);
      }
      resolve(false);
    });
  });
};

const isEmpty = (obj) => Object.keys(obj).length === 0;

const sendToken = (user, statusCode, req, res, message) => {
  //create jwt token
  const token = user.getJwtToken();

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

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = {
  apiResponse,
  makePostSimple,
  getSixDigitCode,
  createHash,
  requestFilled,
  uploadFile,
  isEmpty,
  sendToken,
};
