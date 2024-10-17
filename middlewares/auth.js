const jwt = require('jsonwebtoken')
require('dotenv').config()

validateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token
    if (!token) return res.status(403).send('You need to login first')

    const data = await jwt.verify(token, process.env.JWT_SECRET)
    req.user = data
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).send('Session expired. Please log in again.')
    } else if (err.name === 'JsonWebTokenError') {
      res.status(401).send('Invalid token. Please log in again.')
    } else {
      res.status(500).send('Something went wrong')
    }
  }
}

userIsLoggedIn = async (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next()
  res.send('User Not Found!')
}

module.exports = { validateAdmin, userIsLoggedIn }
