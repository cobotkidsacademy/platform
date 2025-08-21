const mongoose = require('mongoose');

// ================== CLASS CODE SCHEMA ==================
const classCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{3}$/, 'Code must be a 3-digit number']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  validFrom: Date,
  validUntil: Date,
  generatedAt: { type: Date, default: Date.now },
  activatedAt: Date,
  deactivatedAt: Date,
  lessonDate: Date,
  lessonId: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  topicId: { type: mongoose.Schema.Types.ObjectId },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: false }
}, { _id: true, timestamps: false });

// ================== STUDENT SCHEMA ==================
const studentSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lname: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Username cannot be empty'
    }
  },
  password: {
    type: String,
    default: '1234',
    minlength: [4, 'Password must be at least 4 characters'],
    select: false
  },
  points: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  profilePicture: {
    type: String,
    default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyhuMOA9yuJLNoJDGQFL0lfvwwLoF1SBWMJw&s',
    trim: true,
    validate: {
      validator: function(v) {
        // Allow empty string or valid image URL
        if (!v || v.trim() === '') return true;
        
        // Basic URL pattern check for common image formats
        const pattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))(?:[\?].*)?$/i;
        return pattern.test(v);
      },
      message: 'Profile picture must be a valid image URL (PNG, JPG, JPEG, GIF, WEBP, SVG) or empty'
    }
  }
}, { _id: true, timestamps: true });

// ================== CLASS SCHEDULE SCHEMA ==================
const classScheduleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: false
  },
  startTime: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:MM (24-hour format)`
    }
  },
  endTime: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:MM (24-hour format)`
    }
  }
}, { _id: false });

// ================== CLASS SCHEMA ==================
const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    enum: ['Kindergarten', 'Primary', 'Secondary', 'High School']
  },
  courses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    status: { type: String, enum: ['enrolled', 'locked', 'completed'], default: 'enrolled' },
    assignedAt: { type: Date, default: Date.now }
  }],
  currentClassCode: {
    type: classCodeSchema,
    default: null,
    required: false
  },
  schedule: {
    type: classScheduleSchema,
    required: false
  },
  classCodes: { type: [classCodeSchema], default: [] },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: false
  },
  students: {
    type: [studentSchema],
    default: [],
    required: false
  }
}, { timestamps: true });

// ================== SCHOOL SCHEMA ===================
const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  location: {
    type: String,
    required: false,
    trim: true
  },
  classes: {
    type: [classSchema],
    default: [],
    required: false
  },
  studentsCount: {
    type: Number,
    default: 0,
    required: false
  }
}, { timestamps: true });

const School = mongoose.model('School', schoolSchema);
module.exports = School;  