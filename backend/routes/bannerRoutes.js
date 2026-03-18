const express = require('express');
const bannerController = require('../controllers/bannerController');
const upload = require('../config/multer');
const { verifyAdmin } = require('../middleware/authMiddleware');

// ==================== HERO SLIDER / BANNERS ====================
const bannerRouter = express.Router();

bannerRouter.get('/', bannerController.getBanners);

bannerRouter.post('/', verifyAdmin, upload.fields([
	{ name: 'desktop', maxCount: 1 },
	{ name: 'mobile', maxCount: 1 }
]), bannerController.addBanner);

bannerRouter.put('/:id', verifyAdmin, upload.fields([
	{ name: 'desktop', maxCount: 1 },
	{ name: 'mobile', maxCount: 1 }
]), bannerController.editBanner);

bannerRouter.delete('/:id', verifyAdmin, bannerController.deleteBanner);

bannerRouter.patch('/:id/toggle', verifyAdmin, bannerController.toggleBannerActive);

bannerRouter.post('/delete-many', verifyAdmin, bannerController.deleteManyBanners);

// ==================== ADMIN PAGE & SECTION MANAGEMENT ====================
const adminRouter = express.Router();

adminRouter.get('/pages/:slug', verifyAdmin, bannerController.getPageAdmin);

adminRouter.post('/pages/:slug/sections', verifyAdmin, bannerController.createSection);

adminRouter.put('/sections/:id', verifyAdmin, bannerController.updateSection);

adminRouter.delete('/sections/:id', verifyAdmin, bannerController.deleteSection);

adminRouter.patch('/sections/:id/reorder', verifyAdmin, bannerController.reorderSection);

adminRouter.post('/sections/:sectionId/blocks', verifyAdmin, upload.fields([
  { name: 'desktop', maxCount: 1 },
  { name: 'mobile', maxCount: 1 },
]), bannerController.addBlock);

adminRouter.put('/blocks/:id', verifyAdmin, upload.fields([
  { name: 'desktop', maxCount: 1 },
  { name: 'mobile', maxCount: 1 },
]), bannerController.updateBlock);

adminRouter.delete('/blocks/:id', verifyAdmin, bannerController.deleteBlock);

// ==================== PAGES (FRONTEND RENDERING) ====================
const pagesRouter = express.Router();

pagesRouter.get('/:slug', bannerController.getPageBySlug);

module.exports = { bannerRouter, adminRouter, pagesRouter };
