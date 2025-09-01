const express = require('express');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { auth, authorAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/blogs/seed
// @desc    Seed database with sample data (development only)
// @access  Public (for development)
router.post('/seed', async (req, res) => {
  try {
    // Only allow seeding in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Seeding not allowed in production' });
    }

    // Check if we already have blogs
    const existingBlogs = await Blog.countDocuments();
    if (existingBlogs > 0) {
      return res.json({ message: 'Database already has content' });
    }

    // Create a sample user if none exists
    let sampleUser = await User.findOne({ username: 'brewwread' });
    if (!sampleUser) {
      sampleUser = new User({
        firstName: 'The',
        lastName: 'Team',
        username: 'brewwread',
        email: 'team@brewwread.com',
        password: 'password123', // This will be hashed by the pre-save middleware
        role: 'author'
      });
      await sampleUser.save();
    }

    // Create sample blogs
    const sampleBlogs = [
      {
        title: 'Welcome to breww&read!',
        slug: 'welcome-to-breww-read',
        content: 'Welcome to our cozy corner of the internet! We\'re brewing up amazing stories about coffee culture, travel, tech, and lifestyle. Join our community of writers and readers as we explore the world one cup at a time.',
        excerpt: 'Welcome to our cozy corner of the internet! We\'re brewing up amazing stories about coffee culture, travel, tech, and lifestyle.',
        category: 'Coffee & Culture',
        author: sampleUser._id,
        tags: ['Welcome', 'Coffee', 'Community'],
        brewMood: 'Morning Energy',
        pairsWellWith: 'Short Reads',
        isFeatured: true,
        status: 'published',
        views: 100,
        readTime: 2,
        wordCount: 400
      },
      {
        title: 'The Art of Pour-Over: A Morning Ritual',
        slug: 'art-of-pour-over-morning-ritual',
        content: 'There\'s something magical about the pour-over method. The slow, deliberate process of pouring hot water over freshly ground coffee beans creates not just a beverage, but a moment of mindfulness in our busy lives. Each pour is an opportunity to pause, breathe, and appreciate the simple pleasures that make life beautiful.',
        excerpt: 'Discover the meditative practice of pour-over coffee and how it transforms your morning routine.',
        category: 'Coffee & Culture',
        author: sampleUser._id,
        tags: ['Coffee', 'Pour-Over', 'Morning Ritual', 'Mindfulness'],
        brewMood: 'Morning Energy',
        pairsWellWith: 'Deep Thoughts',
        isFeatured: true,
        status: 'published',
        views: 150,
        readTime: 3,
        wordCount: 600
      }
    ];

    for (const blogData of sampleBlogs) {
      const blog = new Blog(blogData);
      await blog.save();
    }

    res.json({ 
      message: 'Sample data seeded successfully',
      blogsCreated: sampleBlogs.length,
      userCreated: sampleUser ? 'Yes' : 'No'
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed database' });
  }
});

// @route   GET /api/blogs
// @desc    Get all published blogs with pagination and filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, author } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { status: 'published' };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (author) {
      query.author = author;
    }

    // Get blogs with author info
    const blogs = await Blog.find(query)
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      blogs,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        totalDocs: total
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/weekly-brew
// @desc    Get this week's brew content
// @access  Public
router.get('/weekly-brew', async (req, res) => {
  try {
    // Get featured article from this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    let featuredArticle = await Blog.findOne({
      status: 'published',
      createdAt: { $gte: oneWeekAgo },
      isFeatured: true
    })
    .populate('author', 'firstName lastName username avatar')
    .sort({ createdAt: -1 });

    // If no featured article from this week, get most popular from this week
    if (!featuredArticle) {
      featuredArticle = await Blog.findOne({
        status: 'published',
        createdAt: { $gte: oneWeekAgo }
      })
      .populate('author', 'firstName lastName username avatar')
      .sort({ views: -1 });
    }

    // If still no article from this week, get any recent featured article
    if (!featuredArticle) {
      featuredArticle = await Blog.findOne({
        status: 'published',
        isFeatured: true
      })
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 });
    }

    // If still no featured article, get the most recent published article
    if (!featuredArticle) {
      featuredArticle = await Blog.findOne({
        status: 'published'
      })
      .populate('author', 'firstName lastName username avatar')
      .sort({ createdAt: -1 });
    }

    // If no articles exist at all, create a placeholder
    if (!featuredArticle) {
      featuredArticle = {
        _id: 'placeholder',
        title: "Welcome to breww&read!",
        slug: "welcome-to-breww-read",
        excerpt: "We're brewing up some amazing content for you. Check back soon for our first stories!",
        category: "Coffee & Culture",
        author: {
          firstName: "The",
          lastName: "Team",
          username: "brewwread",
          avatar: ""
        },
        createdAt: new Date(),
        isPlaceholder: true
      };
    }

    // Hollow Coves playlist data
    const weeklyBrew = {
      featuredArticle,
      musicPlaylist: {
        title: "Coffee Vibes by Hollow Coves",
        description: "Perfect soundtrack for your coffee moments",
        artist: "Hollow Coves",
        tracks: [
          {
            title: "Coastline",
            duration: "3:54",
            mood: "Chill",
            description: "Perfect for a peaceful morning brew"
          },
          {
            title: "The Woods",
            duration: "3:59",
            mood: "Focused",
            description: "Ideal for deep reading sessions"
          },
          {
            title: "Blessings",
            duration: "3:25",
            mood: "Morning Energy",
            description: "Start your day with gratitude"
          },
          {
            title: "Home",
            duration: "3:18",
            mood: "Chill",
            description: "Cozy vibes for your reading nook"
          }
        ]
      },
      nearbyCafes: [
        {
          name: "Blue Bottle Coffee",
          address: "123 Main St, Downtown",
          distance: "0.3 km",
          rating: 4.8,
          specialties: ["Single Origin", "Cold Brew", "Pastries"],
          hours: "6:00 AM - 7:00 PM",
          vibe: "Modern & Minimalist"
        },
        {
          name: "The Roasted Bean",
          address: "456 Arts District Blvd",
          distance: "0.7 km", 
          rating: 4.6,
          specialties: ["Artisan Roasts", "Espresso", "Local Pastries"],
          hours: "7:00 AM - 6:00 PM",
          vibe: "Cozy & Artistic"
        },
        {
          name: "Café Mornings",
          address: "789 Riverside Ave",
          distance: "1.2 km",
          rating: 4.5,
          specialties: ["Pour Over", "Breakfast", "WiFi Friendly"],
          hours: "6:30 AM - 8:00 PM", 
          vibe: "Work-Friendly"
        },
        {
          name: "Brew & Books",
          address: "321 Library Square",
          distance: "1.8 km",
          rating: 4.7,
          specialties: ["Reading Nook", "Quiet Space", "Book Pairings"],
          hours: "8:00 AM - 9:00 PM",
          vibe: "Quiet & Literary"
        }
      ],
      cafeSpotlight: {
        name: "Blue Bottle Coffee",
        address: "123 Main St, Downtown",
        distance: "0.3 km",
        rating: 4.8,
        specialties: ["Single Origin", "Cold Brew", "Pastries"],
        hours: "6:00 AM - 7:00 PM",
        vibe: "Modern & Minimalist",
        description: "A modern coffee experience with single-origin beans and minimalist design"
      }
    };

    res.json(weeklyBrew);
  } catch (error) {
    console.error('Get weekly brew error:', error);
    
    // Return a fallback response even if there's an error
    const fallbackBrew = {
      featuredArticle: {
        _id: 'fallback',
        title: "Welcome to breww&read!",
        slug: "welcome-to-breww-read",
        excerpt: "We're brewing up some amazing content for you. Check back soon for our first stories!",
        category: "Coffee & Culture",
        author: {
          firstName: "The",
          lastName: "Team",
          username: "brewwread",
          avatar: ""
        },
        createdAt: new Date(),
        isPlaceholder: true
      },
      musicPlaylist: {
        title: "Coffee Vibes by Hollow Coves",
        description: "Perfect soundtrack for your coffee moments",
        artist: "Hollow Coves",
        tracks: [
          {
            title: "Coastline",
            duration: "3:54",
            mood: "Chill",
            description: "Perfect for a peaceful morning brew"
          },
          {
            title: "The Woods",
            duration: "3:59",
            mood: "Focused",
            description: "Ideal for deep reading sessions"
          }
        ]
      },
      cafeSpotlight: {
        name: "The Roasted Bean",
        location: "Downtown Arts District",
        description: "A cozy spot known for their single-origin brews and artisan pastries"
      }
    };

    res.json(fallbackBrew);
  }
});

