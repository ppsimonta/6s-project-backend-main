const express = require('express');
const router = express.Router()
const { fillAudit, getAudit, getAudits, approveAudit, discardAudit } = require('../controllers/auditController');
const { requireLoggedInUser, requireAdmin, requireOperator } = require('../routes/authRoutes');

//routes
router.delete('/:auditId', requireLoggedInUser, requireOperator, discardAudit);
router.patch('/:auditId', requireLoggedInUser, requireOperator, approveAudit);
router.post('/', requireLoggedInUser, fillAudit);
router.get('/', requireLoggedInUser, requireOperator, getAudits);
router.get('/:auditId', requireLoggedInUser, requireOperator, getAudit);

module.exports = router