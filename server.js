const express = require('express')
const app = express()
const path = require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOption')
const PORT = process.env.PORT || 5000

// log middleware
app.use(logger)

// cors
app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

// static file paths
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))

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

app.listen(PORT, () => {
    console.log(`Server running at ${PORT}`);
})



