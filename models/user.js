const mongoose = require('mongoose')
const Joi = require('joi')

// Define Address Schema
const AddressSchema = mongoose.Schema({
  street: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100
  },
  city: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  state: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  zipCode: {
    type: Number,
    required: true,
    validate: {
      validator: v => /^\d{5}$/.test(v.toString()), // Zip code should be 5 digits
      message: props => `${props.value} is not a valid zip code!`
    }
  },
  country: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  }
})

// Define User Schema
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    },
    password: {
      type: String,
    },
    phone: {
      type: Number,
      validate: {
        validator: v => /^\d{10}$/.test(v),
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    address: [AddressSchema],
    googleId: {
      type: String,
      sparse: true // Allows for this field to be optional and non-unique
    }
  },
  { timestamps: true }
)

// User Joi Validation Schema
const validateUser = user => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6),
    phone: Joi.string()
      .pattern(/^\d{10}$/),
    address: Joi.array().items(
      Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zipCode: Joi.number().required(),
        country: Joi.string().required()
      })
    ),
    googleId: Joi.string().optional()
  })

  return schema.validate(user)
}

// Joi Validation Schema for Address
const validateAddress = address => {
  const schema = Joi.object({
    street: Joi.string().min(3).max(100).required(),
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    zipCode: Joi.string()
      .pattern(/^\d{5}$/)
      .required(), // Zip code must be 5 digits
    country: Joi.string().min(2).max(50).required()
  })

  return schema.validate(address)
}

// Export the Mongoose models and validation function
const userModel = mongoose.model('User', userSchema)

module.exports = {
  userModel,
  validateUser,
}
