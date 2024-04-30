const { apiResponse } = require("@helpers/helpers");
const Trips = require("@models/trips");
const SearchOptions = require("@utils/searchOptions");
const { is_admin } = require("@helpers/users");

exports.create = async (req, res) => {
  try {
    const { country, entryDate, exitDate, images = [] } = req.body;
    const record = await Trips.create({
      country,
      entryDate,
      exitDate,
      images,
      user: req.user.id,
    });

    return apiResponse(req, res, record, 201, "Created Successfully.");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const { country, entryDate, exitDate } = req.body;
    const record = await Trips.findByIdAndUpdate(
      req.params.id,
      {
        country,
        entryDate,
        exitDate,
      },
      { new: true }
    );

    if (!record) return apiResponse(req, res, {}, 404, "No record found");
    return apiResponse(req, res, record, 200, "Updated Successfully.");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const record = await Trips.findByIdAndDelete(req.params.id);
    if (!record) return apiResponse(req, res, {}, 404, "No record found");
    return apiResponse(req, res, {}, 200, "Deleted successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const record = await Trips.findById(req.params.id);
    if (!record) return apiResponse(req, res, {}, 404, "No record found");
    return apiResponse(req, res, record, 200, "Record retrieved Successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const query = {};
    if (!is_admin(req.user)) query.user = req.user._id;

    const total = await Trips.countDocuments(query);
    const records =
      total > 0
        ? await Trips.find(query, null, new SearchOptions(req.query))
        : [];

    return apiResponse(
      req,
      res,
      { total, records },
      200,
      "Records retrieved Successfully"
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.addImage = async (req, res) => {
  try {
    const record = await Trips.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          images: req.body.image,
        },
      },
      { new: true }
    );
    if (!record) return apiResponse(req, res, {}, 404, "No record found");
    return apiResponse(req, res, {}, 200, "Uploaded successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};
