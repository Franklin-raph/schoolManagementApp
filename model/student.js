const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// create student schema
const StudentSchema = Schema({
    name: {
        type: String,
        required: true
    },
    email: {
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
    gender: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    }
}, 
    {timestamps: true}
)

const Students = mongoose.model('Students', StudentSchema);
module.exports = Students