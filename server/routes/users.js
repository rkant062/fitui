const express = require('express');
const User = require('../models/User');
const Blog = require('../models/Blog');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user's own profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('likedPosts', 'title slug featuredImage category')
      .populate('savedPosts', 'title slug featuredImage category')
      .lean();

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      avatar,
      readingPreferences,
      authorProfile
    } = req.body;

    const updates = {};
    
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (readingPreferences) updates.readingPreferences = readingPreferences;
    if (authorProfile) updates.authorProfile = authorProfile;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/my-blogs
// @desc    Get user's own blogs
// @access  Private
router.get('/my-blogs', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { author: req.user._id };
    if (status) query.status = status;

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Blog.countDocuments(query);

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
    console.error('Get my blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/save/:blogId
// @desc    Save/unsave a blog
// @access  Private
router.post('/save/:blogId', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const isSaved = req.user.savedPosts.includes(req.params.blogId);
    
    if (isSaved) {
      // Remove from saved
      req.user.savedPosts = req.user.savedPosts.filter(id => id.toString() !== req.params.blogId);
    } else {
      // Add to saved
      req.user.savedPosts.push(req.params.blogId);
    }

    await req.user.save();

    res.json({
      message: isSaved ? 'Blog removed from saved' : 'Blog saved',
      savedCount: req.user.savedPosts.length
    });
  } catch (error) {
    console.error('Save blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/saved
// @desc    Get user's saved blogs
// @access  Private
router.get('/saved', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedPosts',
        options: {
          skip,
          limit: parseInt(limit),
          sort: { createdAt: -1 }
        }
      });

    const total = user.savedPosts.length;

    res.json({
      blogs: user.savedPosts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + user.savedPosts.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get saved blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/liked
// @desc    Get user's liked blogs
// @access  Private
router.get('/liked', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'likedPosts',
        options: {
          skip,
          limit: parseInt(limit),
          sort: { createdAt: -1 }
        }
      });

    const total = user.likedPosts.length;

    res.json({
      blogs: user.likedPosts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + user.likedPosts.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get liked blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:username
// @desc    Get public user profile
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's published blogs
    const blogs = await Blog.find({
      author: user._id,
      status: 'published'
    })
    .select('title slug excerpt featuredImage category publishedAt views likes')
    .sort({ publishedAt: -1 })
    .limit(6)
    .lean();

    res.json({
      user,
      blogs
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/admin/all
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/admin/all', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + users.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/admin/:id/role
// @desc    Update user role (admin only)
// @access  Private (Admin only)
router.put('/admin/:id/role', auth, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'author', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 