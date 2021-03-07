const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema

const ItemSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now 
    },
    link: {
        type: String,
        require: false
    }
});

module.exports = Item = mongoose.model('item', ItemSchema);