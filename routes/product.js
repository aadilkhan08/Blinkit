const express = require('express')
const router = express.Router()
const { productModel, validateProduct } = require('../models/product')
const { categoryModel } = require('../models/category')
const { cartModel, validateCart } = require('../models/cart')
const imagekit = require('../config/imagekit')
const { validateAdmin, userIsLoggedIn } = require('../middlewares/auth')

router.get('/', async (req, res) => {
  let someThingInCart = false
  let cartCount = 0

  try {
    // Aggregate products by category
    let result = await productModel.aggregate([
      {
        $group: {
          _id: '$category',
          products: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          products: { $slice: ['$products', 10] }
        }
      }
    ])

    // Check if the user is authenticated
    let cart
    if (req.session.passport && req.session.passport.user) {
      cart = await cartModel.findOne({ user: req.session.passport.user })

      // Check if the cart exists and has products
      if (cart && cart.products) {
        someThingInCart = true
        cartCount = cart.products.length // Safe to access products here
      }
    }

    // Fetch 3 random products
    let rnproducts = await productModel.aggregate([{ $sample: { size: 3 } }])

    // Format the result into separate objects for each category
    const formattedResult = result.reduce((acc, category) => {
      acc[category.category] = category.products
      return acc
    }, {})

    // Render the index page with necessary data
    res.render('index', {
      products: formattedResult,
      rnproducts,
      someThingInCart,
      cartCount: cart ? cart.products.length : 0
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).send('The error is occurring: ' + error)
  }
})

router.get('/delete/:id', validateAdmin, async (req, res) => {
  try {
    let product = await productModel.findOneAndDelete({ _id: req.params.id })
    if (!product) {
      return res.status(404).send({ message: 'Product not found' })
    }
    res.redirect('/admin/products')
  } catch (error) {
    res.status(500).send({ message: 'Error deleting product' })
  }
})

router.post('/delete', validateAdmin, async (req, res) => {
  try {
    let product = await productModel.findOneAndDelete({
      _id: req.body.product_id
    })
    if (!product) {
      return res.status(404).send({ message: 'Product not found' })
    }
    res.redirect('back')
  } catch (error) {
    res.status(500).send({ message: 'Error deleting product' })
  }
})

// Create a new product
router.post('/', async (req, res) => {
  try {
    const { name, price, category, stock, description } = req.body
    const file = req.files?.image

    if (!file) {
      return res.status(400).send({ message: 'Image is required' })
    }

    // First validate the product data (without the image URL yet)
    const { error } = validateProduct({
      name,
      price,
      category,
      stock,
      description
    })

    if (error) {
      return res.status(400).send({ message: error.details[0].message })
    }

    let isCategory = await categoryModel.findOne({ name: category })
    if (!isCategory) {
      await categoryModel.create({ name: category })
    }

    // Upload image to ImageKit
    const uploadResponse = await imagekit.upload({
      file: file.data,
      fileName: `${Date.now()}_${file.name}`
    })

    // Now create the product with the uploaded image URL
    await productModel.create({
      name,
      price,
      category,
      stock,
      description,
      image: uploadResponse.url // Use the uploaded image URL
    })

    res.redirect('/admin/products')
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).send({ message: 'Error creating product' })
  }
})

module.exports = router
