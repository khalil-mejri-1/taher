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

const studentsData = [
  { name: "ABIR BEN MAHMOD", schedule: { tue_m: false, wed_m: true, wed_a: true, sat_m: false, sat_a: false, sun_m: false } },
  { name: "SIHEM SALAH", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "AMENI TWETI", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "CHAYMA AYDI", schedule: { tue_m: false, wed_m: true, wed_a: true, sat_m: true, sat_a: true, sun_m: false } },
  { name: "DALEL BOULILA", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "EMNA ABYADH", schedule: { tue_m: false, wed_m: false, wed_a: true, sat_m: true, sat_a: false, sun_m: false } },
  { name: "FATMA BEN AYED", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } },
  { name: "GHADA GHAMGI", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "HAJER NAJI", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } },
  { name: "HALIMA CHMISSI", schedule: { tue_m: false, wed_m: true, wed_a: true, sat_m: false, sat_a: false, sun_m: false } },
  { name: "HIBA ALLAH CHALBI", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } },
  { name: "MAISSA FOURATI", schedule: { tue_m: false, wed_m: false, wed_a: true, sat_m: false, sat_a: true, sun_m: false } },
  { name: "MAISSA MALLEK", schedule: { tue_m: true, wed_m: false, wed_a: true, sat_m: false, sat_a: false, sun_m: false } },
  { name: "MANEL KESKES", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "MARIEM ALLOUCH", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "MARIEM BOUJELBEN", schedule: { tue_m: false, wed_m: true, wed_a: true, sat_m: false, sat_a: false, sun_m: false } },
  { name: "MARIEM CHAWI", schedule: { tue_m: false, wed_m: true, wed_a: false, sat_m: true, sat_a: false, sun_m: false } },
  { name: "MARIEM HAMROUNI", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "MARIEM ZOUARI", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } },
  { name: "NOUR MWELHI", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "RANIA KTATA", schedule: { tue_m: true, wed_m: false, wed_a: false, sat_m: true, sat_a: false, sun_m: false } },
  { name: "RAWYA CHTOUROU", schedule: { tue_m: true, wed_m: false, wed_a: false, sat_m: true, sat_a: false, sun_m: false } },
  { name: "RIHEM HAMDI", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "EYA NAES", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "AMENI KARWI", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "MAYSSAM BOULILA", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } },
  { name: "EYA ABIDA", schedule: { tue_m: true, wed_m: false, wed_a: false, sat_m: true, sat_a: false, sun_m: false } },
  { name: "EMNA AKROUT", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } },
  { name: "OMAYMA BEN NASSER", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "YASSMINE GUIDARA", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "ISLEM FOURATI", schedule: { tue_m: true, wed_m: false, wed_a: true, sat_m: false, sat_a: false, sun_m: false } },
  { name: "SALSABIL HENI", schedule: { tue_m: true, wed_m: false, wed_a: false, sat_m: true, sat_a: false, sun_m: false } },
  { name: "SOUAD HAMZA", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } },
  { name: "SOUHIR GOMRI", schedule: { tue_m: true, wed_m: false, wed_a: true, sat_m: false, sat_a: false, sun_m: false } },
  { name: "WAFA HAMEDI", schedule: { tue_m: false, wed_m: true, wed_a: false, sat_m: true, sat_a: false, sun_m: false } },
  { name: "YASSMINE SWUISSI", schedule: { tue_m: false, wed_m: true, wed_a: true, sat_m: false, sat_a: false, sun_m: false } },
  { name: "ZAYNEB NSIRI", schedule: { tue_m: false, wed_m: false, wed_a: false, sat_m: true, sat_a: true, sun_m: false } },
  { name: "ZINA MASSOUDI", schedule: { tue_m: false, wed_m: true, wed_a: true, sat_m: false, sat_a: false, sun_m: false } },
  { name: "MOUNA DRIRA", schedule: { tue_m: false, wed_m: true, wed_a: false, sat_m: true, sat_a: false, sun_m: false } },
  { name: "OMAYMA HLELI", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } },
  { name: "NADA CHIHA", schedule: { tue_m: true, wed_m: true, wed_a: false, sat_m: false, sat_a: false, sun_m: false } }
];

const seedDB = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if students already exist? The user might have wiped them, or I should delete all first?
    // Let's delete all first since there's an explicit "delete all students" button mentioned.
    await Student.deleteMany({});
    console.log('Cleared existing students');

    const mappedData = studentsData.map(s => ({
      ...s,
      registrationDate: today,
      price: 80, // Default price?
      phone: '',
      attendance: { tue_m: 0, wed_m: 0, wed_a: 0, sat_m: 0, sat_a: 0, sun_m: 0 }
    }));

    await Student.insertMany(mappedData);
    console.log('Successfully seeded database with ' + mappedData.length + ' students');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
