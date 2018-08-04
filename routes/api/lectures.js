const express = require('express');
const router = express.Router();

// lecture Model
const Lecture = require('../../models/Lecture');


// @route GET api/lectures
// @desc get all lectures 
// @access public 
router.get('/', (req, res) => {
    Item.find()
        .sort({number : 1})
        .then(lectures => res.json(lectures))
});



module.exports = router;
