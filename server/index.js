const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Load data from file or seed initial data
const loadData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = [
            { id: 1, name: 'ABIR BEN MAHMOD', attendance: { tue_m: 1, tue_a: 1, wed_m: 1, wed_a: 1, sat_m: 0, sat_a: 0 }, payment: 'OK', note: '' },
            { id: 2, name: 'SIHEM SALAH', attendance: { tue_m: 0, tue_a: 0, wed_m: 0, wed_a: 0, sat_m: 1, sat_a: 1 }, payment: '', note: '' },
            { id: 3, name: 'AMENI TWETI', attendance: { tue_m: 0, tue_a: 0, wed_m: 0, wed_a: 0, sat_m: 1, sat_a: 1 }, payment: 'OK', note: '' },
            { id: 4, name: 'CHAYMA AYDI', attendance: { tue_m: 0, tue_a: 0, wed_m: 1, wed_a: 1, sat_m: 1, sat_a: 1 }, payment: 'NN', note: '' },
            { id: 5, name: 'DALEL BOULILA', attendance: { tue_m: 0, tue_a: 0, wed_m: 0, wed_a: 0, sat_m: 1, sat_a: 1 }, payment: 'OK', note: '' }
        ];
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
};

const saveData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Routes
app.get('/api/students', (req, res) => {
    res.json(loadData());
});

app.post('/api/students', (req, res) => {
    const students = loadData();
    const newStudent = { id: Date.now(), ...req.body };
    students.push(newStudent);
    saveData(students);
    res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
    const students = loadData();
    const idx = students.findIndex(s => s.id == req.params.id);
    if (idx !== -1) {
        students[idx] = { ...students[idx], ...req.body };
        saveData(students);
        res.json(students[idx]);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.delete('/api/students/:id', (req, res) => {
    let students = loadData();
    students = students.filter(s => s.id != req.params.id);
    saveData(students);
    res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});