const GovernmentOrder = require('../models/GovernmentOrder');
const { uploadPDFDocument, deletePDFDocument } = require('../services/cloudinaryService');
const { emitNewOrder, emitOrderUpdated, emitOrderDeleted } = require('../socket');

/**
 * Helper to parse multilingual JSON strings if sent as multipart form-data
 */
const parseMultilingual = (field) => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      return { en: field, hi: field, pa: field };
    }
  }
  return field;
};

// ==========================================
// PUBLIC USER CONTROLLERS
// ==========================================

/**
 * @route   GET /api/orders
 * @desc    Get published government orders with search, filters, and pagination
 * @access  Public
 */
const getPublicOrders = async (req, res) => {
  try {
    const {
      search = '',
      department = '',
      category = '',
      startDate = '',
      endDate = '',
      page = 1,
      limit = 10,
      sortBy = 'publicationDate',
      sortOrder = 'desc',
    } = req.query;

    const query = { status: 'published' };

    // Multilingual Search across English, Hindi, Punjabi, and Order Number
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { 'title.en': searchRegex },
        { 'title.hi': searchRegex },
        { 'title.pa': searchRegex },
        { 'description.en': searchRegex },
        { 'description.hi': searchRegex },
        { 'description.pa': searchRegex },
        { orderNumber: searchRegex },
      ];
    }

    // Department Filter
    if (department && department !== 'all') {
      query.department = department;
    }

    // Category Filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Date Range Filter
    if (startDate || endDate) {
      query.publicationDate = {};
      if (startDate) {
        query.publicationDate.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.publicationDate.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [orders, totalOrders] = await Promise.all([
      GovernmentOrder.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      GovernmentOrder.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalOrders / limitNum);

    res.json({
      success: true,
      count: orders.length,
      totalOrders,
      currentPage: pageNum,
      totalPages: totalPages || 1,
      orders,
    });
  } catch (error) {
    console.error('[getPublicOrders Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve government orders.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get single published government order details
 * @access  Public
 */
const getPublicOrderById = async (req, res) => {
  try {
    const order = await GovernmentOrder.findOne({
      _id: req.params.id,
      status: 'published',
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Government order not found or not currently published.',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/orders/meta/departments
 * @desc    Get list of unique departments
 * @access  Public
 */
const getDepartments = async (req, res) => {
  try {
    const departments = await GovernmentOrder.distinct('department', { status: 'published' });
    res.json({
      success: true,
      departments: departments.sort(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch departments' });
  }
};

/**
 * @route   GET /api/orders/meta/categories
 * @desc    Get list of unique categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const categories = await GovernmentOrder.distinct('category', { status: 'published' });
    res.json({
      success: true,
      categories: categories.sort(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not fetch categories' });
  }
};

// ==========================================
// ADMIN CONTROLLERS (PROTECTED)
// ==========================================

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders (draft + published) with management filters
 * @access  Private (Admin)
 */
const getAllOrdersAdmin = async (req, res) => {
  try {
    const {
      search = '',
      department = '',
      category = '',
      status = 'all',
      page = 1,
      limit = 15,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { 'title.en': searchRegex },
        { 'title.hi': searchRegex },
        { 'title.pa': searchRegex },
        { orderNumber: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [orders, totalOrders] = await Promise.all([
      GovernmentOrder.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .lean(),
      GovernmentOrder.countDocuments(query),
    ]);

    res.json({
      success: true,
      totalOrders,
      currentPage: pageNum,
      totalPages: Math.ceil(totalOrders / limitNum) || 1,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch administrative orders.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get order by ID for editing
 * @access  Private (Admin)
 */
const getOrderByIdAdmin = async (req, res) => {
  try {
    const order = await GovernmentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }
    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order details.',
    });
  }
};

/**
 * @route   POST /api/admin/orders
 * @desc    Create a new government order with multilingual text and optional PDF
 * @access  Private (Admin)
 */
const createOrder = async (req, res) => {
  try {
    const title = parseMultilingual(req.body.title);
    const description = parseMultilingual(req.body.description);
    const { orderNumber, department, category, publicationDate, status = 'draft' } = req.body;

    // Validate required fields
    if (!title?.en || !title?.hi || !title?.pa) {
      return res.status(400).json({
        success: false,
        message: 'Order title is required in all three languages: English, Hindi, and Punjabi.',
      });
    }

    if (!description?.en || !description?.hi || !description?.pa) {
      return res.status(400).json({
        success: false,
        message: 'Order description is required in all three languages: English, Hindi, and Punjabi.',
      });
    }

    if (!orderNumber || !department || !category) {
      return res.status(400).json({
        success: false,
        message: 'Order Number, Department, and Category are mandatory fields.',
      });
    }

    // Check unique order number
    const existing = await GovernmentOrder.findOne({ orderNumber: orderNumber.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An order with number "${orderNumber}" already exists in the records.`,
      });
    }

    let pdfData = {
      pdfUrl: '',
      pdfPublicId: '',
      pdfOriginalName: '',
      pdfSize: 0,
    };

    // If PDF file is attached
    if (req.file) {
      const uploadResult = await uploadPDFDocument(req.file.buffer, req.file.originalname);
      pdfData = {
        pdfUrl: uploadResult.url,
        pdfPublicId: uploadResult.publicId,
        pdfOriginalName: req.file.originalname,
        pdfSize: uploadResult.size,
      };
    }

    const newOrder = await GovernmentOrder.create({
      title,
      description,
      orderNumber: orderNumber.trim().toUpperCase(),
      department: department.trim(),
      category: category.trim(),
      publicationDate: publicationDate ? new Date(publicationDate) : new Date(),
      status,
      pdfUrl: pdfData.pdfUrl,
      pdfPublicId: pdfData.pdfPublicId,
      pdfOriginalName: pdfData.pdfOriginalName,
      pdfSize: pdfData.pdfSize,
      createdBy: req.admin._id,
    });

    // Real-Time Socket Notification if published immediately
    if (newOrder.status === 'published') {
      emitNewOrder(newOrder);
    }

    res.status(201).json({
      success: true,
      message: `Government order ${newOrder.orderNumber} created successfully.`,
      order: newOrder,
    });
  } catch (error) {
    console.error('[createOrder Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create government order.',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/admin/orders/:id
 * @desc    Update existing government order & PDF
 * @access  Private (Admin)
 */
const updateOrder = async (req, res) => {
  try {
    const order = await GovernmentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Government order not found for update.',
      });
    }

    const title = req.body.title ? parseMultilingual(req.body.title) : order.title;
    const description = req.body.description ? parseMultilingual(req.body.description) : order.description;
    const { orderNumber, department, category, publicationDate, status } = req.body;

    // Check unique order number if changed
    if (orderNumber && orderNumber.trim().toUpperCase() !== order.orderNumber) {
      const exists = await GovernmentOrder.findOne({
        orderNumber: orderNumber.trim().toUpperCase(),
        _id: { $ne: order._id },
      });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: `Order number "${orderNumber}" is already in use by another record.`,
        });
      }
      order.orderNumber = orderNumber.trim().toUpperCase();
    }

    if (title) order.title = title;
    if (description) order.description = description;
    if (department) order.department = department.trim();
    if (category) order.category = category.trim();
    if (publicationDate) order.publicationDate = new Date(publicationDate);

    const oldStatus = order.status;
    if (status) order.status = status;

    // Handle new PDF upload if provided
    if (req.file) {
      // Remove old PDF if existed
      if (order.pdfPublicId) {
        await deletePDFDocument(order.pdfPublicId);
      }

      const uploadResult = await uploadPDFDocument(req.file.buffer, req.file.originalname);
      order.pdfUrl = uploadResult.url;
      order.pdfPublicId = uploadResult.publicId;
      order.pdfOriginalName = req.file.originalname;
      order.pdfSize = uploadResult.size;
    }

    const updatedOrder = await order.save();

    // Real-Time Notification Logic
    if (oldStatus === 'draft' && updatedOrder.status === 'published') {
      emitNewOrder(updatedOrder);
    } else if (updatedOrder.status === 'published') {
      emitOrderUpdated(updatedOrder);
    }

    res.json({
      success: true,
      message: `Government order ${updatedOrder.orderNumber} updated successfully.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('[updateOrder Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update government order.',
      error: error.message,
    });
  }
};

/**
 * @route   PATCH /api/admin/orders/:id/status
 * @desc    Toggle order status between published and draft
 * @access  Private (Admin)
 */
const togglePublishStatus = async (req, res) => {
  try {
    const order = await GovernmentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const previousStatus = order.status;
    order.status = previousStatus === 'published' ? 'draft' : 'published';
    await order.save();

    if (previousStatus === 'draft' && order.status === 'published') {
      emitNewOrder(order);
    } else {
      emitOrderUpdated(order);
    }

    res.json({
      success: true,
      message: `Order ${order.orderNumber} status changed to ${order.status.toUpperCase()}.`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order publication status.',
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/admin/orders/:id
 * @desc    Delete a government order & associated PDF
 * @access  Private (Admin)
 */
const deleteOrder = async (req, res) => {
  try {
    const order = await GovernmentOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    if (order.pdfPublicId) {
      await deletePDFDocument(order.pdfPublicId);
    }

    await GovernmentOrder.findByIdAndDelete(order._id);

    // Broadcast deletion event
    emitOrderDeleted(order._id);

    res.json({
      success: true,
      message: `Government order ${order.orderNumber} deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete government order.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/orders/stats/summary
 * @desc    Get dashboard metrics for administrative overview
 * @access  Private (Admin)
 */
const getOrderStats = async (req, res) => {
  try {
    const [totalOrders, publishedOrders, draftOrders, departmentStats, recentOrders] =
      await Promise.all([
        GovernmentOrder.countDocuments(),
        GovernmentOrder.countDocuments({ status: 'published' }),
        GovernmentOrder.countDocuments({ status: 'draft' }),
        GovernmentOrder.aggregate([
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        GovernmentOrder.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('orderNumber title status department publicationDate')
          .lean(),
      ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        publishedOrders,
        draftOrders,
        departmentBreakdown: departmentStats,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard statistics.',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/orders/summarize
 * @desc    Generate plain-language 3-bullet summary using Google Gemini
 * @access  Public
 */
const summarizeOrder = async (req, res) => {
  try {
    const { title, description, language = 'en' } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Order title and description are required for summarization.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return res.status(503).json({
        success: false,
        message: 'AI summary is not configured.',
      });
    }

    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

    const targetLangName =
      language === 'hi'
        ? 'Hindi in clear Devanagari script'
        : language === 'pa'
        ? 'Punjabi in clear Gurmukhi script'
        : 'clear plain English';

    const prompt = `You are a public citizen service assistant for an official government portal.
Summarize the following official government order into exactly 3 concise, highly readable, plain-language bullet points that an ordinary citizen can easily understand.
Explain:
1. What the order or scheme is about.
2. Who benefits or who is affected.
3. What key action, benefit, or guideline is mandated.

Language required: ${targetLangName}.
Return ONLY valid JSON matching this schema:
{"bullets": ["bullet point 1", "bullet point 2", "bullet point 3"]}

Title: ${title}
Description: ${description}`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    let response;
    let lastError = null;

    // Retry loop for network resiliency and transient demand spikes
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response) break;
      } catch (callErr) {
        lastError = callErr;
        console.warn(`[AI Summary] Gemini attempt ${attempt}/3 warning:`, callErr.message);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
        }
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    const responseText = response?.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (parseErr) {
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    let bullets = parsedData?.bullets || parsedData?.summary || parsedData?.points || parsedData?.bullet_points;
    if (!Array.isArray(bullets) && Array.isArray(parsedData)) {
      bullets = parsedData;
    }

    if (!Array.isArray(bullets) || bullets.length === 0) {
      throw new Error('AI returned an unexpected response format.');
    }

    return res.json({
      success: true,
      bullets: bullets.slice(0, 3).map((b) => (typeof b === 'string' ? b : JSON.stringify(b))),
      language,
    });
  } catch (err) {
    console.error('[AI Summary Error]', err.message, err.cause || '');
    let userMessage = 'Failed to generate AI plain-language summary.';
    
    // Attempt parsing Google API JSON error string if present
    try {
      if (typeof err.message === 'string' && err.message.trim().startsWith('{')) {
        const parsed = JSON.parse(err.message.trim());
        if (parsed?.error?.message) {
          userMessage = parsed.error.message;
        }
      }
    } catch (_) {}

    if (err.message && err.message.toLowerCase().includes('fetch failed')) {
      userMessage = 'Unable to connect to Google Gemini AI service. Please check your internet connection or click Try Again.';
    } else if (userMessage === 'Failed to generate AI plain-language summary.' && err.message) {
      userMessage = err.message;
    }

    return res.status(500).json({
      success: false,
      message: userMessage,
    });
  }
};

module.exports = {
  // Public
  getPublicOrders,
  getPublicOrderById,
  getDepartments,
  getCategories,
  summarizeOrder,
  // Admin
  getAllOrdersAdmin,
  getOrderByIdAdmin,
  createOrder,
  updateOrder,
  togglePublishStatus,
  deleteOrder,
  getOrderStats,
};
