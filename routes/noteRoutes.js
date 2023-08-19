const express = require('express')
const { getAllNotes, 
    createNewNote, 
    updateNote, 
    deleteNote 
} = require('../controllers/notesController')
const verifyJWT = require('../middleware/verifyJWT')
const router = express.Router()

// apply verifyJWT middleware to all routes in this file
router.use(verifyJWT)

router.route('/')
    .get(getAllNotes)
    .post(createNewNote)
    .put(updateNote)
    .delete(deleteNote)

module.exports = router