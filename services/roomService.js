const { ObjectId } = require('mongoose').Types;
const Room = require('../models/room');

// Get all rooms from the database with _id field renamed to id and excluding _id field
// Get all rooms from the database with _id field renamed to id and excluding _id field
const getAllRooms = async (location) => {
    try {
        const pipeline = [
            {
                $project: {
                    id: '$_id',
                    name: 1,
                    zone: 1,
                    floor: 1,
                    _id: 0  // Exclude _id field
                }
            }
        ];

        // Add $match stage to filter by location if provided
        if (location) {
            pipeline.unshift({
                $match: {
                    location: location
                }
            });
        }

        const rooms = await Room.aggregate(pipeline);

        return rooms;
    } catch (error) {
        return null;
    }
};;

const getRoomById = async (id) => {
    try {
        const room = await Room.aggregate([
            {
                $match: { _id: new ObjectId(id) }
            },
            {
                $lookup: {
                    from: 'audits',
                    let: { roomId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$room', '$$roomId'] },
                                        { $eq: ['$approved', true] }
                                    ]
                                }
                            }
                        },
                        {
                            $sort: { date: -1 }  // Sort audits by date in descending order
                        },
                        {
                            $limit: 1  // Get only the latest approved audit
                        },
                        {
                            $project: {
                                lastApprovedAuditDate: '$date'
                            }
                        }
                    ],
                    as: 'audits'
                }
            },
            {
                $project: {
                    id: '$_id',
                    name: 1,
                    zone: 1,
                    floor: 1,
                    location: 1,
                    info: 1,
                    lastApprovedAuditDate: { $arrayElemAt: ['$audits.lastApprovedAuditDate', 0] },
                    _id: 0
                }
            }
        ]);

        return room[0];
    } catch (error) {
        console.error(error);
        return null;
    }
};

const createRoom = async (room) => {
    try {
        const newRoom = await Room.create(room);
        return newRoom;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom
};
