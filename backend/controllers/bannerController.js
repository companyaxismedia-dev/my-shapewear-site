const { Page, Section, SectionBlock } = require('../models/Banner');

// Helper: ensure homepage + hero_slider section exist
async function getHomeHeroSection() {
  let page = await Page.findOne({ slug: 'home' });
  if (!page) {
    page = await Page.create({ name: 'Homepage', slug: 'home', sections: [] });
  }

  let section = await Section.findOne({ page: page._id, type: 'hero_slider' }).populate({
    path: 'blocks',
    options: { sort: { order: 1 } },
  });

  if (!section) {
    section = await Section.create({
      page: page._id,
      type: 'hero_slider',
      title: 'Hero Slider',
      order: 1,
      active: true,
      blocks: [],
    });
    page.sections.push(section._id);
    await page.save();
  }

  return section;
}

const normalizeUrl = (req, url) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  const host = req.protocol + '://' + req.get('host');
  return host + url;
};

// Get hero slides (banners) across all sections (optional filter by section)
exports.getBanners = async (req, res) => {
  try {
    const page = await Page.findOne({ slug: 'home' }).populate({
      path: 'sections',
      populate: {
        path: 'blocks',
        options: { sort: { order: 1, createdAt: 1 } },
      },
    });

    if (!page) return res.json([]);

    const sectionIdFilter = req.query.sectionId;

    const includeInactive = req.query.includeInactive === 'true';

    const slides = (page.sections || [])
      // .filter((section) => (sectionIdFilter && section._id.toString() !== sectionIdFilter) ? false : true)
      .filter((section) => !sectionIdFilter || section._id.toString() === sectionIdFilter)
      .flatMap((section) =>
        (section.blocks || []).map((block) => {
          const data = block.data || {};
          return {
            _id: block._id,
            sectionId: section._id,
            sectionTitle: section.title,
            order: block.order,
            active: data.active ?? true,
            altText: data.altText || '',
            link: data.link || '',
            desktopUrl: normalizeUrl(req, data.desktopUrl),
            mobileUrl: normalizeUrl(req, data.mobileUrl),
            createdAt: block.createdAt,
            updatedAt: block.updatedAt,
          };
        })
      )
      .filter((item) => (includeInactive ? true : item.active));

    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new slide to hero slider
exports.addBanner = async (req, res) => {
  try {
    // Allow mobile image to be optional
    if (!req.files || !req.files.desktop) {
      return res.status(400).json({ message: 'Desktop image is required' });
    }

    let section = null;
    if (req.body.sectionId) {
      section = await Section.findById(req.body.sectionId);
    }
    if (!section) {
      section = await getHomeHeroSection();
    }

    const desktopUrl = `/uploads/banner/${req.files.desktop[0].filename}`;
    const mobileUrl = req.files.mobile ? `/uploads/banner/${req.files.mobile[0].filename}` : null;

    const newBlock = await SectionBlock.create({
      section: section._id,
      order: section.blocks.length,
      data: {
        desktopUrl,
        mobileUrl,
        altText: req.body.altText || '',
        link: req.body.link || '',
        active: req.body.active !== undefined ? req.body.active === 'true' || req.body.active === true : true,
      },
    });

    section.blocks.push(newBlock._id);
    await section.save();

    res.json({
      _id: newBlock._id,
      sectionId: section._id,
      sectionTitle: section.title,
      desktopUrl: normalizeUrl(req, desktopUrl),
      mobileUrl: normalizeUrl(req, mobileUrl),
      altText: newBlock.data.altText,
      link: newBlock.data.link,
      active: newBlock.data.active,
      createdAt: newBlock.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Edit slide
exports.editBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const block = await SectionBlock.findById(id);
    if (!block) return res.status(404).json({ message: 'Slide not found' });

    if (req.files) {
      if (req.files.desktop && req.files.desktop[0]) {
        block.data.desktopUrl = `/uploads/banner/${req.files.desktop[0].filename}`;
      }
      if (req.files.mobile && req.files.mobile[0]) {
        block.data.mobileUrl = `/uploads/banner/${req.files.mobile[0].filename}`;
      }
    }

    if (req.body.altText !== undefined) {
      block.data.altText = req.body.altText;
    }
    if (req.body.link !== undefined) {
      block.data.link = req.body.link;
    }
    if (req.body.active !== undefined) {
      block.data.active = req.body.active === 'true' || req.body.active === true;
    }

    await block.save();

    res.json({
      _id: block._id,
      sectionId: block.section,
      desktopUrl: normalizeUrl(req, block.data.desktopUrl),
      mobileUrl: normalizeUrl(req, block.data.mobileUrl),
      altText: block.data.altText,
      link: block.data.link,
      active: block.data.active,
      createdAt: block.createdAt,
      updatedAt: block.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete slide
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const block = await SectionBlock.findById(id);
    if (!block) return res.status(404).json({ message: 'Slide not found' });

    const section = await Section.findById(block.section);
    if (section) {
      section.blocks = section.blocks.filter((b) => b.toString() !== id);
      await section.save();
    }

await SectionBlock.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle active/inactive
exports.toggleBannerActive = async (req, res) => {
  try {
    const { id } = req.params;
    const block = await SectionBlock.findById(id);
    if (!block) return res.status(404).json({ message: 'Slide not found' });
    block.data.active = !block.data.active;
    await block.save();
    res.json({ active: block.data.active });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk delete slides
exports.deleteManyBanners = async (req, res) => {
  try {
    const { ids } = req.body; // array of block ids
    const blocks = await SectionBlock.find({ _id: { $in: ids } });
    const sectionIds = [...new Set(blocks.map((b) => b.section.toString()))];

    // Remove references from sections
    await Promise.all(sectionIds.map(async (sectionId) => {
      const section = await Section.findById(sectionId);
      if (!section) return;
      section.blocks = section.blocks.filter((b) => !ids.includes(b.toString()));
      await section.save();
    }));

    await SectionBlock.deleteMany({ _id: { $in: ids } });

    res.json({ message: 'Deleted selected slides' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ==================== PAGE & SECTION MANAGEMENT ==================== */

// ADMIN: Get page with sections+blocks (for editing)
exports.getPageAdmin = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({ slug })
      .populate({
        path: 'sections',
        options: { sort: { order: 1, createdAt: 1 } },
        populate: {
          path: 'blocks',
          options: { sort: { order: 1, createdAt: 1 } },
        },
      });

    if (!page) return res.status(404).json({ message: 'Page not found' });

    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Create a section
exports.createSection = async (req, res) => {
  try {
    const { slug } = req.params;
    const { type, title, order, active, device, startDate, endDate, settings, layoutType, rows, columns } = req.body;

    if (!type || typeof type !== 'string' || !type.trim()) {
      return res.status(400).json({ message: 'Section type is required' });
    }

    const page = await Page.findOne({ slug });
    if (!page) return res.status(404).json({ message: 'Page not found' });

    const parsedOrder =
      order !== undefined && order !== null && order !== '' ? Number(order) : null;

    const section = await Section.create({
      page: page._id,
      type: type.trim(),
      title: title || '',
      layoutType: layoutType || 'grid',
      rows: typeof rows === 'number' ? Math.max(1, rows) : 1,
      columns: typeof columns === 'number' ? Math.max(1, columns) : 4,
      order:
        parsedOrder !== null && !Number.isNaN(parsedOrder)
          ? parsedOrder
          : page.sections.length,
      active:
        active !== undefined
          ? typeof active === 'string'
            ? active === 'true'
            : Boolean(active)
          : true,
      device: device || 'all',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      settings: settings || {},
      blocks: [],
    });

    page.sections.push(section._id);
    await page.save();

    res.json(section);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Update section
exports.updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const section = await Section.findById(id);
    if (!section) return res.status(404).json({ message: 'Section not found' });

    if (updates.type !== undefined) {
      if (!updates.type || typeof updates.type !== 'string' || !updates.type.trim()) {
        return res.status(400).json({ message: 'Section type is required' });
      }
      section.type = updates.type.trim();
    }

    if (updates.title !== undefined) section.title = updates.title;
    if (updates.order !== undefined) section.order = Number(updates.order) || 0;
    if (updates.layoutType !== undefined) section.layoutType = updates.layoutType;
    if (updates.rows !== undefined) section.rows = Math.max(1, Number(updates.rows) || 1);
    if (updates.columns !== undefined) section.columns = Math.max(1, Number(updates.columns) || 4);
    if (updates.active !== undefined) {
      if (typeof updates.active === 'string') {
        section.active = updates.active === 'true';
      } else {
        section.active = Boolean(updates.active);
      }
    }
    if (updates.device !== undefined) section.device = updates.device;
    if (updates.startDate !== undefined)
      section.startDate = updates.startDate ? new Date(updates.startDate) : null;
    if (updates.endDate !== undefined)
      section.endDate = updates.endDate ? new Date(updates.endDate) : null;
    if (updates.settings !== undefined) section.settings = updates.settings;

    await section.save();
    res.json(section);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Delete section
exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) return res.status(404).json({ message: 'Section not found' });

    // Prevent deletion of hero_slider section
    if (section.type === 'hero_slider') {
      return res.status(403).json({ message: 'Hero Slider section cannot be deleted' });
    }

    const page = await Page.findById(section.page);
    if (page) {
      page.sections = page.sections.filter((s) => s.toString() !== id);
      await page.save();
    }

    await SectionBlock.deleteMany({ section: section._id });
await Section.findByIdAndDelete(id);

    res.json({ message: 'Section deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Reorder sections
exports.reorderSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;
    const section = await Section.findById(id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    section.order = order;
    await section.save();
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Add block to section
exports.addBlock = async (req, res) => {
  try {
    const { sectionId } = req.params;

    console.log('📥 addBlock request:');
    console.log('   sectionId:', sectionId);
    console.log('   req.files keys:', req.files ? Object.keys(req.files) : 'NO FILES');
    console.log('   has desktop:', !!req.files?.desktop?.length);
    console.log('   has mobile:', !!req.files?.mobile?.length);
    console.log('   body.data:', req.body.data);

    const section = await Section.findById(sectionId);
    if (!section) return res.status(404).json({ message: 'Section not found' });

    // For new blocks, desktop image is required
    if (!req.files || !req.files.desktop || !req.files.desktop[0]) {
      console.log('❌ No desktop file found!');
      return res.status(400).json({ message: 'Desktop image is required for new blocks' });
    }

    let blockData = {};

    // Start with data field if provided
    if (req.body.data) {
      try {
        blockData = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
      } catch (err) {
        return res.status(400).json({ message: 'Invalid JSON data' });
      }
    }

    // Handle individual field updates
    if (req.body.link !== undefined) blockData.link = req.body.link;
    if (req.body.active !== undefined)
      blockData.active = req.body.active === 'true' || req.body.active === true;
    if (req.body.altText !== undefined) blockData.altText = req.body.altText;

    // Handle file uploads - these take precedence
    if (req.files) {
      if (req.files.desktop && req.files.desktop[0]) {
        blockData.desktopUrl = `/uploads/banner/${req.files.desktop[0].filename}`;
        console.log('✓ Desktop file saved:', blockData.desktopUrl);
      }
      if (req.files.mobile && req.files.mobile[0]) {
        blockData.mobileUrl = `/uploads/banner/${req.files.mobile[0].filename}`;
        console.log('✓ Mobile file saved:', blockData.mobileUrl);
      }
    }

    const block = await SectionBlock.create({
      section: section._id,
      order: req.body.order ?? section.blocks.length,
      data: blockData,
    });

    console.log('✅ Block created:', {
      blockId: block._id,
      desktopUrl: blockData.desktopUrl,
      mobileUrl: blockData.mobileUrl,
    });

    section.blocks.push(block._id);
    await section.save();

    res.json(block);
  } catch (err) {
    console.error('❌ Error in addBlock:', err);
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Update block
exports.updateBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const block = await SectionBlock.findById(id);
    if (!block) return res.status(404).json({ message: 'Block not found' });

    // Preserve existing data and merge with updates
    let newData = block.data || {};

    if (updates.data !== undefined) {
      try {
        const parsedData = typeof updates.data === 'string' ? JSON.parse(updates.data) : updates.data;
        newData = { ...newData, ...parsedData };
      } catch (err) {
        return res.status(400).json({ message: 'Invalid JSON data' });
      }
    }

    // Apply individual field updates (these take precedence)
    if (updates.order !== undefined) block.order = updates.order;
    if (updates.link !== undefined) newData.link = updates.link;
    if (updates.active !== undefined) newData.active = updates.active === 'true' || updates.active === true;
    if (updates.altText !== undefined) newData.altText = updates.altText;

    // Handle file uploads (these take precedence over JSON data)
    if (req.files) {
      if (req.files.desktop && req.files.desktop[0]) {
        newData.desktopUrl = `/uploads/banner/${req.files.desktop[0].filename}`;
      }
      if (req.files.mobile && req.files.mobile[0]) {
        newData.mobileUrl = `/uploads/banner/${req.files.mobile[0].filename}`;
      }
    }

    block.data = newData;
    await block.save();

    console.log('✓ Block updated:', {
      blockId: block._id,
      data: newData,
      desktopUrl: newData.desktopUrl,
      mobileUrl: newData.mobileUrl,
    });

    res.json(block);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Delete block
exports.deleteBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const block = await SectionBlock.findById(id);
    if (!block) return res.status(404).json({ message: 'Block not found' });

    const section = await Section.findById(block.section);
    if (section) {
      section.blocks = section.blocks.filter((b) => b.toString() !== id);
      await section.save();
    }

await SectionBlock.findByIdAndDelete(id);
    res.json({ message: 'Block deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get page by slug (frontend rendering)
exports.getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const now = new Date();

    let page = await Page.findOne({ slug })
      .populate({
        path: 'sections',
        options: { sort: { order: 1, createdAt: 1 } },
        populate: {
          path: 'blocks',
          options: { sort: { order: 1, createdAt: 1 } },
        },
      });

    if (!page) {
      page = await Page.create({ name: 'Homepage', slug, sections: [] });
    }

    const device = (req.headers['x-device-type'] || 'all').toLowerCase();

    const sections = (page.sections || [])
      .filter((section) => {
        if (!section.active) return false;
        if (section.device && section.device !== 'all' && section.device !== device) return false;
        if (section.startDate && now < section.startDate) return false;
        if (section.endDate && now > section.endDate) return false;
        if (!section.blocks || !section.blocks.length) return false;
        return true;
      })
      .map((section) => ({
        _id: section._id,
        type: section.type,
        layoutType: section.layoutType,
        rows: section.rows,
        columns: section.columns,
        title: section.title,
        order: section.order,
        settings: section.settings,
        blocks: (section.blocks || []).map((block) => ({
          _id: block._id,
          order: block.order,
          data: block.data,
        })),
      }));

    res.json({
      _id: page._id,
      name: page.name,
      slug: page.slug,
      sections,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
