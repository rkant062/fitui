const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Initialize Express
const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',  // Local development
  'https://breww.in',      // Production
  'https://www.breww.in'   // Production with www
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve React frontend
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
app.use(cookieParser());
app.use(bodyParser.json());

// MongoDB URI and connection setup
const mongoURI = 'mongodb+srv://Cluster90017:root@cluster90017.hqe5auc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster90017';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.log('Error connecting to MongoDB Atlas: ', err));

  const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    category: [{
      name: { type: String, required: true },
      budget: { type: Number, default: 0 },
    }],
    checklist: [{
        task: String,                          // 'task' - Name of the task
        completed: Boolean,                    // 'completed' - Boolean if task is marked as complete
        priority: { type: Number, default: 1 }, // 'priority' - Numeric value for sorting
      }], });
  

const User = mongoose.model('User', UserSchema);

// Define the Data Schema with checklist and priority
const DataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // user reference
  day: String,                             // 'Day' - Date or day information
  date: { type: Date },                    // 'Date' - Actual date value
  caloriesBurned: Number,                  // 'Calories Burned' - Numeric value for calories burned
  checklist: [{
    task: String,                          // 'task' - Name of the task
    completed: Boolean,                    // 'completed' - Boolean if task is marked as complete
    priority: { type: Number, default: 1 }, // 'priority' - Numeric value for sorting
  }],
});

const Data = mongoose.model('Data', DataSchema);

// Add after other schema definitions
const SharedAccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shareToken: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const SharedAccount = mongoose.model('SharedAccount', SharedAccountSchema);

// Modify ExpenseSchema to support shared accounts
const ExpenseSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: { type: String, required: true },
  sharedAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "SharedAccount" }
});

const Expense = mongoose.model('Expense', ExpenseSchema);


// Assuming you're using Express.js
const secretKey = process.env.JWT_SECRET;

app.post('/api/validate-token', (req, res) => {
  const token = req.cookies.token ||  req.headers.authorization?.split(' ')[1];; // Getting token from cookies
  console.log('Incoming token:', token);
  if (!token) {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded:', decoded);
    req.userId = decoded.userId;
  } catch (err) {
    console.error('JWT verification error:', err.message);
    res.status(400).json({ message: 'Invalid token' });
  }
  return res.json({ valid: true });
});

app.post('/api/renew-token', (req, res) => {
  const oldToken = req.cookies.token;
  if (!oldToken) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(oldToken, secretKey, { ignoreExpiration: true }, (err, decoded) => {
    if (err || !decoded.userName) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const newToken = jwt.sign(
      { userName: decoded.userName },
      secretKey,
      { expiresIn: '1d' }
    );

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ success: true });
  });
});



