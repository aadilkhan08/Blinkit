const mongoose = require('mongoose')
const Joi = require('joi')

// Define Payment Schema
const PaymentSchema = mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    enum: ['COD', 'Online'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  }
})

// Joi Validation Schema for Payment
const validatePayment = payment => {
  const schema = Joi.object({
    order: Joi.string().required(), // Assume it's an ObjectId in string format
    amount: Joi.number().min(0).required(),
    method: Joi.string().valid('COD', 'Online').required(),
    status: Joi.string().valid('Pending', 'Completed', 'Failed').optional(),
    transactionId: Joi.string().optional()
  })

  return schema.validate(payment)
}

// Export the Mongoose model and Joi validation function
const paymentModel = mongoose.model('Payment', PaymentSchema)

module.exports = {
  paymentModel,
  validatePayment
}
