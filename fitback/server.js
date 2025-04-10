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

// Define the User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

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

// API to add single data (with checklist and userId)
app.post('/api/add-data', verifyToken, async (req, res) => {
  const { day, date, caloriesBurned, checklist } = req.body;

  try {
    const newData = new Data({
      userId: req.userId, // Attach the userId
      day: day,
      date: new Date(date),
      caloriesBurned: caloriesBurned,
      checklist: checklist.map(task => ({
        task: task.task,
        completed: task.completed,
        priority: task.priority || 1,  // Default priority
      })),
    });

    const savedRow = await newData.save();
    res.json({ message: 'Data added successfully', data: savedRow });
  } catch (err) {
    res.status(500).send('Error adding data');
  }
});

// API to update checklist tasks for a given user and day
app.post('/api/update-checklist', verifyToken, async (req, res) => {
  const { day, checklist } = req.body; // Expecting day and checklist array from the user

  try {
    const existingData = await Data.findOne({ userId: req.userId, day });

    if (!existingData) {
      return res.status(404).json({ error: 'No data found for the specified user and day' });
    }

    checklist.forEach((task) => {
      const existingTask = existingData.checklist.find(t => t.task === task.task);
      if (existingTask) {
        existingTask.completed = task.completed;
        existingTask.priority = task.priority;
      } else {
        existingData.checklist.push({ task: task.task, completed: task.completed, priority: task.priority });
      }
    });

    existingData.checklist.sort((a, b) => a.priority - b.priority); // Sort tasks by priority

    await existingData.save();

    res.json({ message: 'Checklist updated successfully', data: existingData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating checklist');
  }
});

// API to add a new task to the checklist for a user
app.post('/api/add-checklist-task', verifyToken, async (req, res) => {
  const { day, task, priority } = req.body;

  if (!task) {
    return res.status(400).json({ message: 'Task is required' });
  }

  try {
    const existingData = await Data.findOne({ userId: req.userId, day });

    if (!existingData) {
      return res.status(404).json({ message: 'No data found for the specified user and day' });
    }

    const existingTask = existingData.checklist.find(t => t.task === task);

    if (existingTask) {
      return res.status(400).json({ message: 'Task already exists' });
    }

    const newTask = { task: task, completed: false, priority: priority || 1 };

    existingData.checklist.push(newTask);
    existingData.checklist.sort((a, b) => a.priority - b.priority);

    await existingData.save();

    res.json({ message: 'Task added successfully', data: existingData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding task to the checklist' });
  }
});

// API to fetch data for a specific user
app.get('/api/data', verifyToken, async (req, res) => {
  try {
    const data = await Data.find({ userId: req.userId }).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
