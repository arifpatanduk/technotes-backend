const User = require("../models/User");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    // Confirm data
    if (!username || !password ) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    
    const foundUser = await User.findOne({ username }).exec()
    
    if (!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    // compare request password with foundUser password
    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) return res.status(401).json({ message: 'Unauthorized' })

    // create access token
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '15m'}
    )
    
    // create refresh token
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    )

    // create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, // accessible only by web server
        secure: true, // https
        sameSite: 'None', // cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry: 7 days
    })

    // send response with accessToken containing username & roles
    res.json({ accessToken })

})

// @desc Refresh
// @route POST /auth/refresh
// @access Public - because token access has expired
const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    // get refresh token from request cookie
    const refreshToken = cookies.jwt

    // verify the refreshToken
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            // find user
            const foundUser = await User.findOne({ username: decoded.username }).exec()
            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            // create new access token
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '15m'}
            )

            res.json({ accessToken })
        })
    )
})

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = asyncHandler(async (req, res) => {
    
    // get cookie from request
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) // no content

    // clear cookie
    res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true
    })

    res.json({ message: 'Cookie cleared' })

})

module.exports = {
    login, refresh, logout
}

