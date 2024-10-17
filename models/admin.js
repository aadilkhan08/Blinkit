const mongoose = require('mongoose')
const Joi = require('joi')
const bcrypt = require('bcrypt')

// Define Admin Schema
const AdminSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3, // Minimum length for name
    maxlength: 50 // Maximum length for name
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // Store email in lowercase
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Regex for basic email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Minimum length for password
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin'],
    default: 'admin'
  }
})

// Hash the password before saving
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Joi Validation Schema for Admin
const validateAdministrator = admin => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('superadmin', 'admin').optional() // Role is optional
  })

  return schema.validate(admin)
}

// Export the Mongoose model and Joi validation function
const adminModel = mongoose.model('Admin', AdminSchema)

module.exports = {
  adminModel,
  validateAdministrator
}
