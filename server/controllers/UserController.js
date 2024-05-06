const {
  apiResponse,
  requestFilled,
  createHash,
  // uploadFile,
} = require("@helpers/helpers");
const User = require("@models/user");
const sendEmail = require("@utils/sendEmail");
// const { validateImage } = require("@utils");
const { USER_ROLES } = require("@constants");
const SearchOptions = require("@utils/searchOptions");
// const config = require("@config");

exports.updateProfile = async (req, res) => {
  try {
    const {
      body,
      // files,
      user,
    } = req;

    // if (files) {
    //   const image_error = validateImage(files);
    //   if (image_error !== "")
    //     return apiResponse(req, res, [], 400, image_error);
    //   var file_uploaded = await uploadFile(
    //     files.profile_picture,
    //     config.profile.prefix,
    //     true,
    //     user.profile_picture
    //   );
    // }

    const name = requestFilled(body, "name") ? body.name : user.name;
    const country = requestFilled(body, "country")
      ? body.country
      : user.country;
    const phone = requestFilled(body, "phone") ? body.phone : user.phone;
    const password = requestFilled(body, "password")
      ? await createHash(body.password)
      : user.password;

    // const profile_picture =
    //   files !== null ? file_uploaded : user.profile_picture;

    const request_user = {
      name,
      country,
      phone,
      // email,
      password,
      // profile_picture,
    };

    const updated_user = await User.findByIdAndUpdate(
      req.user._id,
      request_user,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    ).select("-password");

    return apiResponse(
      req,
      res,
      updated_user,
      200,
      "User Profile Updated Successfully"
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.deleteProfilePicture = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user) return apiResponse(req, res, {}, 404, "User not found");

    await User.findByIdAndUpdate(
      id,
      { profile_picture: "" },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    return apiResponse(
      req,
      res,
      {},
      200,
      "Profile picture deleted successfully"
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id).select("-password").lean();
    if (!user) return apiResponse(req, res, {}, 404, "User not found");

    // user.profile_pic_url = user.profile_picture
    //   ? `${config.profile.basePath}${user.profile_picture}`
    //   : "";
    // delete user.profile_picture;

    return apiResponse(req, res, user, 200, "User profile details");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

// ADMIN

exports.getAllUser = async (req, res) => {
  try {
    const query = { role: USER_ROLES.USER };

    const total = await User.countDocuments(query);
    const records =
      total > 0
        ? await User.find(query, null, new SearchOptions(req.query)).lean()
        : [];

    // records.forEach((user) => {
    //   user.profile_picture_url = `${config.profile.basePath}${user.profile_picture}`;
    // });

    return apiResponse(
      req,
      res,
      { total, records },
      200,
      "Users retrieved successfully."
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.toggleAccountStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return apiResponse(req, res, {}, 404, "User not found");

    user.status = !user.status;
    await user.save();
    const name = user.name;

    const email = user.email;
    const status = user.status ? "Activated" : "Deactivated";
    const options = {
      name,
      email,
      subject: `${status} Account`,
      file_name: "change_status",
      status,
    };
    const result = await sendEmail(options);
    if (result.hasOwnProperty("responseCode") && result.responseCode === 451) {
      return apiResponse(req, res, {}, 451, result.response);
    }

    return apiResponse(
      req,
      res,
      {},
      200,
      `Email sent to: ${email} and changed status: ${status}`
    );
  } catch (error) {
    return apiResponse(req, res, {}, 500, error.message);
  }
};


exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const{ new_password, password} = req.body;
    
    const user = await User.findById(id).select("+password");
    if (!user) {
      return apiResponse(req, res, {}, 404, "User not found");
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return apiResponse(req, res, {}, 401, "Invalid password");
    }

    user.password = new_password;
    await user.save();

    return apiResponse(req, res, {}, 200, "Password updated successfully");
  } catch (error) {
    return apiResponse(req, res, {}, 500, error.message);
  }
};
