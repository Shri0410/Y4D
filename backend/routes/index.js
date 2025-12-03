/**
 * Centralized Routes Index
 * All API routes are registered here for better organization
 */

const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const permissionRoutes = require('./userPermissions');
const bannerRoutes = require('./banners');
const mentorRoutes = require('./mentors');
const managementRoutes = require('./management');
const boardTrusteeRoutes = require('./boardTrustees');
const careerRoutes = require('./careers');
const mediaRoutes = require('./media');
const ourWorkRoutes = require('./ourwork');
const reportRoutes = require('./reports');
const accreditationRoutes = require('./accreditations');
const impactDataRoutes = require('./impactData');
const registrationRoutes = require('./registration');
const paymentRoutes = require('./payment');
const contactRoutes = require('./contact');
const corporatePartnershipRoutes = require('./corporatePartnership');

// Register all routes with their base paths
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/permissions', permissionRoutes);
router.use('/banners', bannerRoutes);
router.use('/mentors', mentorRoutes);
router.use('/management', managementRoutes);
router.use('/board-trustees', boardTrusteeRoutes);
router.use('/careers', careerRoutes);
router.use('/media', mediaRoutes);
router.use('/our-work', ourWorkRoutes);
router.use('/reports', reportRoutes);
router.use('/accreditations', accreditationRoutes);
router.use('/registration', registrationRoutes);
router.use('/payment', paymentRoutes);
router.use('/contact', contactRoutes);
router.use('/corporate-partnership', corporatePartnershipRoutes);
router.use('/', impactDataRoutes); // Impact data uses /api/impact-data

module.exports = router;

