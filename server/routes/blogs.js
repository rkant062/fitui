const express = require('express');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/blogs
// @desc    Get all published blogs with pagination and filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = 'publishedAt',
      order = 'desc'
    } = req.query;

    const query = { status: 'published' };

    // Category filter
    if (category && ['travel', 'tech', 'trivia'].includes(category)) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sortObj = { [sort]: order === 'desc' ? -1 : 1 };

    const blogs = await Blog.find(query)
      .populate('author', 'firstName lastName username avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Blog.countDocuments(query);

    // Add engagement data for authenticated users
    if (req.user) {
      blogs.forEach(blog => {
        blog.isLiked = req.user.likedPosts.includes(blog._id);
        blog.isSaved = req.user.savedPosts.includes(blog._id);
      });
    }

    res.json({
      blogs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + blogs.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/featured
// @desc    Get featured blogs for homepage
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featured = await Blog.find({ status: 'published' })
      .populate('author', 'firstName lastName username avatar')
      .sort({ views: -1, publishedAt: -1 })
      .limit(6)
      .lean();

    res.json({ featured });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    })
    .populate('author', 'firstName lastName username avatar bio authorProfile')
    .populate('comments.user', 'firstName lastName username avatar')
    .lean();

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    // Add engagement data for authenticated users
    if (req.user) {
      blog.isLiked = req.user.likedPosts.includes(blog._id);
      blog.isSaved = req.user.savedPosts.includes(blog._id);
    }

    // Get related blogs
    const related = await Blog.find({
      category: blog.category,
      _id: { $ne: blog._id },
      status: 'published'
    })
    .populate('author', 'firstName lastName username')
    .limit(3)
    .lean();

    res.json({ blog, related });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog
// @access  Private
router.post('/', auth, authorize('user', 'author', 'admin'), async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      category,
      tags,
      featuredImage,
      metaTitle,
      metaDescription,
      keywords
    } = req.body;

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Check if slug exists
    let slug = baseSlug;
    let counter = 1;
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      author: req.user._id,
      category,
      tags: tags || [],
      featuredImage,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      keywords: keywords || [],
      status: req.user.role === 'admin' ? 'published' : 'pending'
    });

    await blog.save();

    // Update author's post count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'authorProfile.totalPosts': 1 }
    });

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user can edit this blog
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    
    // Only admins can change status
    if (updates.status && req.user.role !== 'admin') {
      delete updates.status;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user can delete this blog
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    // Update author's post count
    await User.findByIdAndUpdate(blog.author, {
      $inc: { 'authorProfile.totalPosts': -1 }
    });

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/blogs/:id/like
// @desc    Like/unlike a blog
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const isLiked = blog.likes.includes(req.user._id);
    
    if (isLiked) {
      // Unlike
      blog.likes = blog.likes.filter(id => id.toString() !== req.user._id.toString());
      req.user.likedPosts = req.user.likedPosts.filter(id => id.toString() !== req.params.id);
    } else {
      // Like
      blog.likes.push(req.user._id);
      req.user.likedPosts.push(req.params.id);
    }

    await Promise.all([blog.save(), req.user.save()]);

    res.json({
      message: isLiked ? 'Blog unliked' : 'Blog liked',
      likes: blog.likes.length
    });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/blogs/:id/comment
// @desc    Add a comment to a blog
// @access  Private
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.comments.push({
      user: req.user._id,
      content
    });

    await blog.save();

    // Populate the new comment
    const updatedBlog = await Blog.findById(req.params.id)
      .populate('comments.user', 'firstName lastName username avatar');

    const newComment = updatedBlog.comments[updatedBlog.comments.length - 1];

    res.json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/blogs/:id/share
// @desc    Increment share count
// @access  Public
router.post('/:id/share', async (req, res) => {
  try {
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } });
    res.json({ message: 'Share count updated' });
  } catch (error) {
    console.error('Share blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/admin/pending
// @desc    Get pending blogs for admin review
// @access  Private (Admin only)
router.get('/admin/pending', auth, authorize('admin'), async (req, res) => {
  try {
    const pending = await Blog.find({ status: 'pending' })
      .populate('author', 'firstName lastName username email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ pending });
  } catch (error) {
    console.error('Get pending blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/blogs/admin/:id/approve
// @desc    Approve or reject a blog
// @access  Private (Admin only)
router.put('/admin/:id/approve', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    if (!['published', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { status };
    
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      message: `Blog ${status}`,
      blog
    });
  } catch (error) {
    console.error('Approve blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 