// API to create a new user
app.post('/api/create-user', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// API to authenticate user (login)
// API to authenticate user (login)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Send token in response
    res.json({ 
      message: 'Login successful', 
      token, 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

const verifyToken = (req, res, next) => {
  // Try to get token from Authorization header first
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : req.cookies.token;

  console.log('Verifying token:', token);
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid token.' });
  }
};


// API to upload and process the Excel file (with userId)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/upload-excel', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = xlsx.utils.sheet_to_json(sheet);

    const savedData = [];
    for (let row of excelData) {
      const newData = new Data({
        userId: req.userId,  // Store the userId from the token
        day: row.Day,
        date: new Date(row.Date),
        caloriesBurned: row['Calories Burned'],
        checklist: row.Checklist ? row.Checklist.map(task => ({
          task: task,
          completed: false, // Assuming tasks from the Excel file are not completed initially
          priority: 1, // Default priority
        })) : [],
      });

      const savedRow = await newData.save();
      savedData.push(savedRow);
    }

    res.json({ message: 'Data uploaded and saved successfully', data: savedData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing the Excel file');
  }
});

// API to add bulk data (with checklist support and userId)
app.post('/api/add-bulk-data', verifyToken, async (req, res) => {
  try {
    const dataToAdd = req.body;
    const savedData = [];

    for (let row of dataToAdd) {
      const newData = new Data({
        userId: req.userId, // Attach the userId
        day: row.day,
        date: new Date(row.date),
        caloriesBurned: row.caloriesBurned,
        checklist: row.checklist.map(task => ({
          task: task.task,
          completed: task.completed,
          priority: task.priority || 1,  // Default priority if not provided
        })),
      });

      const savedRow = await newData.save();
      savedData.push(savedRow);
    }

    res.json({ message: 'Bulk data added successfully', data: savedData });
  } catch (err) {
    res.status(500).send('Error adding bulk data');
  }
});

app.patch('/api/data/update', verifyToken, async (req, res) => {
    const { date, caloriesBurned, checklist } = req.body;
  
    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }
   console.log('Received date:', date);
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
  
      var entry = await Data.findOne({
        userId: req.userId,
        date: { $gte: startOfDay, $lte: endOfDay },
      });
  
    
      entry.caloriesBurned = parseInt(entry.caloriesBurned || 0) + parseInt(caloriesBurned || 0);
      // Update calories burned
  
      // Update checklist task completion statuses
      if (Array.isArray(checklist)) {
        const checklistMap = new Map(
          entry.checklist.map(task => [task.task.trim(), task])
        );
  
        checklist.forEach(updatedTask => {
          const taskName = updatedTask.task?.trim();
          if (!taskName) return;
  
          const existingTask = checklistMap.get(taskName);
          if (existingTask) {
            existingTask.completed = updatedTask.completed ?? existingTask.completed;
            existingTask.priority = updatedTask.priority ?? existingTask.priority;
          }
        });
      }
  
      const updated = await entry.save();
      return res.json({ message: 'Data updated successfully', data: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error updating data' });
    }
  });

  // API to fetch data for a specific user
app.get('/api/test', async (req, res) => {

      return res.json({"hi there": "hi there"});
    });

  
// API to fetch data for a specific user
app.get('/api/chart', verifyToken, async (req, res) => {
  try {
    console.log('Fetching chart data for userId:', req.userId);
    
    if (!req.userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find all entries for the user, sorted by date
    const data = await Data.find({
      userId: req.userId
    }).sort({ date: 1 });

    console.log('Found', data.length, 'entries for user');

    if (!data || data.length === 0) {
      return res.json([]); // Return empty array if no data found
    }

    return res.json(data);
  } catch (err) {
    console.error('Error fetching chart data:', err);
    return res.status(500).json({ message: 'Error fetching chart data' });
  }
});

// API to fetch data for a specific user
app.get('/api/data', verifyToken, async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
        // Find today's entry for the user
        let todayEntry = await Data.findOne({
          userId: req.userId,
          date: { $gte: startOfDay, $lte: endOfDay },
        }).sort({ date: -1 });
    
        // If entry exists, update incomplete tasks and save
        if (todayEntry && Array.isArray(todayEntry.checklist)) {
          // Filter out incomplete tasks
         // const incompleteTasks = todayEntry.checklist.filter(item => !item.completed);
          
          // Here, you can perform any additional operations like updating tasks if needed.
          // For example, if you want to update the checklist status of any task, you can add logic here:
          
          // Update checklist if needed (e.g., you could check for updated tasks from the front end).
        //   todayEntry.checklist = todayEntry.checklist.map(task => {
        //     if (task.completed === false) {
        //       // Optionally update the task status if needed
        //       // For example, if you wanted to automatically mark certain tasks as completed
        //       task.completed = true; // Mark as completed (optional logic here)
        //     }
        //     return task;
        //   });
    
          // Save the updated checklist (if modified)
         // await todayEntry.save();
    
          return res.json(todayEntry);
        }
    
        // Fallback to user's default checklist if no entry found for today
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const newData = new Data({
            userId: req.userId,  // Store the userId from the token
            day: today.toLocaleDateString('en-US', { weekday: 'long' }), // e.g., "Sunday"
            date: today, // current date and time
            caloriesBurned: 0,
            checklist: user.checklist || [],
          });
          const saved = await newData.save();
        return res.json(saved);
    
      } catch (err) {
        console.error('Checklist fetch error:', err);
        res.status(500).json({ message: 'Error fetching checklist' });
      }
    });

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// --- checklist 


