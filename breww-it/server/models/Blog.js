const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 300,
    default: ''
  },
  category: {
    type: String,
    enum: [
      'travel', 'tech', 'trivia',
      'Coffee & Culture', 'Mind Brew', 'Local Roasts', 
      'Breww Wanderer', 'Creator\'s Corner', 'Start Something'
    ],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  featuredImage: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  brewMood: {
    type: String,
    enum: ['Cold Brew', 'Rainy Day', 'Jazz', 'Morning Energy', 'Chill', 'Focused', 'Creative'],
    default: ''
  },
  pairsWellWith: {
    type: String,
    enum: ['Lo-fi', 'Travel', 'Short Reads', 'Deep Thoughts', 'Work', 'Study', 'Relaxation'],
    default: ''
  },
  isNewPost: {
    type: Boolean,
    default: false
  },
  engagementCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected', 'archived'],
    default: 'draft'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  isDemoContent: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number,
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug from title
blogSchema.pre('save', function(next) {
  // Only generate slug if title exists and slug is not already set
  if (!this.title || this.slug) {
    return next();
  }
  
  // Generate base slug from title
  let baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // If slug is empty, use a default
  if (!baseSlug) {
    baseSlug = 'blog-post';
  }
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  this.slug = `${baseSlug}-${timestamp}`;
  
  next();
});

// Calculate read time and word count before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate word count
    const words = this.content.trim().split(/\s+/).filter(word => word.length > 0);
    this.wordCount = words.length;
    
    // Calculate read time (average reading speed: 200-250 words per minute)
    // Using 225 words per minute as a good average
    const wordsPerMinute = 225;
    this.readTime = Math.ceil(this.wordCount / wordsPerMinute);
    
    // Ensure minimum read time of 1 minute
    if (this.readTime < 1) {
      this.readTime = 1;
    }
  }
  
  next();
});

// Virtual for full name
blogSchema.virtual('authorName').get(function() {
  return this.author ? `${this.author.firstName} ${this.author.lastName}` : '';
});

// Ensure virtual fields are serialized
blogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema); 