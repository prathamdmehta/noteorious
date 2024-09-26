const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ensureAuthenticated } = require('../helpers/routeHelpers');
const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;
const { isAuthenticated } = require('../helpers/authMiddleware'); // Correct import
const { createPDF } = require('../helpers/routeHelpers'); // Import createPDF function

/**
 * Middleware to check authentication
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // or however you're managing tokens

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Verify the token and get the user ID
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Assuming you have a way to find the user by ID
    User.findById(decoded.userId)
      .then(user => {
        if (!user) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user; // Set the user object on the request
        next(); // Proceed to the next middleware or route handler
      })
      .catch(err => {
        console.log(err);
        return res.status(500).send('Internal Server Error');
      });
  });
};


/**
 * GET /
 * Admin - Login Page
 */
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: 'Admin',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
      currentRoute: req.path,
    };
    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * POST /
 * Admin - Check Login
 */
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });
    req.session.username = user.username; // Store username in session
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /
 * Admin Dashboard
 */
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
      const locals = {
          title: 'Dashboard',
          description: 'Simple Blog created with NodeJs, Express & MongoDb.',
          currentRoute: req.path,
          user: req.user, // Assuming req.user contains user details after authentication
      };
      const posts = await Post.find({ userId: req.userId }).sort({ createdAt: -1 });
      res.render('admin/dashboard', { locals, posts, layout: adminLayout });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /
 * Admin - Create New Post
 */
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.',
      currentRoute: req.path,
    };
    res.render('admin/add-post', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * POST /
 * Admin - Create New Post
 */
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
      userId: req.userId,
    });
    await Post.create(newPost);
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /
 * Admin - Edit Post
 */
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Edit Post',
      description: 'Free NodeJs User Management System',
      currentRoute: req.path,
    };
    const post = await Post.findOne({ _id: req.params.id, userId: req.userId });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.render('admin/edit-post', { locals, post, layout: adminLayout });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * PUT /
 * Admin - Update Post
 */
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now(),
      },
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * DELETE /
 * Admin - Delete Post
 */
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * PUT /
 * Admin - Pin Post
 */
router.put('/pin-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { pinned: true });
    res.redirect('/dashboard'); // Redirect to your desired route
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

/**
 * PUT /
 * Admin - Unpin Post
 */
router.put('/unpin-post/:id', authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { pinned: false });
    res.redirect('/dashboard'); // Redirect to your desired route
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

/**
 * GET /
 * Admin - Generate PDF for Post
 */
router.get('/notes/:id/pdf', async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);

      if (!post) {
          return res.status(404).send('Note not found');
      }

      res.setHeader('Content-disposition', 'attachment; filename=' + post.title + '.pdf');
      res.setHeader('Content-type', 'application/pdf');

      createPDF(post.body, post.title, res);
  } catch (err) {
      res.status(500).send(err.toString());
  }
});

router.post('/pin-post/:postId', async (req, res) => {
  const postId = req.params.postId;

  try {
    // Logic to update the post's pinned status in the database
    const updatedPost = await Post.findByIdAndUpdate(postId, { pinned: true }, { new: true });

    if (!updatedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({ success: true, message: 'Post pinned successfully', post: updatedPost });
  } catch (error) {
    console.error('Error pinning post:', error);
    res.status(500).json({ success: false, message: 'Failed to pin the post', error: error.message });
  }
});

/**
 * POST /
 * Admin - Register
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
      // Check if the user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(409).json({ message: 'Username already in use' });
      }

      // Hash the password and create the user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, password: hashedPassword });

      res.status(201).json({ message: 'User Created', user });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
}); 



/**
 * GET /
 * Admin - To-Do List
 */
router.get('/todo', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'To-Do List',
      description: 'Manage your tasks.',
      currentRoute: req.path,
    };
    // Example: Fetch to-do list items from database or render an empty list
    const todoItems = []; // Replace with logic to fetch to-do items
    res.render('admin/to-do', { locals, todoItems, layout: adminLayout });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /
 * Admin - Profile List
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Pagination setup
    const page = parseInt(req.query.page) || 1; // Current page
    const limit = 5; // Number of posts per page
    const skip = (page - 1) * limit; // Number of posts to skip
    const totalPosts = await Post.countDocuments({ userId: req.user._id }); // Total posts
    const userPosts = await Post.find({ userId: req.user._id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Fetch posts for the current page

    // Calculate next and previous pages
    const nextPage = (skip + limit < totalPosts) ? page + 1 : null; // Calculate next page
    const prevPage = (page > 1) ? page - 1 : null; // Calculate previous page

    // Pass variables directly to the template
    res.render('admin/profile', {
      title: 'Profile',
      description: 'User Profile Page',
      currentRoute: req.path,
      userPosts,
      nextPage,
      prevPage,
      totalPosts,
      layout: adminLayout // Ensure you're specifying the layout correctly
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/draw', (req, res) => {
  res.render('admin/draw', { currentRoute: req.path });
});





/**
 * GET /
 * Admin Logout
 */
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

module.exports = router;