app.get('/api/checklist', verifyToken, async (req, res) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
      // Find today's entry for the user
      let todayEntry = await Data.findOne({
        userId: req.userId,
        date: { $gte: startOfDay, $lte: endOfDay },
      }).sort({ date: -1 });
  
      // If entry exists, update incomplete tasks and save
      if (todayEntry && Array.isArray(todayEntry.checklist)) {
        // Filter out incomplete tasks
        const incompleteTasks = todayEntry.checklist.filter(item => !item.completed);
        
        // Here, you can perform any additional operations like updating tasks if needed.
        // For example, if you want to update the checklist status of any task, you can add logic here:
        
        // Update checklist if needed (e.g., you could check for updated tasks from the front end).
        todayEntry.checklist = todayEntry.checklist.map(task => {
          if (task.completed === false) {
            // Optionally update the task status if needed
            // For example, if you wanted to automatically mark certain tasks as completed
            task.completed = true; // Mark as completed (optional logic here)
          }
          return task;
        });
  
        // Save the updated checklist (if modified)
        await todayEntry.save();
  
        return res.json({
          checklist: incompleteTasks,  // Returning incomplete tasks after the update
        });
      }
  
      // Fallback to user's default checklist if no entry found for today
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      //const today = new Date();

      return res.json({ checklist: user.checklist || [] });
  
    } catch (err) {
      console.error('Checklist fetch error:', err);
      res.status(500).json({ message: 'Error fetching checklist' });
    }
  });
  

  app.post('/api/checklist/add', verifyToken, async (req, res) => {
    const { task } = req.body;
  
    if (!task) {
      return res.status(400).json({ message: 'Task is required' });
    }
  
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
  
      // Check if there's an entry for today
      let todayEntry = await Data.findOne({
        userId: req.userId,
        date: { $gte: today, $lte: endOfDay },
      });
  
  
      // If today's entry exists, update it
      const exists = todayEntry.checklist.find(item => item.task === task);
  
      if (!exists) {
        todayEntry.checklist.push({ task, completed: false, priority: 1 });
        const updated = await todayEntry.save();
        return res.json({ checklist: updated.checklist, message: 'Task added to today\'s checklist' });
      }
      
      res.status(400).json({ checklist: todayEntry.checklist, message: 'Task already exists' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error adding task to checklist' });
    }
  });
  

  app.patch('/api/checklist/update', verifyToken, async (req, res) => {
    const { checklist } = req.body;
  
    if (!Array.isArray(checklist)) {
      return res.status(400).json({ message: 'Checklist must be an array of strings' });
    }
  
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      user.checklist = checklist;
      await user.save();
  
      res.json({ message: 'Checklist updated successfully', checklist: user.checklist });
    } catch (err) {
      console.error('Error updating checklist:', err);
      res.status(500).json({ message: 'Error updating checklist' });
    }
  });
  

  
  app.delete('/api/checklist/delete', verifyToken, async (req, res) => {
    const { task } = req.body;
  
    if (!task) {
      return res.status(400).json({ message: 'Task is required' });
    }
  
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
    
        // Find today's data entry
        const todayEntry = await Data.findOne({
          userId: req.userId,
          date: { $gte: startOfDay, $lte: endOfDay },
        });
    
        if (!todayEntry) {
          return res.status(404).json({ message: 'No data entry for today found' });
        }
    
        // Remove the task from checklist
        todayEntry.checklist = todayEntry.checklist.filter(t => t.task !== task);
        await todayEntry.save();
    
        res.json({ message: 'Task removed from today\'s checklist', checklist: todayEntry.checklist });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting task from today\'s checklist' });
      }
    });
  
    app.post('/api/expenses', verifyToken, async (req, res) => {
      try {
        const { expenses, sharedAccountId } = req.body;
        const userId = req.userId;

        // Get user to get username
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Validate shared account access if sharedAccountId is provided
        if (sharedAccountId) {
          const sharedAccount = await SharedAccount.findById(sharedAccountId);
          if (!sharedAccount || !sharedAccount.collaborators.includes(userId)) {
            return res.status(403).json({ error: "Not authorized to add expenses to this shared account" });
          }
        }

        const expenseDocs = expenses.map(expense => ({
          ...expense,
          userId,
          username: user.username,
          sharedAccountId: sharedAccountId || null
        }));

        const savedExpenses = await Expense.insertMany(expenseDocs);
        res.json(savedExpenses);
      } catch (err) {
        console.error("Error creating expenses:", err);
        res.status(500).json({ error: "Error creating expenses" });
      }
    });
    
    app.get('/api/expenses', verifyToken, async (req, res) => {
      try {
        // Get all shared accounts the user has access to
        const sharedAccounts = await SharedAccount.find({
          $or: [
            { owner: req.userId },
            { collaborators: req.userId }
          ],
          isActive: true
        });

        const sharedAccountIds = sharedAccounts.map(acc => acc._id);

        // Find all expenses where user is either the owner or part of a shared account
        const expenses = await Expense.find({
          $or: [
            { userId: req.userId },
            { 
              sharedAccountId: { $in: sharedAccountIds },
              isShared: true
            }
          ]
        }).sort({ date: 1 });

        res.json(expenses);
      } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).json({ message: 'Failed to fetch expenses' });
      }
    });
    
    app.get('/api/expenses/categories', verifyToken, async (req, res) => {
      try {
        const users = await User.findById(req.userId);    
            const categories = users.category;
        res.json(categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Failed to fetch categories' });
      }
    });
    
    app.post('/api/expenses/categories', verifyToken, async (req, res) => {
      const { category, budget } = req.body;
      if (!category || typeof category !== 'string') {
        return res.status(400).json({ message: 'Invalid category' });
      }
    
      try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
    
        if (!user.category) user.category.push({
          name: category,
          budget: budget || 0,
        });
    
        const existingCategory = user.category.find(c => c.name === category);
        if (existingCategory) {
          existingCategory.budget = budget || 0;
        } else {
          user.category.push({ name: category, budget: budget || 0 });
        }
        await user.save();
    
        res.json({ message: 'Category added', categories: user.categories });
      } catch (err) {
        console.error('Add category error:', err);
        res.status(500).json({ message: 'Failed to add category' });
      }
    });
    
    app.get('/api/expenses/chart/:type', verifyToken, async (req, res) => {
      const { type } = req.params;
    
      const groupFormat = {
        daily: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        weekly: { $dateToString: { format: "%Y-%U", date: "$date" } }, // Year-week number
        monthly: { $dateToString: { format: "%Y-%m", date: "$date" } },
      }[type];
    
      if (!groupFormat) return res.status(400).json({ message: 'Invalid aggregation type' });
    
      try {
        const aggregated = await Expense.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
          {
            $group: {
              _id: groupFormat,
              total: { $sum: "$amount" },
              categories: {
                $push: {
                  category: "$category",
                  amount: "$amount"
                }
              }
            }
          },
          { $sort: { _id: 1 } }
        ]);
    
        res.json(aggregated);
      } catch (err) {
        console.error('Aggregation error:', err);
        res.status(500).json({ message: 'Error aggregating data' });
      }
    });
    
    app.delete('/api/expenses/categories/:name', verifyToken, async (req, res) => {
      const { name } = req.params;
    
      try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
    
        user.category = user.category.filter(cat => cat.name !== name);
        await user.save();
    
        res.json({ message: 'Category deleted', categories: user.categories });
      } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ message: 'Failed to delete category' });
      }
    });
    
    
    // === Expense

