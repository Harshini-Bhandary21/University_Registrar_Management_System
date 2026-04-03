const express = require('express');
const {
    getAllOfferings,
    getOfferingById,
    createOffering
} = require('../controllers/courseOfferingController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getAllOfferings);
router.get('/:courseNo/:year/:semester/:section', getOfferingById);
router.post('/', requireRole('admin'), createOffering);

module.exports = router;