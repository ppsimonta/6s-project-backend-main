const jwt = require('jsonwebtoken'); 
const questionService = require('../services/questionService');
const auditService = require('../services/auditService');

// Fill in an audit
const fillAudit = async (req, res) => {
    try {
        const data = req.body
        const questions = await req.services.questionService.postQuestions(data.questions);
        const datetime = new Date()

        const modifiedquestions = {
            "questions": questions, // This is an array
            "room": data.room,
            "user": data.user,
            "approved": false, // Add this
            "date": datetime // Add this
        };

        console.log(modifiedquestions)
        
        const audit = await req.services.auditService.postAudit(modifiedquestions);
        res.json(audit);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
};

// Get Audit
const getAudit = async (req, res) => {
    const { auditId } = req.params; // Extract id from the request parameters

    try {
        const audit = await req.services.auditService.getAuditById(auditId);
        console.log(audit);
        res.json(audit);

        } catch (error) {
            console.log(error);
            res.status(500).json({ error: error.message })
        }
};

// Get Audits
const getAudits = async (req, res) => {
    try {
        const audits = await req.services.auditService.getAllAudits();
        console.log(audits);
        res.json(audits);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message })
    }
}

// Approve an Audit
const approveAudit = async (req, res) => {
    try {
        const auditId = req.params.auditId; // auditId is passed as a URL parameter
        const updatedAudit = await req.services.auditService.updateAuditApproval(auditId, { approved: true });

        if (!updatedAudit) {
            return res.status(404).json({ error: 'Audit not found' });
        }

        res.json({ message: 'Audit approved successfully', audit: updatedAudit });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

// Delete an Audit
const discardAudit = async (req, res) => {
    try {
        const auditId = req.params.auditId; // auditId is passed as a URL parameter

        // Get the audit to check its approval status
        const audit = await req.services.auditService.getAuditById(auditId);

        if (!audit) {
            return res.status(404).json({ error: 'Audit not found' });
        }

        // Check if the audit is approved
        if (audit.approved) {
            return res.status(400).json({ error: 'Cannot discard an approved audit' });
        }

        // If not approved, delete the audit
        for (const question of audit.questions) {
            await req.services.questionService.deleteQuestion(question.id);
          }
        const deletedAudit = await req.services.auditService.deleteAudit(auditId);

        if (!deletedAudit) {
            return res.status(404).json({ error: 'Audit not found' });
        }

        res.json({ message: 'Audit discarded successfully', audit: deletedAudit });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    fillAudit,
    getAudit,
    getAudits,
    approveAudit,
    discardAudit
};
