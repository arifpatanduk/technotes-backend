const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler( async (req, res) => {
    const users = await User.find().select('-password').lean() // exclude password
    if (!users) return res.status(400).json({ message: 'No users found' })

    res.json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler( async (req, res) => {
    const { username, password, roles } = req.body

    // confirm data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' })
    }
    
    // check for duplicates
    const duplicate = await User.findOne({username}).lean().exec()
    if (duplicate) return res.status(409).json({ message: 'Duplicate username' })

    // hash the password
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = { 
        username, 
        "password": hashedPwd,
        roles
    }

    // create and store new user
    const user = await User.create(userObject)

    if (user) {
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
    
})

// @desc Update a user
// @route PUT /users
// @access Private
const updateUser = asyncHandler( async (req, res) => {
    
    const { id, username, roles, active, password } = req.body

    // confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length ||  typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }
    
    // check user
    const user = await User.findById(id).exec()
    if (!user) return res.status(400).json({ message: 'User not found' })

    // check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec()

    // allow updates to original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // set username, roles, & active
    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        // hash password
        user.password = await bcrypt.hash(password, 10)
    }

    // save user
    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
})

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler( async (req, res) => {
    const { id } = req.body
    if (!id) return res.status(400).json({ message: 'User ID required' })
    
    // get notes data by user ID
    const notes = await Note.findOne({ user: id }).lean().exec()

    // check if user has assigned notes
    if (notes?.length) {
        return res.status(400).json({ message: 'User has assigned notes' })
    }
    
    // check user
    const user = await User.findById({id}).exec()
    if (!user) return res.status(400).json({ message: 'User not found' })

    const result = await user.deleteOne()
    const reply = `Username ${result.username} with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
    getAllUsers, 
    createNewUser, 
    updateUser, 
    deleteUser
}