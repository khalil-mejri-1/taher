require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  price: { type: Number, default: 0 },
  phone: String,
  registrationDate: String,
  idCard: String,
  isPending: { type: Boolean, default: false },
  attendance: {
    tue_m: { type: Number, default: 0 },
    tue_a: { type: Number, default: 0 },
    wed_m: { type: Number, default: 0 },
    wed_a: { type: Number, default: 0 },
    thu_m: { type: Number, default: 0 },
    thu_a: { type: Number, default: 0 },
    fri_m: { type: Number, default: 0 },
    fri_a: { type: Number, default: 0 },
    sat_m: { type: Number, default: 0 },
    sat_a: { type: Number, default: 0 },
    sun_m: { type: Number, default: 0 }
  },
  schedule: {
    tue_m: { type: Boolean, default: true },
    tue_a: { type: Boolean, default: true },
    wed_m: { type: Boolean, default: true },
    wed_a: { type: Boolean, default: true },
    thu_m: { type: Boolean, default: true },
    thu_a: { type: Boolean, default: true },
    fri_m: { type: Boolean, default: true },
    fri_a: { type: Boolean, default: true },
    sat_m: { type: Boolean, default: true },
    sat_a: { type: Boolean, default: true },
    sun_m: { type: Boolean, default: true }
  },
  payment: { type: String, default: 'PENDING' },
  partial_amount: { type: Number, default: 0 },
  note: { type: String, default: '' },
  archived: { type: Boolean, default: false },
  sessions_count: { type: Number, default: 0 },
  unpaid_count: { type: Number, default: 0 },
  paid_cycles: { type: [Number], default: [] },
  history: { type: [mongoose.Schema.Types.Mixed], default: [] },
  session_log: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

const Student = mongoose.model('Student', studentSchema);

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'API Atelier Taher is running successfully  🚀', status: 'OK' });
});

app.get('/', (req, res) => {
  res.json({ message: 'API Atelier Taher is running successfully 🚀', status: 'OK' });
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStudent) return res.status(404).json({ error: 'Student not found' });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ error: 'Student not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/students/batch', async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, ...data }
    const results = [];
    for (const update of updates) {
      const { id, ...data } = update;
      const updated = await Student.findByIdAndUpdate(id, data, { new: true });
      if (updated) results.push(updated);
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings Schema (for terminatedSessions, weekStartDate, etc.)
const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed
});
const Settings = mongoose.model('Settings', settingsSchema);

// New Routes for Settings
app.get('/api/settings/:key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    res.json(setting ? setting.value : null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.json(setting.value);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});