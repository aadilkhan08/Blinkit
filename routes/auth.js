const express = require('express')
const passport = require('passport')
const router = express.Router()

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }),
  (req, res) => {}
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/products',
    failureRedirect: '/'
  }),
  (req, res) => {
    req.login(req.user, err => {
      if (err) return res.status(500).send('Login failed')
      res.redirect('/') // Redirect to home or intended page
    })
  }
)

router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
})

module.exports = router
