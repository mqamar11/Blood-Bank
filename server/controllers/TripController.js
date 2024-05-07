const { apiResponse, appendZero } = require("@utils");
const Trips = require("@models/trips");
const Country = require("@models/country");
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
    const { entry_date, exit_date } = req.query;
    const query = {};
    if (!is_admin(req.user)) query.user = req.user._id;
    if (entry_date) query.entryDate = { $gte: entry_date };
    if (exit_date) query.exitDate = { $lte: exit_date };

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

exports.getTripsByCountries = async (req, res) => {
  try {
    const records = await Country.find({ status: true }).lean();
    const currentYear = new Date().getFullYear();
    for (const country of records) {
      const startDay = appendZero(country.start_tax_day);
      const startMonth = appendZero(country.start_tax_month);
      const endDay = appendZero(country.end_tax_day);
      const endMonth = appendZero(country.end_tax_month);
      const statDate = `${currentYear}-${startMonth}-${startDay}T00:00:00Z`;
      const endDate = `${currentYear}-${endMonth}-${endDay}T23:59:59Z`;

      country.trips = await Trips.find({
        user: req.user._id,
        country: country._id,
        $or: [
          {
            entryDate: { $gte: statDate },
            exitDate: { $lte: endDate },
          },
          {
            entryDate: { $lt: statDate },
            exitDate: { $gte: statDate },
          },
          {
            entryDate: { $gte: statDate, $lte: endDate },
            exitDate: { $gt: endDate },
          },
        ],
      });
    }

    return apiResponse(req, res, records, 200, "Trips retrieved Successfully.");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};