// @route   GET /api/blogs/featured
// @desc    Get featured blogs
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const featured = await Blog.find({ 
      status: 'published', 
      isFeatured: true 
    })
    .populate('author', 'firstName lastName username avatar')
    .sort({ createdAt: -1 })
    .limit(6);

    res.json({ featured });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/admin/pending
// @desc    Get pending blogs for admin review
// @access  Private (Admin only)
router.get('/admin/pending', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

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

// @route   GET /api/blogs/admin/:id
// @desc    Get blog by ID for admin review (any status)
// @access  Private (Admin only)
router.get('/admin/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    
    const blog = await Blog.findById(id)
      .populate('author', 'firstName lastName username email bio');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Get admin blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/blogs/:id/approve
// @desc    Approve a blog
// @access  Private (Admin only)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'published',
        publishedAt: new Date()
      },
      { new: true }
    ).populate('author', 'firstName lastName username email');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({
      message: 'Blog approved successfully',
      blog
    });
  } catch (error) {
    console.error('Approve blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/blogs/:id/reject
// @desc    Reject a blog
// @access  Private (Admin only)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('author', 'firstName lastName username email');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({
      message: 'Blog rejected successfully',
      blog
    });
  } catch (error) {
    console.error('Reject blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/blogs/admin/:id/approve
// @desc    Approve or reject a blog
// @access  Private (Admin only)
router.put('/admin/:id/approve', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

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
    ).populate('author', 'firstName lastName username email');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({
      message: `Blog ${status}`,
      blog
    });
  } catch (error) {
    console.error('Approve blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get blog by slug
// @access  Public (published blogs) / Private (admins can view any status)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Build query based on user role
    const query = { slug };
    
    // Check if user is authenticated and is admin
    let isAdmin = false;
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId).select('-password');
        isAdmin = user && user.role === 'admin';
      }
    } catch (error) {
      // Token is invalid, treat as unauthenticated
      isAdmin = false;
    }
    
    // If user is not admin, only show published blogs
    if (!isAdmin) {
      query.status = 'published';
    }
    
    const blog = await Blog.findOne(query).populate('author', 'firstName lastName username avatar bio');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Only increment views for published blogs
    if (blog.status === 'published') {
      blog.views += 1;
      await blog.save();
    }

    res.json(blog);
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/blogs/:id/engage
// @desc    Add engagement (Pour Some Love)
// @access  Private
router.post('/:id/engage', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment engagement count
    blog.engagementCount += 1;
    await blog.save();

    res.json({ 
      message: 'Thanks for pouring some love! ☕️',
      engagementCount: blog.engagementCount 
    });
  } catch (error) {
    console.error('Engagement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/blogs/:id/like
// @desc    Like/unlike a blog
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const userId = req.user._id.toString();
    const likeIndex = blog.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      blog.likes.splice(likeIndex, 1);
    } else {
      // Like
      blog.likes.push(userId);
    }

    await blog.save();

    res.json({ likes: blog.likes });
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
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = {
      user: req.user._id,
      content: content.trim(),
      createdAt: new Date()
    };

    blog.comments.push(comment);
    await blog.save();

    // Populate the new comment with user info
    const populatedBlog = await Blog.findById(id)
      .populate('comments.user', 'firstName lastName username avatar');

    res.json({ comments: populatedBlog.comments });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog
// @access  Private (Any authenticated user)
router.post('/', auth, async (req, res) => {
  try {
    const { 
      title, 
      content, 
      category, 
      excerpt, 
      tags, 
      featuredImage, 
      metaTitle, 
      metaDescription,
      isPrivate,
      status 
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const validCategories = [
      'travel', 'tech', 'trivia',
      'Coffee & Culture', 'Mind Brew', 'Local Roasts', 
      'Breww Wanderer', 'Creator\'s Corner', 'Start Something'
    ];
    
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ message: 'Valid category is required' });
    }

    // Determine status based on isPrivate and user role
    let finalStatus = status || 'draft';
    if (!isPrivate && req.user.role !== 'admin') {
      finalStatus = 'pending'; // Public posts from any user (non-admin) go to pending
    } else if (isPrivate) {
      finalStatus = 'draft'; // Private posts stay as draft
    } else if (req.user.role === 'admin') {
      finalStatus = 'published'; // Admins can publish directly
    }

    // Generate slug from title
    const generateSlug = (title) => {
      let baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      
      if (!baseSlug) {
        baseSlug = 'blog-post';
      }
      
      const timestamp = Date.now();
      return `${baseSlug}-${timestamp}`;
    };

    const blog = new Blog({
      title: title.trim(),
      slug: generateSlug(title.trim()),
      content: content.trim(),
      category,
      excerpt: excerpt || '',
      tags: tags || [],
      featuredImage: featuredImage || '',
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      isPrivate: isPrivate || false,
      status: finalStatus,
      author: req.user._id
    });

    await blog.save();

    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'firstName lastName username avatar');

    const message = isPrivate 
      ? 'Blog saved as draft successfully' 
      : req.user.role === 'admin' 
        ? 'Blog published successfully' 
        : 'Blog submitted for review successfully';

    res.status(201).json({
      message,
      blog: populatedBlog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog
// @access  Private (Author or Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName username avatar');

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
// @access  Private (Author or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Blog.findByIdAndDelete(id);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/blogs/trending-news
// @desc    Get trending worldwide news articles
// @access  Public
router.get('/trending-news', async (req, res) => {
  try {
    // Mock trending news data - in production, you'd fetch from a real news API
    const trendingNews = [
      {
        id: 1,
        title: "Global Coffee Prices Hit Record High Amid Climate Challenges",
        summary: "Coffee farmers worldwide face unprecedented challenges as climate change affects harvests and global demand continues to rise.",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=300&fit=crop",
        source: "Coffee Daily",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        category: "Agriculture",
        readTime: "3 min read",
        trendingScore: 95
      },
      {
        id: 2,
        title: "Third Wave Coffee Movement Transforms Urban Culture",
        summary: "Artisanal coffee shops are reshaping city landscapes and creating new social spaces for communities worldwide.",
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop",
        source: "Urban Brew",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        category: "Culture",
        readTime: "4 min read",
        trendingScore: 88
      },
      {
        id: 3,
        title: "Sustainable Coffee Farming Practices Gain Global Support",
        summary: "New initiatives promote eco-friendly coffee production methods that benefit both farmers and the environment.",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop",
        source: "Green Coffee",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        category: "Sustainability",
        readTime: "5 min read",
        trendingScore: 82
      },
      {
        id: 4,
        title: "Coffee Technology Revolution: Smart Brewing Goes Mainstream",
        summary: "AI-powered coffee machines and precision brewing tools are making professional-quality coffee accessible to everyone.",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
        source: "Tech Brew",
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        category: "Technology",
        readTime: "6 min read",
        trendingScore: 79
      },
      {
        id: 5,
        title: "Coffee Shop Chains Adapt to Post-Pandemic Work Culture",
        summary: "Major coffee retailers are redesigning spaces to accommodate the new hybrid work environment and remote workers.",
        image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=300&fit=crop",
        source: "Business Brew",
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
        category: "Business",
        readTime: "4 min read",
        trendingScore: 75
      }
    ];

    // Sort by trending score (highest first)
    const sortedNews = trendingNews.sort((a, b) => b.trendingScore - a.trendingScore);

    res.json({
      success: true,
      data: sortedNews,
      total: sortedNews.length,
      lastUpdated: new Date()
    });

  } catch (error) {
    console.error('Trending news error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch trending news',
      error: error.message 
    });
  }
});

module.exports = router; 