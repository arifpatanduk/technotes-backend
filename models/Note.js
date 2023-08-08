const mongoose = require("mongoose")
const AutoIncrement = require("mongoose-sequence")(mongoose)

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'User' // reference to the User schema
    }, 
    title: {
        type: String, 
        required: true
    }, 
    text: {
        type: String, 
        required: true
    },  
    completed: {
        type: Boolean,  
        default: false
    }
}, {
    timestamps: true // to create created at and updated at to each data
})

// ticket auto increment
noteSchema.plugin(AutoIncrement, {
    inc_field: "ticket",
    id: "ticketNums",
    start_sequence: 500
})

module.exports = mongoose.model('Note', noteSchema)