const express = require('express');
const router = express.Router()
const { getRooms, getRoom, makeRoom } = require('../controllers/roomController');
const { requireLoggedInUser, requireAdmin } = require('./authRoutes');

//routes
router.get('/', requireLoggedInUser, getRooms);
router.get('/:id', requireLoggedInUser, getRoom);
router.post('/', requireLoggedInUser, requireAdmin, makeRoom);

module.exports = router