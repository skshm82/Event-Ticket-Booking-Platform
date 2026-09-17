const mongoose = require('mongoose');

/**
 * Validate that required fields are present in the request body.
 * @param {string[]} fields - Array of required field names
 */
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        fields: missing,
      });
    }

    next();
  };
};

/**
 * Validate that a param is a valid MongoDB ObjectId.
 * @param {string} paramName - The URL param name to validate
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format`,
      });
    }
    next();
  };
};

module.exports = { validateRequired, validateObjectId };
