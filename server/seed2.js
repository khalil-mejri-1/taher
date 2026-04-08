const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const studentSchema = new mongoose.Schema({
  name: String,
  price: { type: Number, default: 0 },
  phone: String,
  registrationDate: String,
  idCard: String,
  isPending: { type: Boolean, default: false },
  attendance: {
    tue_m: { type: Number, default: 0 },
    wed_m: { type: Number, default: 0 },
    wed_a: { type: Number, default: 0 },
    sat_m: { type: Number, default: 0 },
    sat_a: { type: Number, default: 0 },
    sun_m: { type: Number, default: 0 }
  },
  schedule: {
    tue_m: { type: Boolean, default: true },
    wed_m: { type: Boolean, default: true },
    wed_a: { type: Boolean, default: true },
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
  history: { type: [mongoose.Schema.Types.Mixed], default: [] }
});

const Student = mongoose.model('Student', studentSchema);

const additionalStudentsData = [
  { name: "DHEKRA GHLISSI", schedule: { tue_m: false, wed_m: true, wed_a: true, sat_m: false, sat_a: false, sun_m: false } },
  { name: "HANEN ELAYBA", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } },
  { name: "AFEF AMARA", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "HANEN BAHLOUL", schedule: { tue_m: false, wed_m: true, wed_a: true, sat_m: false, sat_a: false, sun_m: false } },
  { name: "CHAHINEZ MEJDOUB", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } },
  { name: "ASMA NEJI", schedule: { tue_m: false, wed_m: true, wed_a: true, sat_m: false, sat_a: false, sun_m: false } }
];

const seedAdditionalStudents = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // NOT deleting existing students. Adding to them.
    const mappedData = additionalStudentsData.map(s => ({
      ...s,
      registrationDate: today,
      price: 80, // Default price
      phone: '',
      attendance: { tue_m: 0, wed_m: 0, wed_a: 0, sat_m: 0, sat_a: 0, sun_m: 0 }
    }));

    await Student.insertMany(mappedData);
    console.log('Successfully appended ' + mappedData.length + ' new students to database');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

seedAdditionalStudents();
