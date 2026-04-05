import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  DollarSign, 
  Search, 
  Plus, 
  MoreVertical,
  LayoutDashboard,
  Settings,
  X,
  ChevronDown,
  Clock,
  Trash2,
  Edit2,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const API_URL = 'http://localhost:3000/api/students';

function App() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('adminToken') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchStudents();
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple password as requested
      setIsLoggedIn(true);
      localStorage.setItem('adminToken', 'true');
      setError('');
    } else {
      setError('Mot de passe incorrect ❌');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminToken');
  };

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setStudents(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students:", err);
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAttendance = async (studentId, day) => {
    const student = students.find(s => s.id === studentId);
    const updated = {
      ...student,
      attendance: {
        ...student.attendance,
        [day]: student.attendance[day] === 1 ? 0 : 1
      }
    };
    
    setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
    
    try {
      await axios.put(`${API_URL}/${studentId}`, updated);
    } catch (err) {
      console.error("Error updating attendance:", err);
    }
  };

  const updatePayment = async (id, status) => {
    const student = students.find(s => s.id === id);
    const updated = { ...student, payment: status };
    setStudents(prev => prev.map(s => s.id === id ? updated : s));
    try {
      await axios.put(`${API_URL}/${id}`, updated);
    } catch (err) {
      console.error("Error updating payment:", err);
    }
  };

  const updateNote = async (id, val) => {
    const student = students.find(s => s.id === id);
    const updated = { ...student, note: val };
    setStudents(prev => prev.map(s => s.id === id ? updated : s));
    try {
      await axios.put(`${API_URL}/${id}`, updated);
    } catch (err) {
      console.error("Error updating note:", err);
    }
  };

  const addStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName) return;
    const newS = {
      name: newStudentName,
      attendance: { tue_m: 0, tue_a: 0, wed_m: 0, wed_a: 0, sat_m: 0, sat_a: 0 },
      payment: '',
      note: ''
    };
    try {
      const { data } = await axios.post(API_URL, newS);
      setStudents([...students, data]);
      setNewStudentName('');
      setShowModal(false);
    } catch (err) {
      console.error("Error adding student:", err);
    }
  };

  const deleteStudent = async (id) => {
    if (confirm("Supprimer cet étudiant ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setStudents(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        console.error("Error deleting student:", err);
      }
    }
  };

  const stats = {
    total: students.length,
    presentToday: students.filter(s => Object.values(s.attendance).some(v => v === 1)).length,
    pendingPayment: students.filter(s => s.payment !== 'OK').length,
    revenue: students.filter(s => s.payment === 'OK').length * 100
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="login-card">
          <div style={{ display: 'inline-flex', background: 'var(--accent)', padding: '16px', borderRadius: '20px', marginBottom: '1.5rem' }}>
            <Calendar size={32} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Espace Admin</h2>
          <p style={{ color: '#9ca3af', marginBottom: '2rem', fontSize: '0.9rem' }}>Connectez-vous pour gérer l'Atelier Sfax</p>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Mot de passe" className="login-input" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>{error}</p>}
            <button type="submit" className="login-btn">Accéder au Dashboard</button>
          </form>
          <p style={{ marginTop: '2rem', color: '#4b5563', fontSize: '0.75rem' }}>© 2024 Atelier Sfax - Gestion Éducative</p>
        </motion.div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <Clock size={40} color="var(--accent)" />
      </motion.div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ background: 'var(--accent)', padding: '10px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(180, 83, 9, 0.3)' }}>
            <Calendar size={28} color="white" />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 0, letterSpacing: '0.02em', color: 'white' }}>Atelier Sfax</h2>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> Tableau de bord
          </button>
          <button className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <Users size={20} /> Étudiants
          </button>
          <button className="nav-item">
            <DollarSign size={20} /> Paiements
          </button>
          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 'auto' }}>
            <LogOut size={20} /> Déconnexion
          </button>
        </nav>
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.5rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #374151 0%, #111827 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Users size={20} color="#e5e7eb" />
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '1px' }}>Admin Taher</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
                <p style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 500 }}>En ligne</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <header style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Dashboard</h1>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.05rem' }}>Suivi des présences et des règlements.</p>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Chercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.85rem 1rem 0.85rem 3.2rem', borderRadius: '14px', border: '1px solid var(--border)', width: '320px', fontSize: '0.95rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.3s' }} />
              </div>
              <button className="btn-add" onClick={() => setShowModal(true)}>
                <Plus size={22} /> Ajouter Étudiant
              </button>
            </div>
          </div>
        </header>

        <section className="stats-grid">
          {[
            { label: 'Total Étudiants', value: stats.total, color: '#3b82f6', bg: '#eff6ff', icon: <Users /> },
            { label: 'Présents Today', value: stats.presentToday, color: '#10b981', bg: '#ecfdf5', icon: <CheckCircle2 /> },
            { label: 'En Attente', value: stats.pendingPayment, color: '#f59e0b', bg: '#fffbeb', icon: <Clock /> },
            { label: 'Paiements OK', value: `${stats.total - stats.pendingPayment}`, color: '#8b5cf6', bg: '#f5f3ff', icon: <DollarSign /> }
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
              <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
              <div className="stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="table-wrapper">
          <div className="table-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--accent)' }}>●</span> JOURS DE FORMATION
            </h3>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Exporter CSV</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#f3f4f6', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700 }}>
                Semaine Actuelle <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '2.5rem', width: '60px' }}>ID</th>
                <th>NOM DE L'ÉLÈVE</th>
                <th colSpan="2" style={{ textAlign: 'center', borderBottom: '2px solid #edeff2' }}>MARDI</th>
                <th colSpan="2" style={{ textAlign: 'center', borderBottom: '2px solid #edeff2' }}>MERCREDI</th>
                <th colSpan="2" style={{ textAlign: 'center', borderBottom: '2px solid #edeff2' }}>SAMEDI</th>
                <th>RÉGLEMENT</th>
                <th>NOTE</th>
                <th style={{ width: '80px' }}></th>
              </tr>
              <tr style={{ background: '#f9fafb', fontSize: '9px' }}>
                <th colSpan="2"></th>
                <th style={{ textAlign: 'center', color: '#9ca3af', borderRight: '1px solid #f1f3f5' }}>MATIN</th>
                <th style={{ textAlign: 'center', color: '#9ca3af' }}>APRÈS-MIDI</th>
                <th style={{ textAlign: 'center', color: '#9ca3af', borderRight: '1px solid #f1f3f5' }}>MATIN</th>
                <th style={{ textAlign: 'center', color: '#9ca3af' }}>APRÈS-MIDI</th>
                <th style={{ textAlign: 'center', color: '#9ca3af', borderRight: '1px solid #f1f3f5' }}>MATIN</th>
                <th style={{ textAlign: 'center', color: '#9ca3af' }}>APRÈS-MIDI</th>
                <th colSpan="3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => (
                <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={student.id}>
                  <td style={{ paddingLeft: '2.5rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: '#1f2937' }}>{student.name}</td>
                  <td className="checkbox-cell"><div className={`custom-checkbox ${student.attendance.tue_m ? 'checked' : ''}`} onClick={() => toggleAttendance(student.id, 'tue_m')}>{student.attendance.tue_m ? <CheckCircle2 size={14} /> : ''}</div></td>
                  <td className="checkbox-cell"><div className={`custom-checkbox ${student.attendance.tue_a ? 'checked' : ''}`} onClick={() => toggleAttendance(student.id, 'tue_a')}>{student.attendance.tue_a ? <CheckCircle2 size={14} /> : ''}</div></td>
                  <td className="checkbox-cell"><div className={`custom-checkbox ${student.attendance.wed_m ? 'checked' : ''}`} onClick={() => toggleAttendance(student.id, 'wed_m')}>{student.attendance.wed_m ? <CheckCircle2 size={14} /> : ''}</div></td>
                  <td className="checkbox-cell"><div className={`custom-checkbox ${student.attendance.wed_a ? 'checked' : ''}`} onClick={() => toggleAttendance(student.id, 'wed_a')}>{student.attendance.wed_a ? <CheckCircle2 size={14} /> : ''}</div></td>
                  <td className="checkbox-cell"><div className={`custom-checkbox ${student.attendance.sat_m ? 'checked' : ''}`} onClick={() => toggleAttendance(student.id, 'sat_m')}>{student.attendance.sat_m ? <CheckCircle2 size={14} /> : ''}</div></td>
                  <td className="checkbox-cell"><div className={`custom-checkbox ${student.attendance.sat_a ? 'checked' : ''}`} onClick={() => toggleAttendance(student.id, 'sat_a')}>{student.attendance.sat_a ? <CheckCircle2 size={14} /> : ''}</div></td>
                  <td><select value={student.payment} onChange={(e) => updatePayment(student.id, e.target.value)} style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: 'none', background: student.payment === 'OK' ? '#dcfce7' : student.payment === 'NN' ? '#fee2e2' : student.payment === 'RESTE' ? '#fef9c3' : '#f3f4f6', color: student.payment === 'OK' ? '#166534' : student.payment === 'NN' ? '#991b1b' : student.payment === 'RESTE' ? '#854d0e' : '#6b7280', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}><option value="">ATTENTE</option><option value="OK">OK</option><option value="NN">NN</option><option value="RESTE">RESTE</option></select></td>
                  <td><input type="text" placeholder="..." defaultValue={student.note} onBlur={(e) => updateNote(student.id, e.target.value)} style={{ border: 'none', fontSize: '0.85rem', background: 'transparent', width: '100%', color: '#64748b', fontWeight: 500 }} /></td>
                  <td><button onClick={() => deleteStudent(student.id)} style={{ color: '#ef4444', opacity: 0.7, padding: 4 }} title="Supprimer"><Trash2 size={16} /></button></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ width: '450px', padding: '2.5rem', position: 'relative' }}>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 20, right: 20, color: 'var(--text-muted)' }}><X size={24} /></button>
              <h2 style={{ marginBottom: '0.75rem', fontSize: '1.75rem' }}>Nouvel Étudiant</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Entrez les informations pour enregistrer une nouvelle inscription.</p>
              <form onSubmit={addStudent}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>NOM COMPLET</label>
                  <input autoFocus type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Ex: Fatma Ben Ahmed" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '2px solid var(--border)', outline: 'none' }} />
                </div>
                <button type="submit" className="btn-add" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}>Enregistrer l'inscription</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