// API to fetch expense chart data with date range
app.get('/api/data/chart', verifyToken, async (req, res) => {
  try {
    const { type, startDate, endDate, sharedAccountId } = req.query;
    
    // If no query parameters, return all expenses for the user
    if (!type && !startDate && !endDate) {
      const query = {
        $or: [
          { userId: req.userId },
          { sharedAccountId: sharedAccountId }
        ]
      };

      const expenses = await Expense.find(query).sort({ date: 1 });

      // Format data for chart display
      const chartData = expenses.map(expense => ({
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        amount: expense.amount || 0,
        category: expense.category || 'Uncategorized'
      }));

      return res.json(chartData);
    }

    // If query parameters are provided, validate them
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required parameters: type, startDate, endDate' });
    }

    // Parse dates and set to start/end of day
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    console.log('Date range:', { start, end });

    if (type === 'expense') {
      const query = {
        date: {
          $gte: start,
          $lte: end
        }
      };

      // If sharedAccountId is provided, include those expenses
      if (sharedAccountId) {
        query.$or = [
          { userId: req.userId, sharedAccountId },
          { sharedAccountId }
        ];
      } else {
        query.userId = req.userId;
      }

      const expenses = await Expense.find(query).sort({ date: 1 });

      console.log('Found expenses:', expenses.length);

      // Format data for chart display
      const chartData = expenses.map(expense => ({
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        amount: expense.amount || 0,
        category: expense.category || 'Uncategorized'
      }));

      console.log('Formatted chart data:', chartData);
      return res.json(chartData);
    } else {
      return res.status(400).json({ message: 'Invalid chart type' });
    }
  } catch (err) {
    console.error('Error fetching chart data:', err);
    return res.status(500).json({ message: 'Error fetching chart data' });
  }
});

