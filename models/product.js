const mongoose = require('mongoose')
const Joi = require('joi')

// Define Product Schema
const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  image: {
    type: String, // Changed from Buffer to String for ImageKit URL
    required: true
  }
})

// Joi Validation Schema for Product
const validateProduct = (product) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().min(3).max(50).required(),
    stock: Joi.number().min(0).required(),
    description: Joi.string().min(10).max(500).required(),
    image: Joi.string().uri().optional(), // Make it optional at this point
  });

  return schema.validate(product);
};

// Export the Mongoose model and Joi validation function
const productModel = mongoose.model('Product', ProductSchema)

module.exports = {
  productModel,
  validateProduct
}
