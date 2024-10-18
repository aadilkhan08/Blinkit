const express = require('express')
const router = express.Router()
const { cartModel } = require('../models/cart')
const { userIsLoggedIn } = require('../middlewares/auth')
const { productModel } = require('../models/product')
const mongoose = require('mongoose')

// Middleware to validate ObjectId
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id)

// Get Cart for Logged-in User
router.get('/', userIsLoggedIn, async (req, res) => {
  try {
    let cart = await cartModel
      .findOne({ user: req.session.passport.user })
      .populate('products') // Populates the product details

    if (!cart) return res.status(404).send('Cart not found')

    let cartDataStructure = {}

    // Iterate over products to create the required structure
    cart.products.forEach(product => {
      let key = product._id.toString()
      if (cartDataStructure[key]) {
        cartDataStructure[key].quantity++
      } else {
        // Store the entire product data along with the quantity
        cartDataStructure[key] = {
          ...product.toObject(), // Convert Mongoose document to plain object
          quantity: 1
        }
      }
    })

    let finalArray = Object.values(cartDataStructure)
    res.render('cart', { cart: finalArray, finalPrice: cart.totalPricing })
  } catch (err) {
    console.error('Error fetching cart:', err)
    res.status(500).send('Internal Server Error')
  }
})

// Add Product to Cart
router.get('/add/:id', userIsLoggedIn, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res.status(400).send('Invalid Product ID')

    const product = await productModel.findById(req.params.id)
    if (!product) return res.status(404).send('Product not found')

    const cart = await cartModel.findOneAndUpdate(
      { user: req.session.passport.user },
      {
        $push: { products: product._id }, // Allows duplicates
        $inc: { totalPricing: product.price }
      },
      { new: true, upsert: true } // Create new cart if not found
    )

    const redirectTo = req.query.redirectTo || '/products'
    res.redirect(redirectTo)
  } catch (err) {
    console.error('Error adding product:', err)
    res.status(500).send('Internal Server Error')
  }
})

// Remove Product from Cart
router.get('/remove/:id', userIsLoggedIn, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id))
      return res.status(400).send('Invalid Product ID')

    const cart = await cartModel
      .findOne({ user: req.session.passport.user })
      .select('products totalPricing')
    if (!cart) return res.status(404).send('Cart not found')

    const productIndex = cart.products.findIndex(
      item => item.toString() === req.params.id
    )
    if (productIndex === -1)
      return res.status(404).send('Product not found in cart')

    cart.products.splice(productIndex, 1)
    cart.totalPricing = await productModel
      .find({ _id: { $in: cart.products } })
      .then(products => products.reduce((acc, p) => acc + p.price, 0))

    await cart.save()
    res.redirect('/products')
  } catch (err) {
    console.error('Error removing product:', err)
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
