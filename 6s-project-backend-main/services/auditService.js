const { ObjectId } = require('mongoose').Types;
const Audit = require('../models/audit');
const mongoose = require('mongoose');

// POST a filled in audit document to the database
const postAudit = async (questions) => {
    try {
        const audit = await Audit.insertMany(questions);

        return audit.map((a) => ({
            id: a._id,
            room: a.room,
            approved: a.approved
        }));
    } catch (error) {
        throw error;
    }
};

// Get audit by ID with _id fields renamed to id
const getAuditById = async (auditId) => {
    try {
        // Use Mongoose to fetch audit from the database
        const audit = await Audit.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(auditId) }
            },
            {
                $lookup: {
                    from: 'questions',
                    localField: 'questions',
                    foreignField: '_id',
                    as: 'questions'
                }
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'room',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $project: {
                    id: '$_id',
                    questions: {
                        $map: {
                            input: '$questions',
                            as: 'question',
                            in: {
                                id: '$$question._id',
                                question: '$$question.question',
                                type: '$$question.type',
                                value: '$$question.value'
                            }
                        }
                    },
                    room: {
                        $map: {
                            input: '$room',
                            as: 'r',
                            in: {
                                id: '$$r._id',
                                name: '$$r.name'
                            }
                        }
                    },
                    user: {
                        $map: {
                            input: '$user',
                            as: 'u',
                            in: {
                                id: '$$u._id',
                                name: '$$u.name'
                            }
                        }
                    },
                    approved: 1,
                    date: 1
                }
            },
            {
                $unwind: '$room'
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field
                    id: 1,
                    approved: 1,
                    questions: 1,
                    room: 1,
                    user: 1,
                    date: 1
                }
            }
        ]);

        return audit[0];
    } catch (error) {
        // Handle any errors that occur during the database operation
        throw error;
    }
};

// Get all audits from the database with _id fields renamed to id, including user id
const getAllAudits = async () => {
    try {
        // Use Mongoose to fetch audits from the database
        const audits = await Audit.aggregate([
            {
                $project: {
                    id: '$_id',
                    room: 1,
                    user: 1, // Include the user field
                    approved: 1,
                    date: 1
                }
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'room',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$room'
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field
                    id: 1,
                    room: {
                        id: '$room._id',
                        name: '$room.name'
                    },
                    user: {
                        id: '$user._id', // Include the user id
                        name: '$user.name'
                    },
                    approved: 1,
                    date: 1
                }
            }
        ]);

        return audits;
    } catch (error) {
        // Handle any errors that occur during the database operation
        throw error;
    }
};

// Approve audit using aggregation framework
const updateAuditApproval = async (auditId, updateData) => {
    try {
        const updatedAudit = await Audit.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(auditId) }
            },
            {
                $project: {
                    id: '$_id',
                    room: 1,
                    approved: 1
                }
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'room',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            {
                $unwind: '$room'
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field
                    id: 1,
                    room: {
                        id: '$room._id',
                        name: '$room.name'
                    },
                    approved: 1,
                    date: 1
                }
            }
        ]);

        if (updatedAudit.length > 0) {
            const updatedAuditId = updatedAudit[0].id;
            await Audit.findByIdAndUpdate(
                updatedAuditId,
                updateData,
                { new: true } // Return the modified document
            );
        }

        return updatedAudit[0];
    } catch (error) {
        throw error;
    }
};


// Delete an audit by ID
const deleteAudit = async (auditId) => {
    try {
        const deletedAudit = await Audit.findByIdAndDelete(
            new mongoose.Types.ObjectId(auditId)
        ).select('_id room approved');

        return {
            id: deletedAudit._id,
            room: deletedAudit.room,
            approved: deletedAudit.approved
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    deleteAudit,
    postAudit,
    getAllAudits,
    getAuditById,
    updateAuditApproval
};