// Add new endpoints for super categories
app.post('/api/expenses/super-categories', verifyToken, async (req, res) => {
  const { name, startDate, endDate } = req.body;
  
  if (!name || !startDate || !endDate) {
    return res.status(400).json({ message: 'Name, start date, and end date are required' });
  }

  try {
    console.log('Creating super category:', { name, startDate, endDate });
    
    // Set time to start and end of day for proper date comparison
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    console.log('Date range for query:', { start, end });
    
    // Find all expenses in the date range
    const expenses = await Expense.find({
      userId: req.userId,
      date: {
        $gte: start,
        $lte: end
      }
    });

    console.log('Found expenses to update:', expenses.length);
    console.log('Sample expense:', expenses[0]);

    // Update all expenses in the date range with the super category
    const updatedExpenses = await Promise.all(
      expenses.map(expense => 
        Expense.findByIdAndUpdate(
          expense._id,
          {
            superCategory: name,
            superCategoryStartDate: start,
            superCategoryEndDate: end
          },
          { new: true }
        )
      )
    );

    console.log('Updated expenses:', updatedExpenses.length);

    // Calculate total and format response
    const total = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const response = {
      name,
      startDate: start,
      endDate: end,
      expenses: updatedExpenses,
      total
    };

    console.log('Sending response:', response);

    res.json(response);
  } catch (err) {
    console.error('Error adding super category:', err);
    res.status(500).json({ message: 'Failed to add super category' });
  }
});

app.get('/api/expenses/super-categories', verifyToken, async (req, res) => {
  try {
    console.log('Fetching super categories for user:', req.userId);
    
    const expenses = await Expense.find({
      userId: req.userId,
      superCategory: { $exists: true, $ne: null }
    }).sort({ date: -1 });

    console.log('Found expenses with super categories:', expenses.length);
    if (expenses.length > 0) {
      console.log('Sample expense:', expenses[0]);
    }

    // Group expenses by super category
    const superCategories = expenses.reduce((acc, expense) => {
      if (!acc[expense.superCategory]) {
        acc[expense.superCategory] = {
          name: expense.superCategory,
          startDate: expense.superCategoryStartDate,
          endDate: expense.superCategoryEndDate,
          expenses: [],
          total: 0
        };
      }
      acc[expense.superCategory].expenses.push(expense);
      acc[expense.superCategory].total += expense.amount;
      return acc;
    }, {});

    const result = Object.values(superCategories);
    console.log('Returning super categories:', result.length);
    if (result.length > 0) {
      console.log('Sample super category:', result[0]);
    }
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching super categories:', err);
    res.status(500).json({ message: 'Failed to fetch super categories' });
  }
});

