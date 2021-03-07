const express = require('express');
const router = express.Router();

// Item Model
const Lecture = require('../../models/Lecture');


// @route GET api/items
// @desc get all items 
// @access public 
router.get('/', (req, res) => {
    Item.find()
        .sort({number : 1})
        .then(lectures => res.json(lectures))
});



module.exports = router;