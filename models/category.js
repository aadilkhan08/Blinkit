const mongoose = require('mongoose');
const Joi = require('joi');

// Define Category Schema
const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true, // Set as required
    minlength: 3, // Minimum length for category name
    maxlength: 50, // Maximum length for category name
    unique: true, // Ensure uniqueness
    trim: true, // Trim leading and trailing spaces
    lowercase: true // Store in lowercase for uniformity
  }
});

// Mongoose pre-save hook to ensure lowercase transformation
categorySchema.pre('save', function (next) {
  this.name = this.name.toLowerCase().trim(); // Normalize the name
  next();
});

// Joi Validation Schema for Category
const validateCategory = (category) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(50)
      .required()
      .trim() // Ensure no leading or trailing spaces
      .lowercase() // Validate input in lowercase
  });

  return schema.validate(category);
};

// Export the Mongoose model and Joi validation function
const categoryModel = mongoose.model('Category', categorySchema);

module.exports = {
  categoryModel,
  validateCategory
};
