const express = require('express')
const router = express.Router()
const { categoryModel } = require('../models/category')
const { validateAdmin } = require('../middlewares/auth')

router.post('/create', validateAdmin, async (req, res) => {
  let category = await categoryModel.create({ name: req.body.name })
  res.redirect('/admin/dashboard')
})

module.exports = router
