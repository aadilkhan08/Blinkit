const mongoose = require('mongoose')
const Joi = require('joi')

// Define Cart Schema
const CartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1 // Ensure at least one item is in the cart
      }
    }
  ],
  totalPricing: {
    type: Number,
    required: true,
    default: 0
  }
})

// Joi Validation Schema for Cart
const validateCart = cart => {
  const schema = Joi.object({
    user: Joi.string().required(), // User ID should be in string format
    products: Joi.array()
      .items(
        Joi.object({
          product: Joi.string().required(), // Product ID should be in string format
          quantity: Joi.number().min(1).required() // Quantity must be at least 1
        })
      )
      .required(),
    totalPricing: Joi.number().min(0).required() // Total pricing must be a non-negative number
  })

  return schema.validate(cart)
}

// Export the Mongoose model and Joi validation function
const cartModel = mongoose.model('Cart', CartSchema)

module.exports = {
  cartModel,
  validateCart
}
