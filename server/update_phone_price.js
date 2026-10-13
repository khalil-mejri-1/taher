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
  phone: String
}, { strict: false });

const Student = mongoose.model('Student', studentSchema);

const updateData = [
  { name: "ABIR BEN MAHMOD", phone: "23757188", price: 100 },
  { name: "SIHEM SALAH", phone: "", price: 100 },
  { name: "AMENI TWETI", phone: "29059097", price: 100 },
  { name: "CHAYMA AYDI", phone: "93401041", price: 100 },
  { name: "DALEL BOULILA", phone: "51535777", price: 100 },
  { name: "EMNA ABYADH", phone: "56636692", price: 100 },
  { name: "FATMA BEN AYED", phone: "22824291", price: 100 },
  { name: "GHADA GHAMGI", phone: "99817052", price: 100 },
  { name: "HAJER NAJI", phone: "27450951", price: 100 },
  { name: "HALIMA CHMISSI", phone: "94285408", price: 100 },
  { name: "HIBA ALLAH CHALBI", phone: "52760619", price: 100 },
  { name: "MAISSA FOURATI", phone: "51397285", price: 100 },
  { name: "MAISSA MALLEK", phone: "97824710", price: 100 },
  { name: "MANEL KESKES", phone: "55802910", price: 100 },
  { name: "MARIEM ALLOUCH", phone: "96835250", price: 100 },
  { name: "MARIEM BOUJELBEN", phone: "24840439", price: 100 },
  { name: "MARIEM CHAWI", phone: "46990799", price: 100 },
  { name: "MARIEM HAMROUNI", phone: "53754102", price: 100 },
  { name: "MARIEM ZOUARI", phone: "50367602", price: 100 },
  { name: "NOUR MWELHI", phone: "53754102", price: 100 },
  { name: "RANIA KTATA", phone: "29208112", price: 100 },
  { name: "RAWYA CHTOUROU", phone: "29208112", price: 100 },
  { name: "RIHEM HAMDI", phone: "28880938", price: 100 },
  { name: "EYA NAES", phone: "28639807", price: 100 },
  { name: "AMENI KARWI", phone: "44567989", price: 100 },
  { name: "MAYSSAM BOULILA", phone: "56377920", price: 100 },
  { name: "EYA ABIDA", phone: "44906999", price: 100 },
  { name: "EMNA AKROUT", phone: "58732073", price: 100 },
  { name: "OMAYMA BEN NASSER", phone: "26255554", price: 100 },
  { name: "YASSMINE GUIDARA", phone: "55911639", price: 100 },
  { name: "ISLEM FOURATI", phone: "20829956", price: 100 },
  { name: "SALSABIL HENI", phone: "28416658", price: 100 },
  { name: "SOUAD HAMZA", phone: "20056491", price: 140 },
  { name: "SOUHIR GOMRI", phone: "54772209", price: 140 },
  { name: "WAFA HAMEDI", phone: "53067215", price: 140 },
  { name: "YASSMINE SWUISSI", phone: "22172550", price: 140 },
  { name: "ZAYNEB NSIRI", phone: "20525279", price: 100 },
  { name: "ZINA MASSOUDI", phone: "24118608", price: 100 },
  { name: "MOUNA DRIRA", phone: "53892089", price: 140 },
  { name: "OMAYMA HLELI", phone: "92903006", price: 150 },
  { name: "NADA CHIHA", phone: "54539843", price: 100 },
  { name: "DHEKRA GHLISSI", phone: "21263306", price: 150 },
  { name: "HANEN ELAYBA", phone: "26790141", price: 100 },
  { name: "AFEF AMARA", phone: "56391964", price: 100 },
  { name: "HANEN BAHLOUL", phone: "54554326", price: 100 },
  { name: "CHAHINEZ MEJDOUB", phone: "51966655", price: 110 },
  { name: "ASMA NEJI", phone: "26036666", price: 80 }
];

const updateStudentsInfo = async () => {
  try {
    for (const data of updateData) {
      const result = await Student.updateOne(
        { name: data.name },
        { $set: { phone: data.phone, price: data.price } }
      );
      if (result.matchedCount === 0) {
        console.log(`Student not found: ${data.name}`);
      }
    }
    console.log('Successfully updated phone numbers and prices!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

updateStudentsInfo();
