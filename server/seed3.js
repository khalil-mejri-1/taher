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

const names = [
  "AICHA HERCHI",
  "EMNA KOUBAA",
  "MANEL YOUSFI",
  "ARBIA HARATHI",
  "MARIEM TRABELSI",
  "MARWA HENTATI",
  "NESRINE NAFATI",
  "RIHAB BOUALI",
  "RIHAB BOUHLEL",
  "RIM HIDRI",
  "RIM NASRI",
  "MALEK MKAWAR",
  "WIDED AHMER",
  "BASSMA HAMDEWI",
  "RAWAA BOUZIDI",
  "EMNA GHODHBEN",
  "OMAYMA HMIDET",
  "EMNA LWETTI",
  "NESRINE DRADRA",
  "HANA BRLGHITH",
  "YOSRA BEN ALI",
  "IMEN SAFI",
  "MALEK KEMEL",
  "MANEL HARCHI"
];

const sundayStudentsData = names.map(name => ({
  name,
  schedule: {
    tue_m: false,
    wed_m: false,
    wed_a: false,
    sat_m: false,
    sat_a: false,
    sun_m: true // Only Sunday
  }
}));

const seedSundayStudents = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const mappedData = sundayStudentsData.map(s => ({
      ...s,
      registrationDate: today,
      price: 80, // Default price
      phone: '',
      attendance: { tue_m: 0, wed_m: 0, wed_a: 0, sat_m: 0, sat_a: 0, sun_m: 0 }
    }));

    await Student.insertMany(mappedData);
    console.log('Successfully appended ' + mappedData.length + ' Sunday students to database');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

seedSundayStudents();
