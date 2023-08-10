require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOption')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 5000

console.log(process.env.NODE_ENV)

connectDB()

// log middleware
app.use(logger)

// cors
app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

// static file paths
app.use('/', express.static(path.join(__dirname, 'public')))

// routes
app.use('/', require('./routes/root'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/notes', require('./routes/noteRoutes'))


app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if ( req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

// error handling
app.use(errorHandler)

// check db connection
mongoose.connection.once('open', () => {
    console.log('Database connected successfully')
    app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))
})

// if connection error
mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})




