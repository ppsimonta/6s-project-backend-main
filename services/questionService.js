const { ObjectId } = require('mongoose').Types;
const Question = require('../models/question');

// POST a filled in audit document to the database
const postQuestions = async (questions) => {
    try {
        // Validate questions format
        if (!Array.isArray(questions)) {
            throw new Error('Invalid audit data format. Expected an array.');
        }

        // Create audit documents from auditData and save them to the database
        const auditDocuments = await Question.insertMany(questions);

        // Return the created audit documents
        return auditDocuments;
    } catch (error) {
        throw error;
    }
};

// Delete a question by ID
const deleteQuestion = async (questionId) => {
    try {
        await Question.findByIdAndDelete(questionId);
        return;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    postQuestions,
    deleteQuestion
};