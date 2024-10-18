const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')
const passport = require('passport')
const helmet = require('helmet')
const flash = require('connect-flash')
const expressSession = require('express-session')
const indexRouter = require('./routes/index')
const adminRoute = require('./routes/admin')
const cartRoute = require('./routes/cart')
const productRoute = require('./routes/product')
const categoryRoute = require('./routes/category')
const userRoute = require('./routes/users')
const connectDB = require('./config/db')
require('dotenv').config()
require('./config/google-oauth-config')
const authRoute = require('./routes/auth')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')

const app = express()
const PORT = process.env.PORT || 3000

// Call the database connection
connectDB()

// Middleware setup
app.use(cors())
app.use(helmet())
app.use(flash())
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'DEVELOPMENT', // Secure cookies in production
      maxAge: 24 * 60 * 60 * 1000 // 1 day expiration
    }
  })
)
app.use(passport.initialize()) // Passport initialization
app.use(passport.session())

app.use(fileUpload())
app.use(cookieParser())
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://cdn.tailwindcss.com"
  )
  next()
})

app.use('/', indexRouter)
app.use('/auth', authRoute)
app.use('/admin', adminRoute)
app.use('/products', productRoute)
app.use('/categories', categoryRoute)
app.use('/users', userRoute)
app.use('/cart', cartRoute)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
