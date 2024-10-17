const mongoose = require('mongoose')
const Joi = require('joi')

// Define Order Schema
const OrderSchema = mongoose.Schema({
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
        min: 1
      }
    }
  ],
  totalPricing: {
    type: Number,
    required: true,
    default: 0
  },
  address: {
    type: String,
    required: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    required: true
  }
})

// Joi Validation Schema for Order
const validateOrder = order => {
  const schema = Joi.object({
    user: Joi.string().required(),
    products: Joi.array()
      .items(
        Joi.object({
          product: Joi.string().required(),
          quantity: Joi.number().min(1).required() // Ensure at least 1 item is ordered
        })
      )
      .required(),
    totalPricing: Joi.number().min(0).required(),
    address: Joi.string().required(),
    payment: Joi.string().required(),
    delivery: Joi.string().required()
  })

  return schema.validate(order)
}

// Export the Mongoose model and Joi validation function
const orderModel = mongoose.model('Order', OrderSchema)

module.exports = {
  orderModel,
  validateOrder
}
