const Room = require('../models/room');
const roomService = require('../services/roomService');

// Get rooms
const getRooms = async (req, res) => {
    const { location } = req.query;

    try {
        const rooms = await req.services.roomService.getAllRooms(location);
        console.log(rooms);
        res.json(rooms);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
};

const getRoom = async (req, res) => {
    const { id } = req.params; // Extract id from the request parameters
    const { location } = req.query;

    try {
        const room = await req.services.roomService.getRoomById(id);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' }); // Send a 404 error response if room is null
        }

        console.log(room);
        res.json(room);

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message })
        }
};

const makeRoom = async (req, res) => {
    const requestBody = req.body;
    
    try {
        const room = await req.services.roomService.createRoom(requestBody);
        console.log(room);
        res.json(room);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getRooms,
    getRoom,
    makeRoom
};
