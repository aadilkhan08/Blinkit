const express = require('express')
const router = express.Router()
const { adminModel } = require('../models/admin')
const { productModel } = require('../models/product')
const { categoryModel } = require('../models/category')
const { validateAdmin } = require('../middlewares/auth')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
if (
  typeof process.env.NODE_ENV !== undefined &&
  process.env.NODE_ENV === 'DEVELOPMENT'
) {
  router.get('/create', async (req, res) => {
    try {
      let salt = await bcrypt.genSalt()
      let hash = await bcrypt.hash('hanmerijaan', salt)

      let admin = new adminModel({
        name: 'Aadil Khan',
        email: 'admin@example.com',
        password: hash,
        role: 'admin'
      })
      await admin.save()
      let token = jwt.sign(
        { email: 'admin@example.com', admin: true },
        process.env.JWT_SECRET
      )
      res.cookie('token', token)
      res.status(200).send({ message: 'Admin created successfully' })
    } catch (err) {
      res.status(500).send({ message: err.message })
    }
  })
}

router.get('/login', (req, res) => {
  res.render('admin_login')
})

router.post('/login', async (req, res) => {
  let { email, password } = req.body
  let admin = await adminModel.findOne({ email })
  if (!admin) {
    return res.status(401).send({ message: 'Admin doesnt exist' })
  }

  let validatePassword = bcrypt.compare(password, admin.password)
  if (!validatePassword) {
    return res.status(401).send({ message: 'Invalid password' })
  }
  let token = jwt.sign(
    { email: 'admin@example.com', admin: true },
    process.env.JWT_SECRET
  )
  res.cookie('token', token)
  res.redirect('/admin/dashboard')
})
router.get('/dashboard', validateAdmin, async (req, res) => {
  let productCount = await productModel.countDocuments()
  let categoryCount = await categoryModel.countDocuments()
  res.render('admin_dashboard', { productCount, categoryCount })
})
router.get('/products', validateAdmin, async (req, res) => {
  let result = await productModel.aggregate([
    // Step 1: Group products by category
    {
      $group: {
        _id: '$category', // Group by the category field
        products: { $push: '$$ROOT' } // Push the entire product document into an array
      }
    },
    // Step 2: Limit the array of products to 10 items per category
    {
      $project: {
        _id: 0, // Exclude the _id field
        category: '$_id', // Rename _id back to category
        products: { $slice: ['$products', 10] } // Limit products to the first 10
      }
    }
  ])

  // Format the result into separate objects for each category
  const formattedResult = result.reduce((acc, category) => {
    acc[category.category] = category.products // Create a new key for each category
    return acc
  }, {})

  res.render('admin_products', { products: formattedResult })
})

router.get('/logout', (req, res) => {
  res.cookie('token', '')
  res.redirect('/admin/login')
})

module.exports = router
