const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// ==================== STUDENTS ====================
app.get('/api/students', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = search
      ? {
          $or: [
            { name: { $regex: search.trim(), $options: 'i' } },
            { studentId: { $regex: search.trim(), $options: 'i' } }
          ]
        }
      : {};
    const students = await Student.find(filter).sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { name, studentId, phone, zip } = req.body;
    if (!name?.trim() || !studentId?.trim() || !phone?.trim() || !zip?.trim()) {
      return res.status(400).json({ error: 'All student fields are required.' });
    }
    const student = await Student.create({ name, studentId, phone, zip });
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A student with that Student ID already exists.' });
    }
    res.status(400).json({ error: err.message || 'Failed to add student.' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    await Enrollment.deleteMany({ student: student._id });
    res.json({ message: 'Student and related enrollments deleted.' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid student ID.' });
  }
});

// ==================== COURSES ====================
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseId: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { courseId, courseName } = req.body;
    if (!courseId?.trim() || !courseName?.trim()) {
      return res.status(400).json({ error: 'Course ID and Course Name are required.' });
    }
    const course = await Course.create({ courseId, courseName });
    res.status(201).json(course);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'A course with that Course ID already exists.' });
    }
    res.status(400).json({ error: err.message || 'Failed to add course.' });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    await Enrollment.deleteMany({ course: course._id });
    res.json({ message: 'Course and related enrollments deleted.' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid course ID.' });
  }
});

// ==================== ENROLLMENTS ====================
app.post('/api/enrollments', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ error: 'Both student and course are required.' });
    }

    const [student, course] = await Promise.all([
      Student.findById(studentId),
      Course.findById(courseId)
    ]);

    if (!student) return res.status(404).json({ error: 'Selected student does not exist.' });
    if (!course) return res.status(404).json({ error: 'Selected course does not exist.' });

    const enrollment = await Enrollment.create({ student: student._id, course: course._id });
    res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This student is already enrolled in that course.' });
    }
    res.status(400).json({ error: err.message || 'Failed to create enrollment.' });
  }
});

app.get('/api/enrollments/course/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    const enrollments = await Enrollment.find({ course: course._id })
      .populate('student')
      .sort({ createdAt: 1 });
    const students = enrollments.map((e) => e.student).filter(Boolean);
    res.json({ course, students });
  } catch (err) {
    res.status(400).json({ error: 'Invalid course ID.' });
  }
});

// ==================== PRODUCTION FRONTEND ====================
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ==================== START SERVER ====================
async function startServer() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    await mongoose.connect(MONGODB_URI);
    await Promise.all([Student.syncIndexes(), Course.syncIndexes(), Enrollment.syncIndexes()]);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
