const express = require('express')
const { getAllUsers, createNewUser, updateUser, deleteUser } = require('../controllers/usersController')
const verifyJWT = require('../middleware/verifyJWT')
const router = express.Router()

// apply verifyJWT middleware to all routes in this file
router.use(verifyJWT)

router.route('/')
    .get(getAllUsers)
    .post(createNewUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router