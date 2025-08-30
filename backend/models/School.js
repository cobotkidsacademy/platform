const mongoose = require('mongoose');

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
    unique: true,
    trim: true,
    lowercase: true
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
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-generate username (SchoolCode-fname.lname)
studentSchema.pre('save', function(next) {
  if (!this.username) {
    const schoolCode = this.parent().parent().code;
    this.username = `${schoolCode}-${this.fname.toLowerCase()}.${this.lname.toLowerCase()}`;
  }
  next();
});

// ================== CLASS CODE SCHEMA ==================
const classCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Tutor' // Reference to tutor (from Tutor model)
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  activatedAt: {
    type: Date
  },
  deactivatedAt: {
    type: Date
  },
  lessonDate: {
    type: Date,
    required: true
  },
  lessonId: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true });

// ================== ATTENDANCE SCHEMA ==================
const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Absent'],
    default: 'Present'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  classCodeUsed: {
    type: String,
    required: true
  }
}, { timestamps: true });

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
  currentClassCode: {
    type: classCodeSchema,
    default: null
  },
  classCodes: [{
    type: classCodeSchema
  }],
  schedule: {
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String, // e.g., "09:00"
    endTime: String   // e.g., "10:30"
  },
  courses: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    status: { type: String, enum: ['enrolled', 'locked', 'completed'], default: 'enrolled' },
    assignedAt: { type: Date, default: Date.now }
  }],
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor' // Reference to tutor (from Tutor model)
  },
  students: [studentSchema],
  attendance: [attendanceSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

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
    required: true,
    trim: true
  },
  classes: [classSchema],
  studentsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Schools', schoolSchema);
