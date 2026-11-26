const mongoose = require('mongoose');

const multilingualTextSchema = new mongoose.Schema(
  {
    en: {
      type: String,
      required: [true, 'English content is required'],
      trim: true,
    },
    hi: {
      type: String,
      required: [true, 'Hindi content is required'],
      trim: true,
    },
    pa: {
      type: String,
      required: [true, 'Punjabi content is required'],
      trim: true,
    },
  },
  { _id: false }
);

const governmentOrderSchema = new mongoose.Schema(
  {
    title: {
      type: multilingualTextSchema,
      required: true,
    },
    description: {
      type: multilingualTextSchema,
      required: true,
    },
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    pdfUrl: {
      type: String,
      default: '',
      trim: true,
    },
    pdfPublicId: {
      type: String,
      default: '',
      trim: true,
    },
    pdfOriginalName: {
      type: String,
      default: '',
      trim: true,
    },
    pdfSize: {
      type: Number,
      default: 0,
    },
    publicationDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for multilingual search
governmentOrderSchema.index({
  'title.en': 'text',
  'title.hi': 'text',
  'title.pa': 'text',
  'description.en': 'text',
  'description.hi': 'text',
  'description.pa': 'text',
  orderNumber: 'text',
});

module.exports = mongoose.model('GovernmentOrder', governmentOrderSchema);
