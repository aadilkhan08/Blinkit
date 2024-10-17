const express = require('express')
const router = express.Router()

router.get('/login', (req, res) => {
  res.render(`user_login`)
})

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Session destroy error:', err)
      return res.status(500).send({ message: 'Error logging out' })
    }
    res.clearCookie('connect.sid')
    res.redirect('/')
  })
})

module.exports = router
