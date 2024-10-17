const express = require('express')
const router = express.Router()
const { cartModel, validateCart } = require('../models/cart')
const { validateAdmin, userIsLoggedIn } = require('../middlewares/auth')

router.get('/', userIsLoggedIn, async (req, res) => {
  try {
    let cart = await cartModel.find({ user: req.session.passport.user })
    res.send(cart)
  } catch (err) {
    res.status(500).send('Error fetching cart')
  }
})

router.post('/add/:id', userIsLoggedIn, async (req, res) => {
    
})

module.exports = router
