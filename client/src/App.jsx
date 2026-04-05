import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  CheckCircle2,
  Calendar,
  DollarSign,
  Search,
  Plus,
  LayoutDashboard,
  X,
  ChevronDown,
  Clock,
  Trash2,
  LogOut,
  ArrowRight,
  TrendingUp,
  CircleCheckBig
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
    if (password === 'admin123') {
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
    if (confirm("🚨 Voulez-vous vraiment supprimer cet étudiant ? Cette action est irréversible.")) {
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'OK': return 'status-ok';
      case 'NN': return 'status-nn';
      case 'RESTE': return 'status-reste';
      default: return 'status-pending';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-bg">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="login-glass">
          <div className="brand-icon" style={{ margin: '0 auto 2rem', padding: '20px' }}>
            <Calendar size={48} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '0.75rem' }}>Portail de Gestion</h2>
          <p style={{ color: '#94a3b8', marginBottom: '3rem', fontSize: '1.1rem' }}>Identifiez-vous pour gérer l'Atelier Taher</p>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Clé d'administration" className="login-input" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1.1rem', padding: '1.25rem' }} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
            {error && <p style={{ color: '#fb7185', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>{error}</p>}
            <button type="submit" className="login-btn" style={{ background: 'var(--accent)', fontWeight: 800, letterSpacing: '0.05em' }}>DÉVERROUILLER L'ACCÈS <ArrowRight size={20} style={{ marginLeft: '10px' }} /></button>
          </form>
          <p style={{ marginTop: '3rem', color: '#475569', fontSize: '0.85rem' }}>SYSTÈME DE SÉCURITÉ ACTIF © 2024</p>
        </motion.div>
      </div>
    );
  }

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', background: '#020617', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        <div style={{ background: 'var(--accent)', padding: 30, borderRadius: '24px' }}>
          <Calendar size={60} color="white" />
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* Sidebar Improvement */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><Calendar size={28} color="white" /></div>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'white', letterSpacing: '0.02em', margin: 0 }}>a7la taher kif ya sfax</h2>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>a9wa mola charika</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={22} /> Dashboard Principal</button>
          <button className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}><Users size={22} /> Liste des Étudiants</button>
          <button className="nav-item"><DollarSign size={22} /> Finances & Rapports</button>
          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}><LogOut size={22} /> Quitter la session</button>
        </nav>

        <div style={{ marginTop: '2rem', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="white" />
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white' }}>Admin Principal</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Statut: Actif</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="app-main">
        {/* Header Enhancement */}
        <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>

            <h1 style={{ fontSize: '3.8rem', color: 'var(--primary)', lineHeight: 1.1 }}>Vue d'ensemble</h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.3rem', marginTop: '0.5rem' }}>Suivez la progression et les règlements en temps réel.</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '10px' }}>
            <div className="search-container">
              <Search size={22} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" placeholder="Rechercher par nom..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button className="btn-primary-modern" onClick={() => setShowModal(true)}>
              <Plus size={24} /> Ajouter Étudiant
            </button>
          </div>
        </header>

        {/* Improved Stats Grid */}
        <section className="stats-grid">
          {[
            { label: 'Effectif Total', value: stats.total, color: '#3b82f6', bg: '#eff6ff', icon: <Users size={28} />, trend: '+4%' },
            { label: 'Assiduité', value: stats.presentToday, color: '#10b981', bg: '#ecfdf5', icon: <CircleCheckBig size={28} />, trend: '+12%' },
            { label: 'En Retard (Pay)', value: stats.pendingPayment, color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={28} />, trend: '-2%' },
            { label: 'Revenus (DT)', value: `${stats.revenue}`, color: '#b45309', bg: '#fff7ed', icon: <TrendingUp size={28} />, trend: '+18%' }
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
              <div className="stat-icon-box" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
                <div style={{ marginTop: '8px', color: stat.trend.startsWith('+') ? '#10b981' : '#ef4444', fontSize: '0.75rem', fontWeight: 800 }}>{stat.trend} <span style={{ color: '#94a3b8', fontWeight: 500 }}>que Mars</span></div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* The Re-styled Table */}
        <div className="table-container">
          <div className="table-header-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}></div>
              <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feuille de présence hebdomadaire</h3>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#f1f5f9', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Format PDF</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', background: '#1e293b', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, color: 'white' }}>
                Mars 2024 <ChevronDown size={18} />
              </button>
            </div>
          </div>

          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '2.5rem', width: '80px' }}>Ref</th>
                <th>Informations Étudiant</th>
                <th colSpan="2" style={{ textAlign: 'center', background: '#fff7ed' }}>Mardi</th>
                <th colSpan="2" style={{ textAlign: 'center', background: '#f0fdf4' }}>Mercredi</th>
                <th colSpan="2" style={{ textAlign: 'center', background: '#eff6ff' }}>Samedi</th>
                <th>Règlement</th>
                <th>Annotations</th>
                <th style={{ width: '80px' }}></th>
              </tr>
              <tr style={{ background: '#f8fafc', fontSize: '9px' }}>
                <th colSpan="2"></th>
                <th style={{ textAlign: 'center', borderRight: '1px solid #eef2f6' }}>Matin</th>
                <th style={{ textAlign: 'center' }}>A.Midi</th>
                <th style={{ textAlign: 'center', borderRight: '1px solid #eef2f6' }}>Matin</th>
                <th style={{ textAlign: 'center' }}>A.Midi</th>
                <th style={{ textAlign: 'center', borderRight: '1px solid #eef2f6' }}>Matin</th>
                <th style={{ textAlign: 'center' }}>A.Midi</th>
                <th colSpan="3"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredStudents.map((student, idx) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    key={student.id}
                  >
                    <td style={{ paddingLeft: '2.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>#{String(student.id).padStart(3, '0')}</td>
                    <td>
                      <div className="student-info">
                        <div className="student-avatar">{student.name.charAt(0)}</div>
                        <span className="student-name">{student.name}</span>
                      </div>
                    </td>

                    {/* Attendance Toggles */}
                    {['tue_m', 'tue_a', 'wed_m', 'wed_a', 'sat_m', 'sat_a'].map(session => (
                      <td key={session} style={{ textAlign: 'center' }}>
                        <div className={`presence-toggle ${student.attendance[session] ? 'active' : ''}`} onClick={() => toggleAttendance(student.id, session)}>
                          {student.attendance[session] && <CircleCheckBig size={14} />}
                        </div>
                      </td>
                    ))}

                    <td>
                      <select
                        value={student.payment || 'PENDING'}
                        onChange={(e) => updatePayment(student.id, e.target.value)}
                        className={`status-select ${getStatusClass(student.payment)}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="OK">RÉGLÉ (OK)</option>
                        <option value="NN">DÉFAUT (NN)</option>
                        <option value="RESTE">RESTE À PAYER</option>
                      </select>
                    </td>

                    <td style={{ width: '220px' }}>
                      <input type="text" placeholder="Ajouter une note..." defaultValue={student.note} onBlur={(e) => updateNote(student.id, e.target.value)} className="note-input" />
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => deleteStudent(student.id)} style={{ color: '#fda4af', padding: '8px', borderRadius: '8px' }} className="nav-item">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </main>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="modal-content">
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 30, right: 30, color: 'var(--text-muted)' }}><X size={32} /></button>
              <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Nouvelle Inscription</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>Saisissez le nom complet du nouvel étudiant pour lancer le suivi.</p>
              <form onSubmit={addStudent}>
                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Nom de l'étudiant</label>
                  <input autoFocus type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Ex: Mariem Ben Youssef" style={{ width: '100%', padding: '1.25rem', borderRadius: '18px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1.1rem', transition: 'all 0.3s' }} />
                </div>
                <button type="submit" className="btn-primary-modern" style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1.25rem' }}>CONFIRMER L'INSCRIPTION</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
