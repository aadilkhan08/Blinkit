const express = require('express')
const router = express.Router()
const { productModel, validateProduct } = require('../models/product')
const { categoryModel } = require('../models/category')
const imagekit = require('../config/imagekit')
const { validateAdmin, userIsLoggedIn } = require('../middlewares/auth')

router.get('/', async (req, res) => {
  try {
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

    let rnproducts = await productModel.aggregate([{ $sample: { size: 3 } }])

    // Format the result into separate objects for each category
    const formattedResult = result.reduce((acc, category) => {
      acc[category.category] = category.products // Create a new key for each category
      return acc
    }, {})

    res.render(`index`, { products: formattedResult, rnproducts })
  } catch (error) {
    res.status(500).send({ message: 'Error fetching products' })
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
