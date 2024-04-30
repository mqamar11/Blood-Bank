const sendEmail = require("@utils/sendEmail");
const {
  apiResponse,
  getSixDigitCode,
  // uploadFile,
} = require("@helpers/helpers");
const User = require("@models/user");
// const { validateImage } = require("@utils");
// const config = require("@config");

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const user = await User.findOne({ email });
    if (user) return apiResponse(req, res, {}, 400, "Email already exists.");

    // const { files } = req;
    // if (files) {
    //   const image_error = validateImage(files);
    //   if (image_error !== "")
    //     return apiResponse(req, res, [], 400, image_error);
    //   var uploaded_file = await uploadFile(
    //     files.profile_picture,
    //     config.profile.prefix,
    //     true
    //   );
    // }

    await User.create({
      name,
      email,
      password,
      phone,
      // profile_picture: uploaded_file,
    });

    return apiResponse(req, res, {}, 200, "User registered successfully.");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }).select("+password");
    if (!user)
      return apiResponse(req, res, {}, 404, "Invalid email or password.");

    // check if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched)
      return apiResponse(req, res, {}, 404, "Invalid email or password.");

    const token = user.getJwtToken();
    user = JSON.parse(JSON.stringify(user));
    user.token = token;
    delete user.password;

    return apiResponse(req, res, user, 200, "User logged in successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return apiResponse(req, res, {}, 404, "Email does not exist.");

    //Get six digit random code
    const otp_code = getSixDigitCode();

    //Update password reset code
    const updated_user = await User.findByIdAndUpdate(
      user._id,
      { otp_code },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    if (updated_user) {
      const { name } = user;
      const options = {
        name,
        email,
        subject: "Forget Password",
        file_name: "forgot_password",
        otp_code,
      };

      //send email
      const result = await sendEmail(options);

      if (
        result.hasOwnProperty("responseCode") &&
        result.responseCode === 451
      ) {
        return apiResponse(req, res, {}, 451, result.response);
      } else {
        return apiResponse(req, res, {}, 200, `Email sent to: ${email}`);
      }
    } else {
      return apiResponse(req, res, {}, 500, "Something went wrong");
    }
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { new_password, confirm_password, email, otp_code } = req.body;
    const user = await User.findOne({ email }).select("+otp_code");
    if (!user) return apiResponse(req, res, {}, 404, "Email does not exist.");

    if (user.otp_code !== otp_code)
      return apiResponse(req, res, {}, 404, "OTP code does not match.");

    if (new_password !== confirm_password)
      return apiResponse(req, res, {}, 400, "Password does not match.");

    //setup new password
    user.password = new_password;
    user.otp_code = "";
    const updated_user = await user.save();

    if (!updated_user)
      return apiResponse(req, res, {}, 404, "Failed to update password.");

    return apiResponse(req, res, {}, 200, "Password updated successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.user.ACCESS_TOKEN;
    return apiResponse(req, res, response, 200, "User logged out successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};
