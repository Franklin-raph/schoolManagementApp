const express =         require('express')
const morgan =          require('morgan')
const adminRoutes =     require('./routes/adminroutes')
const mongoose =        require('mongoose')
const flash =           require('connect-flash')
const session =         require('cookie-session')
const passport =        require('passport')
const methodOveride =   require('method-override')
const app =             express()
const bp =              require('body-parser')
const dotenv =          require('dotenv').config()

// require the passport config file
require('./config/passport')(passport)

// Port declaration
const port = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_URI)
    .then(() =>{
    // App listening at port 5000
    app.listen(port, () =>{
    console.log(`Server is running on port ${port} \nMongo Db is connected`)
        })
    }).catch( err => `An error occured while connection go Mongo Db`)

// middle-wares
app.use(express.static('public'))
app.use(morgan('tiny'))
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

// express session middle-ware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// method overide middle ware
app.use(methodOveride('_method'))

// passport middle-ware
app.use(passport.initialize())
app.use(passport.session())

// connect-flash middle-ware
app.use(flash())

// Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

// Render Engine
app.set('view engine', 'ejs')

// admin Routes
app.use('/admin', adminRoutes)

// index route
app.get('frankschoolmanagementsystem.herokuapp.com', (req, res) => {
    res.render('index')
})

// about route
app.get('/about', (req, res) => {
    res.render('about')
})