app.delete('/api/expenses/super-categories/:name', verifyToken, async (req, res) => {
  const { name } = req.params;

  try {
    const result = await Expense.updateMany(
      { 
        userId: req.userId,
        superCategory: name
      },
      {
        $unset: {
          superCategory: "",
          superCategoryStartDate: "",
          superCategoryEndDate: ""
        }
      }
    );

    res.json({ message: 'Super category removed successfully', modified: result.modifiedCount });
  } catch (err) {
    console.error('Error removing super category:', err);
    res.status(500).json({ message: 'Failed to remove super category' });
  }
});

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Add the new endpoint for sending statements
app.post('/api/expenses/send-statement', verifyToken, async (req, res) => {
  const { statementName, startDate, endDate } = req.body;

  try {
    // Find all expenses in the date range
    const expenses = await Expense.find({
      userId: req.userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1 });

    // Calculate total
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Create email content
    const emailContent = `
      <h2>${statementName}</h2>
      <p>Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
      <h3>Total: ₹${total.toFixed(2)}</h3>
      <h4>Expenses:</h4>
      <ul>
        ${expenses.map(exp => `
          <li>
            ${new Date(exp.date).toLocaleDateString()} - ${exp.category}: ₹${exp.amount}
            ${exp.description ? ` - ${exp.description}` : ''}
          </li>
        `).join('')}
      </ul>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'rkant062@gmail.com',
      subject: `Expense Statement: ${statementName}`,
      html: emailContent
    });

    res.json({ message: 'Statement sent successfully' });
  } catch (err) {
    console.error('Error sending statement:', err);
    res.status(500).json({ message: 'Failed to send statement' });
  }
});

// Add new endpoints for shared accounts
app.post('/api/shared-accounts', verifyToken, async (req, res) => {
  const { name } = req.body;
  
  try {
    // Generate a unique share token
    const shareToken = crypto.randomBytes(16).toString('hex');
    
    const sharedAccount = new SharedAccount({
      name,
      owner: req.userId,
      shareToken,
      collaborators: []
    });

    await sharedAccount.save();
    res.json({ 
      message: 'Shared account created successfully',
      sharedAccount
    });
  } catch (err) {
    console.error('Error creating shared account:', err);
    res.status(500).json({ message: 'Failed to create shared account' });
  }
});

// Add endpoint to get a specific shared account
app.get('/api/shared-accounts/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const sharedAccount = await SharedAccount.findOne({
      _id: id,
      $or: [
        { owner: req.userId },
        { collaborators: req.userId }
      ],
      isActive: true
    });

    if (!sharedAccount) {
      return res.status(404).json({ message: 'Shared account not found or unauthorized' });
    }

    res.json(sharedAccount);
  } catch (err) {
    console.error('Error fetching shared account:', err);
    res.status(500).json({ message: 'Failed to fetch shared account' });
  }
});

app.get('/api/shared-accounts', verifyToken, async (req, res) => {
  try {
    const sharedAccounts = await SharedAccount.find({
      $or: [
        { owner: req.userId },
        { collaborators: req.userId }
      ],
      isActive: true
    }).populate('owner', 'username').populate('collaborators', 'username');

    res.json(sharedAccounts);
  } catch (err) {
    console.error('Error fetching shared accounts:', err);
    res.status(500).json({ message: 'Failed to fetch shared accounts' });
  }
});

app.post('/api/shared-accounts/join', verifyToken, async (req, res) => {
  const { shareToken } = req.body;

  try {
    const sharedAccount = await SharedAccount.findOne({ 
      shareToken,
      isActive: true
    });

    if (!sharedAccount) {
      return res.status(404).json({ message: 'Invalid or expired share token' });
    }

    // Check if user is already a collaborator
    if (sharedAccount.collaborators.includes(req.userId)) {
      return res.status(400).json({ message: 'Already a collaborator' });
    }

    // Add user as collaborator
    sharedAccount.collaborators.push(req.userId);
    await sharedAccount.save();

    res.json({ 
      message: 'Successfully joined shared account',
      sharedAccount
    });
  } catch (err) {
    console.error('Error joining shared account:', err);
    res.status(500).json({ message: 'Failed to join shared account' });
  }
});

app.delete('/api/shared-accounts/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const sharedAccount = await SharedAccount.findOne({
      _id: id,
      owner: req.userId
    });

    if (!sharedAccount) {
      return res.status(404).json({ message: 'Shared account not found or unauthorized' });
    }

    // Soft delete by setting isActive to false
    sharedAccount.isActive = false;
    await sharedAccount.save();

    res.json({ message: 'Shared account deleted successfully' });
  } catch (err) {
    console.error('Error deleting shared account:', err);
    res.status(500).json({ message: 'Failed to delete shared account' });
  }
});

// Add new endpoint to get all expenses with user details
app.get('/api/expenses/all', verifyToken, async (req, res) => {
  try {
    const { sharedAccountId } = req.query;
    
    const query = {};
    if (sharedAccountId) {
      query.sharedAccountId = sharedAccountId;
    } else {
      query.userId = req.userId;
    }

    const expenses = await Expense.find(query)
      .sort({ date: -1 }) // Most recent first
      .populate('userId', 'username'); // Get username from User model

    // Format the response
    const formattedExpenses = expenses.map(expense => ({
      _id: expense._id, // Include the expense ID
      date: expense.date,
      user: expense.userId.username,
      cost: expense.amount,
      category: expense.category
    }));

    res.json(formattedExpenses);
  } catch (err) {
    console.error('Error fetching all expenses:', err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

app.delete('/api/expenses/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const expense = await Expense.findById(id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user has permission to delete (either owner or part of shared account)
    if (expense.userId.toString() !== req.userId) {
      const sharedAccount = await SharedAccount.findOne({
        _id: expense.sharedAccountId,
        $or: [
          { owner: req.userId },
          { collaborators: req.userId }
        ]
      });
      
      if (!sharedAccount) {
        return res.status(403).json({ message: 'Not authorized to delete this expense' });
      }
    }

    await Expense.findByIdAndDelete(id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});
