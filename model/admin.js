const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// create admin Schema
const AdminSchema = Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    DOB: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
}, 
    {timestamps: true}
)

const Admins = mongoose.model('Admins', AdminSchema);
module.exports = Admins