const { apiResponse } = require("@helpers/helpers");
const Country = require("@models/country");
const SearchOptions = require("@utils/searchOptions");

exports.create = async (req, res) => {
  try {
    const {
      name,
      code,
      start_tax_day,
      end_tax_day,
      allowed_days,
      start_tax_month,
      end_tax_month,
    } = req.body;

    const createdCountry = await Country.create({
      name,
      code,
      start_tax_day,
      end_tax_day,
      allowed_days,
      start_tax_month,
      end_tax_month,
    });

    return apiResponse(req, res, createdCountry, 201, "Created successfully.");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const query = { name: { $regex: new RegExp(req.query.search ?? "", "i") } };
    const total = await Country.countDocuments(query);
    const records =
      total > 0
        ? await Country.find(query, null, new SearchOptions(req.query))
        : [];
        

    return apiResponse(
      req,
      res,
      { total, records },
      201,
      "Records retrieved Successfully."
    );
  } catch (err) { 
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.update = async (req, res) => {
  try {
    const {
      name,
      code,
      start_tax_day,
      end_tax_day,
      allowed_days,
      start_tax_month,
      end_tax_month,
    } = req.body;
    const updatedCountry = await Country.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code,
        start_tax_day,
        end_tax_day,
        allowed_days,
        start_tax_month,
        end_tax_month,
      },
      {
        new: true,
      }
    );
    return apiResponse(req, res, updatedCountry, 201, "Updated successfully.");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    const record = await Country.findByIdAndDelete(req.params.id);
    if (!record) return apiResponse(req, res, {}, 404, "No record found");
    return apiResponse(req, res, {}, 200, "Deleted successfully");
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};

exports.getById = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return apiResponse(req, res, {}, 404, "Country not found");
    return apiResponse(
      req,
      res,
      country,
      200,
      "Country retrieved Successfully."
    );
  } catch (err) {
    return apiResponse(req, res, {}, 500, err.message);
  }
};
