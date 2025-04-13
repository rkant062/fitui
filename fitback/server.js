const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize Express
const app = express();
app.use(cors());
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
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, user});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
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

       
    
        // Find today's entry for the user
        let todayEntry = await Data.find({
          userId: req.userId });

          return res.json(todayEntry);
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
const PORT = process.env.PORT || 5000;
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
  
