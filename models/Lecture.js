const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema

const LectureSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    url: {
        type: String,
        require: false
    },
    course: {
        type: String,
        require: false
    },
    number: {
        type: Number,
        require: false
    }
});

module.exports = Item = mongoose.model('lecture', LectureSchema);