const mongoose = require('mongoose')
const Joi = require('joi')

// Define Delivery Schema
const DeliverySchema = mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  deliveryBoy: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  trackingURL: {
    type: String,
    trim: true
  },
  estimatedDeliveryTime: {
    type: Date,
    required: true
  }
})

// Joi Validation Schema for Delivery
const validateDelivery = delivery => {
  const schema = Joi.object({
    order: Joi.string().required(), // Should be the ObjectId in string format
    deliveryBoy: Joi.string().required(),
    status: Joi.string()
      .valid('Pending', 'Out for Delivery', 'Delivered', 'Cancelled')
      .optional(),
    trackingURL: Joi.string().uri().optional(), // Optional but should be a valid URL if provided
    estimatedDeliveryTime: Joi.date().required()
  })

  return schema.validate(delivery)
}

// Export the Mongoose model and Joi validation function
const deliveryModel = mongoose.model('Delivery', DeliverySchema)

module.exports = {
  deliveryModel,
  validateDelivery
}
