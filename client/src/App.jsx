import React, { useState, useEffect } from 'react';
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
  CircleCheckBig,
  Archive,
  ArchiveRestore,
  RefreshCcw,
  History,
  AlertTriangle,
  Info,
  Pencil,
  Printer,
  Check,
  FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';


// const API_URL = "https://taher-three.vercel.app/api";
const API_URL = "http://localhost:3000/api";

function App() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPrice, setNewStudentPrice] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentIDImage, setNewStudentIDImage] = useState('');
  const [newStudentDate, setNewStudentDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStudentPayment, setNewStudentPayment] = useState('PENDING');
  const [newStudentPartial, setNewStudentPartial] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('adminToken') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [historyModal, setHistoryModal] = useState({ show: false, student: null });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', title: '', type: 'danger', onConfirm: null });
  const [sessionModal, setSessionModal] = useState({ show: false, sessionId: '', sessionName: '' });
  const [isPendingRecord, setIsPendingRecord] = useState(false);
  const [terminatedSessions, setTerminatedSessions] = useState({});
  const [weekStartDate, setWeekStartDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchSettings = async () => {
    try {
      const ts = await fetch(`${API_URL}/settings/terminatedSessions`).then(r => r.json());
      const wd = await fetch(`${API_URL}/settings/weekStartDate`).then(r => r.json());
      if (ts) setTerminatedSessions(ts);
      if (wd) setWeekStartDate(wd);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchStudents();
      fetchSettings();
    }
  }, [isLoggedIn]);

  const getDayDate = (baseDate, daysToAdd) => {
    if (!baseDate) return '';
    const date = new Date(baseDate);
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const defaultSchedule = {
    tue_m: true,
    tue_a: true,
    wed_m: true,
    wed_a: true,
    thu_m: true,
    thu_a: true,
    fri_m: true,
    fri_a: true,
    sat_m: true,
    sat_a: true,
    sun_m: true
  };

  const defaultAttendance = {
    tue_m: 0,
    tue_a: 0,
    wed_m: 0,
    wed_a: 0,
    thu_m: 0,
    thu_a: 0,
    fri_m: 0,
    fri_a: 0,
    sat_m: 0,
    sat_a: 0,
    sun_m: 0
  };

  const sessionOffsets = {
    tue_m: 0,
    tue_a: 0,
    wed_m: 1,
    wed_a: 1,
    thu_m: 2,
    thu_a: 2,
    fri_m: 3,
    fri_a: 3,
    sat_m: 4,
    sat_a: 4,
    sun_m: 5
  };

  const DAYS_CONFIG = [
    {
      day: 'Mardi',
      offset: 0,
      bg: '#fff7ed',
      sessions: [
        { id: 'tue_m', label: 'Matin', name: 'Mardi Matin' },
        { id: 'tue_a', label: 'A.Midi', name: 'Mardi A.Midi' }
      ]
    },
    {
      day: 'Mercredi',
      offset: 1,
      bg: '#f0fdf4',
      sessions: [
        { id: 'wed_m', label: 'Matin', name: 'Mercredi Matin' },
        { id: 'wed_a', label: 'A.Midi', name: 'Mercredi A.Midi' }
      ]
    },
    {
      day: 'Jeudi',
      offset: 2,
      bg: '#fefce8',
      sessions: [
        { id: 'thu_m', label: 'Matin', name: 'Jeudi Matin' },
        { id: 'thu_a', label: 'A.Midi', name: 'Jeudi A.Midi' }
      ]
    },
    {
      day: 'Vendredi',
      offset: 3,
      bg: '#f0fdfa',
      sessions: [
        { id: 'fri_m', label: 'Matin', name: 'Vendredi Matin' },
        { id: 'fri_a', label: 'A.Midi', name: 'Vendredi A.Midi' }
      ]
    },
    {
      day: 'Samedi',
      offset: 4,
      bg: '#eff6ff',
      sessions: [
        { id: 'sat_m', label: 'Matin', name: 'Samedi Matin' },
        { id: 'sat_a', label: 'A.Midi', name: 'Samedi A.Midi' }
      ]
    },
    {
      day: 'Dimanche',
      offset: 5,
      bg: '#faf5ff',
      sessions: [
        { id: 'sun_m', label: 'seule séance', name: 'Dimanche (séance unique)', headerLabel: 'unique', terminateLabel: 'Term' }
      ]
    }
  ];

  const SESSIONS_CONFIG = DAYS_CONFIG.flatMap(d => d.sessions);

  const isSessionScheduled = (student, sessionId) => {
    if (!student || !student.schedule) return true;
    return Boolean(student.schedule[sessionId]);
  };
  const [newStudentSchedule, setNewStudentSchedule] = useState(defaultSchedule);

  const [editModal, setEditModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentPrice, setEditStudentPrice] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editStudentIDImage, setEditStudentIDImage] = useState('');
  const [editStudentDate, setEditStudentDate] = useState('');
  const [editStudentSchedule, setEditStudentSchedule] = useState(defaultSchedule);
  const [editStudentPayment, setEditStudentPayment] = useState('PENDING');
  const [editStudentPartial, setEditStudentPartial] = useState(0);

  const requestConfirm = (title, message, type, action) => {
    setConfirmDialog({ show: true, title, message, type, onConfirm: action });
  };

  const getMaxSessions = (schedule) => {
    if (!schedule) return 8;
    const activeDays = Object.keys(schedule).filter(k => schedule[k] === true);
    if (activeDays.length === 1 && activeDays[0] === 'sun_m') return 5;
    return 8;
  };



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
      const res = await fetch(`${API_URL}/students`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error("API returned non-array:", data);
        setStudents([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const syncStudent = async (student) => {
    try {
      const res = await fetch(`${API_URL}/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student)
      });
      const data = await res.json();
      setStudents(prev => prev.map(s => s.id === data.id ? data : s));
      return data;
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  const syncBatch = async (updates) => {
    try {
      const res = await fetch(`${API_URL}/students/batch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });
      const data = await res.json();
      setStudents(prev => {
        let newList = [...prev];
        data.forEach(updated => {
          newList = newList.map(s => s.id === updated.id ? updated : s);
        });
        return newList;
      });
      return data;
    } catch (err) {
      console.error("Batch Sync Error:", err);
    }
  };

  const saveData = (newStudentsData) => {
    // This is now a legacy helper for batch local updates, 
    // ideally should be refactored into individual syncStudent calls.
    setStudents(newStudentsData);
  };

  const displayedStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isArchived = Boolean(s.archived);
    const isPending = Boolean(s.isPending);

    if (activeTab === 'archives') return matchesSearch && isArchived && !isPending;
    if (activeTab === 'pending') return matchesSearch && isPending && !isArchived;
    return matchesSearch && !isArchived && !isPending;
  });

  const toggleArchive = async (id) => {
    const student = students.find(s => s.id === id);
    if (!student) return;
    const updated = { ...student, archived: !student.archived };
    await syncStudent(updated);
  };

  const setSessionsCount = async (id, count) => {
    const student = students.find(s => s.id === id);
    if ((student.sessions_count || 0) === count) return;
    const updated = { ...student, sessions_count: count };
    await syncStudent(updated);
  };

  const toggleAttendance = async (studentId, day) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const isNowPresent = (student.attendance?.[day] || 0) === 0;
    const updated = {
      ...student,
      attendance: {
        ...defaultAttendance,
        ...(student.attendance || {}),
        [day]: isNowPresent ? 1 : 0
      }
    };
    await syncStudent(updated);
  };

  const setAttendanceStatus = async (studentId, day, isPresent) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const currentlyPresent = (student.attendance?.[day] || 0) === 1;
    if (currentlyPresent === isPresent) return;

    const updated = {
      ...student,
      attendance: {
        ...defaultAttendance,
        ...(student.attendance || {}),
        [day]: isPresent ? 1 : 0
      }
    };
    await syncStudent(updated);
  };

  const openSessionModal = (sessionId, sessionName) => {
    setSessionModal({ show: true, sessionId, sessionName });
  };

  const terminateSession = (sessionId, sessionName) => {
    if (terminatedSessions[sessionId]) return;
    requestConfirm(
      "Clôturer la séance",
      `Voulez-vous clôturer la séance "${sessionName}"?`,
      "info",
      async () => {
        const batchUpdates = [];
        students.forEach(s => {
          if (isSessionScheduled(s, sessionId) && !s.archived) {
            const isPresent = s.attendance && s.attendance[sessionId] === 1;
            const sessionDate = getDayDate(weekStartDate, sessionOffsets[sessionId] || 0);

            const newLog = {
              date: sessionDate,
              name: sessionName,
              present: isPresent
            };
            const currentLog = [...(s.session_log || []), newLog];
            const maxS = getMaxSessions(s.schedule);
            let nextCount = (s.sessions_count || 0) + 1;

            if (nextCount > maxS) {
              nextCount = 1;
            }

            const total = currentLog.length;
            const currentPaidCycles = s.paid_cycles || [];
            let recalUnpaid = 0;
            for (let i = 0; i < 12; i++) {
              const rowLogs = Math.max(0, Math.min(maxS, total - i * maxS));
              if (rowLogs > 0 && !currentPaidCycles.includes(i)) recalUnpaid += rowLogs;
            }

            const nextPayment = recalUnpaid > 0 ? 'PENDING' : 'OK';

            batchUpdates.push({
              id: s.id,
              session_log: currentLog,
              sessions_count: nextCount,
              payment: nextPayment,
              unpaid_count: recalUnpaid,
              attendance: { ...defaultAttendance, ...(s.attendance || {}), [sessionId]: 0 }
            });
          }
        });

        await syncBatch(batchUpdates);
        const newTS = { ...terminatedSessions, [sessionId]: true };
        setTerminatedSessions(newTS);
        await fetch(`${API_URL}/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "terminatedSessions", value: newTS })
        });
      }
    );
  };

  const toggleLogStatus = async (studentId, globalIndex) => {
    const student = students.find(s => s.id === studentId);
    if (!student || !student.session_log) return;

    const newLog = [...student.session_log];
    const current = newLog[globalIndex];
    if (!current) return;

    let nextStatus;
    if (current.status === 'delayed') {
      nextStatus = 'present';
    } else if (current.present === true || current.status === 'present') {
      nextStatus = 'absent';
    } else {
      nextStatus = 'delayed';
    }

    newLog[globalIndex] = {
      ...current,
      present: nextStatus === 'present',
      status: nextStatus
    };

    const updated = { ...student, session_log: newLog };
    await syncStudent(updated);
  };

  const handlePrintSession = () => {
    const studentsToPrint = activeStudentsList.filter(s => isSessionScheduled(s, sessionModal.sessionId));
    const printWindow = window.open('', '_blank');

    const html = `
      <html>
        <head>
          <title>Feuille d'appel - ${sessionModal.sessionName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; direction: rtl; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
            h1 { margin: 0; color: #1e293b; font-size: 24px; }
            .session-info { color: #64748b; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px 15px; text-align: right; }
            th { background-color: #f8fafc; color: #475569; font-weight: bold; text-transform: uppercase; font-size: 12px; }
            .check-box { width: 20px; height: 20px; border: 2px solid #cbd5e1; border-radius: 4px; display: inline-block; vertical-align: middle; }
            .attendance-cell { width: 100px; text-align: center; }
            .student-name { font-weight: 700; color: #1e293b; }
            .date-stamp { font-size: 14px; color: #64748b; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Atelier Taher - ورقة الحضور</h1>
              <div class="session-info">الحصة: ${sessionModal.sessionName}</div>
            </div>
            <div class="date-stamp">التاريخ: ${new Date().toLocaleDateString('fr-FR')}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="text-align: right;">اسم التلميذ</th>
                <th class="attendance-cell">حاضر (Présent)</th>
                <th class="attendance-cell">غائب (Absent)</th>
                <th style="text-align: right;">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${studentsToPrint.map(s => {
      const maxS = getMaxSessions(s.schedule);
      const needsToPay = (s.sessions_count || 0) >= maxS || (s.payment !== 'OK');
      const dangerous = s.payment !== 'OK' && (s.sessions_count || 0) >= 1 && (s.sessions_count || 0) < maxS;
      return `
                <tr>
                  <td class="student-name">
                    ${s.name}
                    ${needsToPay ? `<span style="margin-right: 10px; color: ${dangerous ? '#ef4444' : '#f59e0b'}; font-size: 10px; font-weight: 900; border: 1.5px solid ${dangerous ? '#ef4444' : '#f59e0b'}; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">يجب الدفع${dangerous ? ' !!!' : ''}</span>` : ''}
                    ${s.note ? `<div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 5px; border-top: 1px dotted #e2e8f0; padding-top: 4px;">${s.note}</div>` : ''}
                  </td>
                  <td class="attendance-cell"><div class="check-box"></div></td>
                  <td class="attendance-cell"><div class="check-box"></div></td>
                  <td>${s.payment !== 'OK' && Math.max(s.unpaid_count || 0, s.sessions_count || 0) > 0 ? `<span style="color: #ef4444; font-weight: bold;">انتباه: ${Math.max(s.unpaid_count || 0, s.sessions_count || 0)} حصص بدون خلاص</span>` : ''}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>

          <script>
            window.onload = () => {
              // window.print();
              // window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    // I will let the user click print in that window or do it automatically
    // The user might want to see it first.
    // For now I'll use window.print()
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const resetWeek = () => {
    requestConfirm(
      "Nouvelle Semaine",
      "Voulez-vous archiver cette semaine (sauvegarder l'historique) et effacer la grille ?",
      "info",
      async () => {
        const currentDate = new Date().toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });

        const batchUpdates = students.map(s => ({
          id: s.id,
          history: [...(s.history || []), { date: currentDate, attendance: { ...(s.attendance || {}) } }],
          attendance: { ...defaultAttendance }
        }));

        await syncBatch(batchUpdates);
        setTerminatedSessions({});
        await fetch(`${API_URL}/settings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "terminatedSessions", value: {} }) });

        const nextWeek = new Date(weekStartDate);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        setWeekStartDate(nextWeekStr);
        await fetch(`${API_URL}/settings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "weekStartDate", value: nextWeekStr }) });
      }
    );
  };

  const updatePayment = async (id, status, amount = 0) => {
    const student = students.find(s => s.id === id);
    if (!student) return;

    const maxS = getMaxSessions(student.schedule);
    const total = student.session_log ? student.session_log.length : 0;
    let newPaidCycles = [...(student.paid_cycles || [])];
    let nextPartial = student.partial_amount || 0;

    if (status === 'OK') {
      for (let i = 0; i < 12; i++) {
        const rowLogs = Math.max(0, Math.min(maxS, total - i * maxS));
        if (rowLogs > 0 && !newPaidCycles.includes(i)) {
          newPaidCycles.push(i);
          nextPartial = 0;
          break;
        }
      }
    } else if (status === 'PENDING') {
      if (newPaidCycles.length > 0) {
        const last = Math.max(...newPaidCycles);
        newPaidCycles = newPaidCycles.filter(c => c !== last);
      }
      nextPartial = 0;
    } else if (status === 'PARTIAL') {
      nextPartial = amount;
    }

    let nextUnpaid = 0;
    for (let i = 0; i < 12; i++) {
      const rowLogs = Math.max(0, Math.min(maxS, total - i * maxS));
      if (rowLogs > 0 && !newPaidCycles.includes(i)) {
        nextUnpaid += rowLogs;
      }
    }

    const finalStatus = (status === 'PARTIAL') ? 'PARTIAL' : (nextUnpaid > 0 ? 'PENDING' : 'OK');

    const updated = {
      ...student,
      payment: finalStatus,
      sessions_count: (finalStatus === 'OK' && (student.sessions_count || 0) === maxS) ? 0 : student.sessions_count,
      paid_cycles: newPaidCycles,
      unpaid_count: nextUnpaid,
      partial_amount: nextPartial
    };
    await syncStudent(updated);
  };

  const updateNote = async (id, val) => {
    const student = students.find(s => s.id === id);
    if (!student) return;
    const updated = { ...student, note: val };
    await syncStudent(updated);
  };

  const addStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName || !newStudentPhone || !newStudentPrice) {
      alert("يرجى إكمال جميع البيانات");
      return;
    }

    const isAnyDaySelected = Object.values(newStudentSchedule).some(v => v === true);
    if (!isAnyDaySelected) {
      alert("يرجى اختيار يوم واحد على الأقل");
      return;
    }

    const newS = {
      name: newStudentName,
      price: Number(newStudentPrice) || 0,
      phone: newStudentPhone,
      registrationDate: newStudentDate,
      idCard: newStudentIDImage,
      isPending: isPendingRecord,
      attendance: { ...defaultAttendance },
      schedule: newStudentSchedule,
      payment: newStudentPayment,
      note: '',
      archived: false,
      sessions_count: 0,
      unpaid_count: 0,
      partial_amount: newStudentPayment === 'PARTIAL' ? Number(newStudentPartial) : 0,
      paid_cycles: newStudentPayment === 'OK' ? [0] : [],
      history: []
    };

    try {
      const res = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newS)
      });
      const saved = await res.json();
      setStudents([...students, saved]);
    } catch (err) {
      console.error(err);
    }

    setNewStudentName('');
    setNewStudentPrice('');
    setNewStudentPhone('');
    setNewStudentIDImage('');
    setIsPendingRecord(false);
    setNewStudentDate(new Date().toISOString().split('T')[0]);
    setNewStudentPayment('PENDING');
    setNewStudentPartial(0);
    setNewStudentSchedule(defaultSchedule);
    setShowModal(false);
  };

  const openEditModal = (s) => {
    setEditingStudentId(s.id);
    setEditStudentName(s.name);
    setEditStudentPrice(s.price);
    setEditStudentPhone(s.phone || '');
    setEditStudentIDImage(s.idCard || '');
    setEditStudentDate(s.registrationDate || '');
    const currentSched = s.schedule || {};
    const filledSched = {};
    SESSIONS_CONFIG.forEach(sess => {
      filledSched[sess.id] = currentSched[sess.id] !== undefined ? Boolean(currentSched[sess.id]) : false;
    });
    setEditStudentSchedule(s.schedule ? filledSched : defaultSchedule);
    setEditStudentPayment(s.payment || 'PENDING');
    setEditStudentPartial(s.partial_amount || 0);
    setEditModal(true);
  };

  const saveEdition = async (e) => {
    e.preventDefault();
    if (!editStudentName) return;

    const student = students.find(s => s.id === editingStudentId);
    if (!student) return;

    const isAnyDaySelected = Object.values(editStudentSchedule).some(v => v === true);
    if (!isAnyDaySelected) {
      alert("يرجى اختيار يوم واحد على الأقل");
      return;
    }

    const updated = {
      ...student,
      name: editStudentName,
      price: Number(editStudentPrice) || 0,
      phone: editStudentPhone,
      registrationDate: editStudentDate,
      idCard: editStudentIDImage,
      schedule: editStudentSchedule,
      payment: editStudentPayment,
      partial_amount: editStudentPayment === 'PARTIAL' ? Number(editStudentPartial) : 0
    };

    await syncStudent(updated);
    setEditModal(false);
  };

  const handleFileChange = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'new') {
          setNewStudentIDImage(reader.result);
        } else {
          setEditStudentIDImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteStudent = (id) => {
    requestConfirm(
      "Suppression Définitive",
      "Voulez-vous vraiment supprimer cet étudiant ?",
      "danger",
      async () => {
        try {
          await fetch(`${API_URL}/students/${id}`, { method: "DELETE" });
          setStudents(prev => prev.filter(s => s.id !== id));
        } catch (err) {
          console.error(err);
        }
      }
    );
  };

  const deleteHistoryCard = (studentId, historyIndex) => {
    requestConfirm(
      "Supprimer l'historique",
      "Voulez-vous vraiment supprimer la sauvegarde ?",
      "danger",
      async () => {
        const student = students.find(s => s.id === studentId);
        if (!student) return;
        const newHistory = [...student.history];
        newHistory.splice(historyIndex, 1);

        const updated = await syncStudent({ ...student, history: newHistory });
        setHistoryModal(prev => ({ ...prev, student: updated }));
      }
    );
  };

  const deleteAllStudents = () => {
    requestConfirm(
      "⚠️ حذف جميع التلاميذ",
      `هل أنت متأكد من حذف جميع التلاميذ (${students.length})؟ هذا الإجراء لا يمكن التراجع عنه!`,
      "danger",
      async () => {
        try {
          await Promise.all(students.map(s => fetch(`${API_URL}/students/${s.id}`, { method: "DELETE" })));
          setStudents([]);
        } catch (err) {
          console.error("Delete All Error:", err);
        }
      }
    );
  };

  const resetAllSessions = () => {
    requestConfirm(
      "🔄 تصفير العداد لجميع التلاميذ",
      `هل أنت متأكد من تصفير عدد الحصص والديون (Séances sans paiement) لجميع التلاميذ للبدء من الصفر؟`,
      "danger",
      async () => {
        try {
          const batchUpdates = students.map(s => ({
            id: s.id,
            sessions_count: 0,
            unpaid_count: 0,
            partial_amount: 0,
            payment: 'PENDING',
            paid_cycles: [],
            session_log: [],
            attendance: { ...defaultAttendance }
          }));
          await syncBatch(batchUpdates);
        } catch (err) {
          console.error("Reset All Error:", err);
        }
      }
    );
  };

  const activeStudentsList = students.filter(s => !s.archived);

  const stats = {
    total: activeStudentsList.length,
    presentToday: activeStudentsList.filter(s => Object.values(s.attendance || {}).some(v => v === 1)).length,
    pendingPayment: activeStudentsList.filter(s => s.payment === 'NN' || s.payment === 'RESTE' || (s.sessions_count || 0) === getMaxSessions(s.schedule)).length,
    revenue: activeStudentsList.filter(s => s.payment === 'OK').reduce((sum, s) => sum + (s.price || 0), 0)
  };

  const financeStats = activeStudentsList.reduce((acc, s) => {
    const maxS = getMaxSessions(s.schedule);
    const paidSum = (s.paid_cycles || []).length * (s.price || 0);
    const partial = Number(s.partial_amount || 0);
    const unpaidCyclesCount = Math.ceil((s.unpaid_count || 0) / maxS);
    const unpaidSum = (unpaidCyclesCount * (s.price || 0)) - partial;

    acc.totalExpected += paidSum + partial + unpaidSum;
    acc.collected += paidSum + partial;
    acc.pendingAmount += unpaidSum;
    return acc;
  }, { totalExpected: 0, collected: 0, pendingAmount: 0 });
  const collectionRate = financeStats.totalExpected ? Math.round((financeStats.collected / financeStats.totalExpected) * 100) : 0;

  const getStatusClass = (status) => {
    switch (status) {
      case 'OK': return 'status-ok';
      case 'PARTIAL': return 'status-partial';
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
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              placeholder="Clé d'administration"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p style={{ color: '#fb7185', fontSize: '0.9rem', margin: '0', fontWeight: 600 }}>{error}</p>}
            <button type="submit" className="login-btn">
              DÉVERROUILLER L'ACCÈS <ArrowRight size={20} style={{ marginLeft: '10px' }} />
            </button>
          </form>
          <p style={{ marginTop: '3rem', color: '#475569', fontSize: '0.85rem' }}>SYSTÈME DE SÉCURITÉ ACTIF © 2026</p>
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
          <button className={`nav-item ${activeTab === 'archives' ? 'active' : ''}`} onClick={() => setActiveTab('archives')}><Archive size={22} /> Archives</button>
          <button className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}><Clock size={22} /> En attente</button>
          <button className={`nav-item ${activeTab === 'finances' ? 'active' : ''}`} onClick={() => setActiveTab('finances')}><DollarSign size={22} /> Finances & Rapports</button>
          <button className={`nav-item ${activeTab === 'json_page' ? 'active' : ''}`} onClick={() => setActiveTab('json_page')}><FileJson size={22} /> JSON Page</button>
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
        <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '3.2rem', color: 'var(--primary)', lineHeight: 1.1 }}>
              {activeTab === 'archives' ? 'Archives' : activeTab === 'pending' ? 'En attente' : activeTab === 'finances' ? 'Finances & Rapports' : activeTab === 'json_page' ? 'JSON Page' : "Vue d'ensemble"}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.3rem', marginTop: '0.5rem' }}>
              {activeTab === 'archives' ? 'Étudiants archivés. Vous pouvez les restaurer à tout moment.' : activeTab === 'pending' ? 'Liste des étudiants en attente de démarrage.' : activeTab === 'finances' ? 'Suivi du chiffre d\'affaires, paiements et recouvrements.' : activeTab === 'json_page' ? 'Exporter les données des élèves au format JSON.' : 'Suivez la progression et les règlements en temps réel.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '10px' }}>
            <div className="search-container">
              <Search size={22} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" placeholder="Rechercher par nom..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button
              className="btn-primary-modern"
              onClick={resetAllSessions}
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 20px rgba(245,158,11,0.4)', color: 'white' }}
              title="تصفير جميع الحصص للدفعات"
            >
              <RefreshCcw size={22} /> تصفير الحصص
            </button>
            <button
              className="btn-primary-modern"
              onClick={deleteAllStudents}
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 20px rgba(239,68,68,0.4)' }}
              title="حذف جميع التلاميذ"
            >
              <Trash2 size={22} /> حذف الكل
            </button>
            <button className="btn-primary-modern" onClick={() => setShowModal(true)}>
              <Plus size={24} /> Ajouter Étudiant
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && null}

        {activeTab === 'finances' && (
          <section className="stats-grid">
            {[
              { label: 'Effectif Total', value: stats.total, color: '#3b82f6', bg: '#eff6ff', icon: <Users size={28} /> },
              { label: 'Recettes Réelles (Encaissé)', value: `${financeStats.collected} DT`, color: '#10b981', bg: '#ecfdf5', icon: <CircleCheckBig size={28} /> },
              { label: 'Montant Global (Prévu)', value: `${financeStats.totalExpected} DT`, color: '#8b5cf6', bg: '#f5f3ff', icon: <TrendingUp size={28} /> },
              { label: 'Reste à Recouvrer (Dettes)', value: `${financeStats.pendingAmount} DT`, color: '#ef4444', bg: '#fef2f2', icon: <Clock size={28} /> },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
                <div className="stat-icon-box" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </section>
        )}

        {activeTab === 'finances' && (
          <div className="table-container">
            <div className="table-header-box" style={{ background: 'linear-gradient(to right, #fdf4ff, #fff)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#d946ef', boxShadow: '0 0 10px #d946ef' }}></div>
                <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rapport Mensuel des Revenus
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#f1f5f9', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Exporter Rapport</button>
              </div>
            </div>
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '2.5rem' }}>Mois / الشهر</th>
                  <th style={{ textAlign: 'center' }}>Année / السنة</th>
                  <th style={{ textAlign: 'center' }}>Total Revenus / مجموع المداخيل</th>
                  <th style={{ textAlign: 'center' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                  const currentMonthIdx = new Date().getMonth();
                  const monthlyData = months.map((m, idx) => {
                    let total = 0;
                    students.forEach(s => {
                      if (s.registrationDate) {
                        const reg = new Date(s.registrationDate);
                        const start = reg.getMonth();
                        (s.paid_cycles || []).forEach(cIdx => {
                          if ((start + cIdx) % 12 === idx) total += (s.price || 0);
                        });
                      }
                      // Current month partial
                      if (idx === currentMonthIdx && s.payment === 'PARTIAL') total += Number(s.partial_amount || 0);
                    });
                    return { month: m, total, year: 2026, isPast: idx < currentMonthIdx, isCurrent: idx === currentMonthIdx };
                  });

                  return monthlyData.map((d, i) => (
                    <tr key={i} style={{ opacity: d.total === 0 && !d.isCurrent && !d.isPast ? 0.6 : 1 }}>
                      <td style={{ paddingLeft: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{d.month}</td>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>{d.year}</td>
                      <td style={{ textAlign: 'center', fontWeight: 900, fontSize: '1.2rem', color: d.total > 0 ? '#10b981' : '#94a3b8' }}>{d.total} DT</td>
                      <td style={{ textAlign: 'center' }}>
                        {d.total > 0 ? (
                          <span style={{ background: d.isCurrent ? '#eff6ff' : '#ecfdf5', color: d.isCurrent ? '#2563eb' : '#059669', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                            {d.isCurrent ? 'EN COURS' : 'CLÔTURÉ'}
                          </span>
                        ) : (
                          <span style={{ background: '#f1f5f9', color: '#94a3b8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>VIDE</span>
                        )}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'json_page' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="table-container" style={{ padding: '2.5rem' }}>
            <div className="table-header-box" style={{ background: 'linear-gradient(to right, #ecfdf5, #fff)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 15px #10b981' }}></div>
                <div>
                  <h3 style={{ fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Exportation des Données (JSON)
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>JSON Page / صفحة البيانات</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => {
                    const dataToExport = students.map(s => ({
                      "الاسم": s.name,
                      "رقم الهاتف": s.phone,
                      "أيام الدراسة": Object.keys(s.schedule || {}).filter(day => s.schedule[day]).join(' - '),
                      "الثمن (Tarif DT)": s.price
                    }));
                    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `data_eleves_${new Date().toISOString().split('T')[0]}.json`;
                    link.click();
                  }}
                  className="btn-primary-modern" 
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                >
                  <FileJson size={20} /> تحميل ملف JSON
                </button>
              </div>
            </div>

            <div style={{ 
              position: 'relative', 
              background: '#0f172a', 
              borderRadius: '20px', 
              padding: '2rem',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '1rem', 
                right: '2rem', 
                display: 'flex', 
                gap: '8px' 
              }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }}></div>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }}></div>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }}></div>
              </div>
              
              <pre style={{ 
                margin: 0,
                color: '#38bdf8', 
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                overflow: 'auto',
                maxHeight: '600px',
                paddingTop: '1rem'
              }}>
                {JSON.stringify(students.map(s => ({
                  "الاسم": s.name,
                  "رقم الهاتف": s.phone,
                  "أيام الدراسة": Object.keys(s.schedule || {}).filter(day => s.schedule[day]).join(' - '),
                  "الثمن (Tarif DT)": s.price
                })), null, 4)}
              </pre>
            </div>
          </motion.div>
        )}

        {activeTab !== 'finances' && activeTab !== 'json_page' && (
          <div className="table-container">
            <div className="table-header-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: activeTab === 'archives' ? '#94a3b8' : 'var(--accent)', boxShadow: activeTab === 'archives' ? 'none' : '0 0 10px var(--accent)' }}></div>
                <h3 style={{ fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {activeTab === 'archives' ? 'Liste des Archivés' : activeTab === 'pending' ? 'Liste d\'attente' : 'Feuille de présence hebdomadaire'}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '0.5rem 1rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Date du Mardi:</span>
                  <input
                    type="date"
                    value={weekStartDate}
                    onChange={(e) => {
                      setWeekStartDate(e.target.value);
                      localStorage.setItem('atelierTaherWeekStart', e.target.value);
                    }}
                    style={{ border: 'none', outline: 'none', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer' }}
                  />
                </div>
                <button onClick={resetWeek} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', fontSize: '0.9rem', fontWeight: 800, color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                  <RefreshCcw size={16} /> Nouvelle Semaine
                </button>
                <button style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#f1f5f9', fontSize: '0.9rem', fontWeight: 700, color: '#475569', border: 'none' }}>Format PDF</button>
              </div>
            </div>

            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '2.5rem' }}>Informations Étudiant</th>
                  {DAYS_CONFIG.map(d => (
                    <th key={d.day} colSpan={d.sessions.length} style={{ textAlign: 'center', background: d.bg }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{getDayDate(weekStartDate, d.offset)}</span>
                        <span>{d.day}</span>
                      </div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', background: '#f8fafc', width: '160px' }}>Cycle (8 Séances)</th>
                  <th>Règlement</th>
                  <th>Annotations</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
                <tr style={{ background: '#f8fafc', fontSize: '9px' }}>
                  <th colSpan="1"></th>
                  {SESSIONS_CONFIG.map(session => (
                    <th key={session.id} style={{ textAlign: 'center', borderRight: '1px solid #eef2f6', padding: '8px 4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                        <div
                          onClick={() => openSessionModal(session.id, session.name)}
                          className="session-header-btn"
                          style={{ cursor: 'pointer', width: '100%' }}
                          title="Liste d'appel pour cette séance"
                        >
                          {session.headerLabel || session.label}
                        </div>
                        <button
                          disabled={terminatedSessions[session.id]}
                          onClick={(e) => { e.stopPropagation(); terminateSession(session.id, session.name); }}
                          style={{
                            background: terminatedSessions[session.id] ? '#cbd5e1' : '#10b981',
                            color: terminatedSessions[session.id] ? '#64748b' : 'white',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '9px',
                            fontWeight: 800,
                            border: 'none',
                            cursor: terminatedSessions[session.id] ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          <CheckCircle2 size={10} /> {terminatedSessions[session.id] ? 'Terminée' : (session.terminateLabel || 'Terminer')}
                        </button>
                      </div>
                    </th>
                  ))}
                  <th></th>
                  <th colSpan="3"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {displayedStudents.map((student, idx) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      key={student.id}
                      style={{ background: (student.unpaid_count || 0) >= 1 ? '#fff1f2' : 'inherit' }}
                    >
                      <td style={{ paddingLeft: '2.5rem' }}>
                        <div className="student-info" style={{ position: 'relative' }}>
                          {(student.sessions_count >= 2 && student.payment !== 'OK') && (
                            <div style={{ position: 'absolute', top: -5, left: -20, background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px', border: '2px solid white', zIndex: 10 }} title="Attention: 2+ séances sans paiement">
                              <AlertTriangle size={12} />
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="student-name" style={{ lineHeight: 1.2 }}>{student.name}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>{student.price || 0} DT / {getMaxSessions(student.schedule)} Séances</span>
                          </div>
                        </div>
                      </td>

                      {SESSIONS_CONFIG.map(session => {
                        const isScheduled = isSessionScheduled(student, session.id);
                        const isAttended = student.attendance && student.attendance[session.id] === 1;
                        return (
                          <td key={session.id} style={{ textAlign: 'center' }}>
                            <div
                              className={`presence-toggle ${isAttended && isScheduled ? 'active' : ''}`}
                              onClick={() => {
                                if (isScheduled) toggleAttendance(student.id, session.id);
                              }}
                              style={!isScheduled ? { background: '#fef2f2', cursor: 'not-allowed', color: '#ef4444' } : {}}
                              title={isScheduled ? "Marquer présent/absent" : "Non programmé"}
                            >
                              {isScheduled ? (isAttended ? <CircleCheckBig size={14} /> : null) : <X size={14} strokeWidth={3} />}
                            </div>
                          </td>
                        );
                      })}

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center' }}>
                          {[...Array(getMaxSessions(student.schedule))].map((_, i) => {
                            const sessionsCount = student.sessions_count || 0;
                            const isActive = i < sessionsCount;

                            // Find corresponding log entry for this dot
                            // If sessionsCount is 3, these are dots 0, 1, 2.
                            // They correspond to the last 3 entries in session_log.
                            const cycleLogs = student.session_log ? student.session_log.slice(-sessionsCount) : [];
                            const logEntry = isActive ? cycleLogs[i] : null;

                            const isPresent = logEntry ? (logEntry.present === true || logEntry.status === 'present') : false;
                            const isDelayed = logEntry ? logEntry.status === 'delayed' : false;

                            let color = '#e2e8f0';
                            if (isActive) {
                              if (isDelayed) color = '#3b82f6'; // Blue for delayed
                              else if (isPresent) color = '#10b981'; // Green for present
                              else color = '#ef4444'; // Red for absent
                            }

                            return (
                              <div
                                key={i}
                                style={{
                                  width: '12px', height: '12px', borderRadius: '3px',
                                  background: color,
                                  boxShadow: isActive ? `0 0 5px ${color}66` : 'none',
                                  transition: 'all 0.2s',
                                  cursor: 'default'
                                }}
                                title={logEntry ? `${logEntry.name} - ${logEntry.date}` : ''}
                              ></div>
                            );
                          })}
                        </div>
                      </td>

                      <td>
                        {((student.sessions_count || 0) === getMaxSessions(student.schedule) || student.payment !== 'OK') ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {student.payment !== 'OK' && (student.unpaid_count > 0 || student.sessions_count > 0) && (
                              <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <AlertTriangle size={10} /> {Math.max(student.unpaid_count || 0, student.sessions_count || 0)} séances sans paiement !
                              </span>
                            )}
                            <select
                              value={student.payment === 'OK' ? 'payer' : (student.payment === 'PARTIAL' ? 'partial' : 'non_payer')}
                              onChange={(e) => {
                                if (e.target.value === 'partial') {
                                  const amt = prompt('Montant payé (DT) / المبلغ المدفوع:', student.partial_amount || 0);
                                  if (amt !== null) updatePayment(student.id, 'PARTIAL', parseFloat(amt) || 0);
                                } else {
                                  updatePayment(student.id, e.target.value === 'payer' ? 'OK' : 'PENDING');
                                }
                              }}
                              className={`status-select ${getStatusClass(student.payment)}`}
                            >
                              <option value="non_payer">Non Payer / لم يدفع</option>
                              <option value="partial">Paiement Partiel / دفع جزئي</option>
                              <option value="payer">Payer / دفع </option>
                            </select>
                            {student.payment === 'PARTIAL' && (
                              <div style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', background: '#eff6ff', padding: '4px 8px', borderRadius: '6px', border: '1.5px solid #3b82f633' }}>
                                Payé: {student.partial_amount} DT |
                                <span style={{ color: '#ef4444' }}> Reste: {Math.max(0, (student.price || 0) - (student.partial_amount || 0)).toFixed(1)} DT</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <select
                            disabled
                            value="payer"
                            className="status-select"
                            style={{ background: '#f1f5f9', color: '#94a3b8', border: '1.5px solid #e2e8f0', cursor: 'not-allowed', opacity: 0.8 }}
                          >
                            <option value="payer">Payé / تم الخلاص</option>
                          </select>
                        )}
                      </td>

                      <td style={{ width: '220px' }}>
                        <input type="text" placeholder="Ajouter une note..." defaultValue={student.note} onBlur={(e) => updateNote(student.id, e.target.value)} className="note-input" />
                      </td>

                      <td style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => setHistoryModal({ show: true, student: student })} style={{ color: '#3b82f6', padding: '8px', borderRadius: '10px', background: '#eff6ff' }} title="Historique des présences">
                          <History size={20} />
                        </button>
                        <button onClick={() => openEditModal(student)} style={{ color: '#8b5cf6', padding: '8px', borderRadius: '10px', background: '#f5f3ff' }} title="Modifier">
                          <Pencil size={20} />
                        </button>
                        <button onClick={() => toggleArchive(student.id)} style={{ color: activeTab === 'archives' ? '#10b981' : '#d97706', padding: '8px', borderRadius: '10px', background: activeTab === 'archives' ? '#ecfdf5' : '#fffbeb' }} title={activeTab === 'archives' ? 'Restaurer' : 'Archiver'}>
                          {activeTab === 'archives' ? <ArchiveRestore size={20} /> : <Archive size={20} />}
                        </button>
                        {student.isPending && (
                          <button onClick={() => {
                            const newStudents = students.map(s => s.id === student.id ? { ...s, isPending: false } : s);
                            saveData(newStudents);
                          }} style={{ color: '#10b981', padding: '8px', borderRadius: '10px', background: '#ecfdf5' }} title="Démarrer le cycle (Activer)">
                            <CheckCircle2 size={20} />
                          </button>
                        )}
                        <button onClick={() => deleteStudent(student.id)} style={{ color: '#ef4444', padding: '8px', borderRadius: '10px', background: '#fef2f2' }} title="Supprimer définitivement">
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="modal-content">
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 30, right: 30, color: 'var(--text-muted)' }}><X size={32} /></button>
              <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Nouvelle Inscription</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Saisissez le nom complet et définissez les horaires prévus pour cet étudiant.</p>
              <form onSubmit={addStudent}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Nom / الإسم</label>
                    <input autoFocus type="text" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Ex: Mariem Ben Youssef" style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Téléphone / الهاتف</label>
                    <input type="tel" value={newStudentPhone} onChange={(e) => setNewStudentPhone(e.target.value)} placeholder="رقم الهاتف" style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Date d'inscription / التاريخ</label>
                    <input type="date" value={newStudentDate} onChange={(e) => setNewStudentDate(e.target.value)} style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Tarif (DT) / الثمن</label>
                    <input type="number" value={newStudentPrice} onChange={(e) => setNewStudentPrice(e.target.value)} placeholder="Ex: 80" style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>État de paiement / حالة الدفع</label>
                  <select
                    value={newStudentPayment}
                    onChange={(e) => setNewStudentPayment(e.target.value)}
                    style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s', fontWeight: 700, color: newStudentPayment === 'OK' ? '#059669' : (newStudentPayment === 'PARTIAL' ? '#2563eb' : '#b45309'), background: newStudentPayment === 'OK' ? '#ecfdf5' : (newStudentPayment === 'PARTIAL' ? '#eff6ff' : '#fffbeb') }}
                  >
                    <option value="PENDING">Non Payer / لم يدفع بعد</option>
                    <option value="PARTIAL">Paiement Partiel / دفع جزئي</option>
                    <option value="OK">Payer / دفع كامل</option>
                  </select>
                  {newStudentPayment === 'PARTIAL' && (
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: '#64748b' }}>Montant versé (DT) / المبلغ المدفوع</label>
                      <input type="number" value={newStudentPartial} onChange={(e) => setNewStudentPartial(e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '2px solid #3b82f6', outline: 'none' }} />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Carte d'identité / بطاقة التعريف</label>
                  <div style={{ position: 'relative' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'new')} style={{ display: 'none' }} id="new-id-file" />
                    <label htmlFor="new-id-file" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', borderRadius: '15px', border: '2px dashed var(--accent)', background: 'var(--accent-glow)', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700, justifyContent: 'center' }}>
                      {newStudentIDImage ? 'Image sélectionnée ✅' : 'Télécharger la photo de la carte'}
                    </label>
                    {newStudentIDImage && (
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                        <img src={newStudentIDImage} alt="ID card preview" style={{ height: '80px', borderRadius: '10px', boxShadow: 'var(--shadow-md)' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Statut de démarrage / حالة التسجيل</label>
                  <div style={{ display: 'flex', gap: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, color: !isPendingRecord ? 'var(--accent)' : 'var(--text-muted)' }}>
                      <input type="radio" checked={!isPendingRecord} onChange={() => setIsPendingRecord(false)} name="regStatus" style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }} />
                      Actif (Directement au tableau)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, color: isPendingRecord ? 'var(--accent)' : 'var(--text-muted)' }}>
                      <input type="radio" checked={isPendingRecord} onChange={() => setIsPendingRecord(true)} name="regStatus" style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }} />
                      En attente (Liste d'attente)
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Jours de présence prévus (Planning)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {DAYS_CONFIG.map(d => (
                      <div key={d.day} style={{ background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: '#64748b', textTransform: 'uppercase' }}>{d.day}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {d.sessions.map(s => (
                            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: newStudentSchedule[s.id] ? 'var(--primary)' : '#94a3b8' }}>
                              <input
                                type="checkbox"
                                checked={!!newStudentSchedule[s.id]}
                                onChange={(e) => setNewStudentSchedule({ ...newStudentSchedule, [s.id]: e.target.checked })}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                              />
                              {s.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary-modern" style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1.25rem' }}>CRÉER LE DOSSIER</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModal && (
          <div className="modal-overlay">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content">
              <button onClick={() => setEditModal(false)} style={{ position: 'absolute', top: 30, right: 30, color: 'var(--text-muted)' }}><X size={32} /></button>
              <h2 style={{ marginBottom: '1rem', fontSize: '2.5rem' }}>Modifier l'étudiant</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Mettez à jour les informations et le planning de cet étudiant.</p>
              <form onSubmit={saveEdition}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Nom / الإسم</label>
                    <input autoFocus type="text" value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} placeholder="Ex: Mariem Ben Youssef" style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Téléphone / الهاتف</label>
                    <input type="tel" value={editStudentPhone} onChange={(e) => setEditStudentPhone(e.target.value)} placeholder="رقم الهاتف" style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Date d'inscription / التاريخ</label>
                    <input type="date" value={editStudentDate} onChange={(e) => setEditStudentDate(e.target.value)} style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Tarif (DT) / الثمن</label>
                    <input type="number" value={editStudentPrice} onChange={(e) => setEditStudentPrice(e.target.value)} placeholder="Ex: 80" style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>État de paiement / حالة الدفع</label>
                  <select
                    value={editStudentPayment}
                    onChange={(e) => setEditStudentPayment(e.target.value)}
                    style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', border: '2.5px solid var(--border)', outline: 'none', fontSize: '1rem', transition: 'all 0.3s', fontWeight: 700, color: editStudentPayment === 'OK' ? '#059669' : (editStudentPayment === 'PARTIAL' ? '#2563eb' : '#b45309'), background: editStudentPayment === 'OK' ? '#ecfdf5' : (editStudentPayment === 'PARTIAL' ? '#eff6ff' : '#fffbeb') }}
                  >
                    <option value="PENDING">Non Payer / لم يدفع بعد</option>
                    <option value="PARTIAL">Paiement Partiel / دفع جزئي</option>
                    <option value="OK">Payer / دفع كامل</option>
                  </select>
                  {editStudentPayment === 'PARTIAL' && (
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem', color: '#64748b' }}>Montant versé (DT) / المبلغ المدفوع</label>
                      <input type="number" value={editStudentPartial} onChange={(e) => setEditStudentPartial(e.target.value)} placeholder="0" style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '2px solid #3b82f6', outline: 'none' }} />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Carte d'identité / بطاقة التعريف</label>
                  <div style={{ position: 'relative' }}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'edit')} style={{ display: 'none' }} id="edit-id-file" />
                    <label htmlFor="edit-id-file" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', borderRadius: '15px', border: '2px dashed var(--accent)', background: 'var(--accent-glow)', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700, justifyContent: 'center' }}>
                      {editStudentIDImage ? 'Modifier la photo ✅' : 'Télécharger la photo de la carte'}
                    </label>
                    {editStudentIDImage && (
                      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                        <img src={editStudentIDImage} alt="ID card preview" style={{ height: '80px', borderRadius: '10px', boxShadow: 'var(--shadow-md)' }} />
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Jours de présence prévus (Planning)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {DAYS_CONFIG.map(d => (
                      <div key={d.day} style={{ background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', color: '#64748b', textTransform: 'uppercase' }}>{d.day}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {d.sessions.map(s => (
                            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: editStudentSchedule[s.id] ? 'var(--primary)' : '#94a3b8' }}>
                              <input
                                type="checkbox"
                                checked={!!editStudentSchedule[s.id]}
                                onChange={(e) => setEditStudentSchedule({ ...editStudentSchedule, [s.id]: e.target.checked })}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                              />
                              {s.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary-modern" style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1.25rem' }}>ENREGISTRER</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sessionModal.show && (
          <div className="modal-overlay" style={{ zIndex: 1150 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content" style={{ width: 'min(700px, 95vw)', padding: '2.5rem' }}>
              <button onClick={() => setSessionModal({ show: false, sessionId: '', sessionName: '' })} style={{ position: 'absolute', top: 30, right: 30, color: 'var(--text-muted)' }}><X size={32} /></button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Users size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '2rem', margin: 0, color: 'var(--primary)', lineHeight: 1.1 }}>Appel Rapide</h2>
                  <p style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{sessionModal.sessionName}</p>
                </div>
                <button
                  onClick={handlePrintSession}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: '#1e293b',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)',
                    transition: 'all 0.2s',
                    marginLeft: 'auto',
                    marginRight: '60px'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <Printer size={20} /> Imprimer la feuille
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeStudentsList
                  .filter(s => isSessionScheduled(s, sessionModal.sessionId))
                  .map(student => {
                    const isPresent = student.attendance && student.attendance[sessionModal.sessionId] === 1;
                    return (
                      <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>{student.name}</p>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: 600 }}>{student.sessions_count || 0}/{getMaxSessions(student.schedule)} Séances • <span className={getStatusClass(student.payment)} style={{ background: 'transparent', padding: 0 }}>{student.payment}</span></p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                          <div
                            onClick={() => setAttendanceStatus(student.id, sessionModal.sessionId, true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                          >
                            <div style={{
                              width: '28px',
                              height: '28px',
                              border: '2.5px solid #10b981',
                              borderRadius: '8px',
                              background: isPresent ? '#10b981' : 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              transition: 'all 0.2s',
                              boxShadow: isPresent ? '0 4px 10px rgba(16, 185, 129, 0.3)' : 'none'
                            }}>
                              {isPresent && <Check size={18} strokeWidth={3} />}
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isPresent ? '#10b981' : '#64748b' }}>Présent</span>
                          </div>

                          <div
                            onClick={() => setAttendanceStatus(student.id, sessionModal.sessionId, false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                          >
                            <div style={{
                              width: '28px',
                              height: '28px',
                              border: '2.5px solid #ef4444',
                              borderRadius: '8px',
                              background: !isPresent ? '#ef4444' : 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              transition: 'all 0.2s',
                              boxShadow: !isPresent ? '0 4px 10px rgba(239, 68, 68, 0.3)' : 'none'
                            }}>
                              {!isPresent && <X size={18} strokeWidth={3} />}
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: !isPresent ? '#ef4444' : '#64748b' }}>Absent</span>
                          </div>

                          {student.payment === 'OK' && (student.sessions_count || 0) < getMaxSessions(student.schedule) ? (
                            <select
                              disabled
                              value="payer"
                              style={{
                                padding: '5px 8px',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                border: '2px solid #e2e8f0',
                                background: '#f1f5f9',
                                color: '#94a3b8',
                                cursor: 'not-allowed',
                                outline: 'none'
                              }}
                            >
                              <option value="payer">Payé / تم الخلاص</option>
                            </select>
                          ) : (
                            <div style={{ marginLeft: '10px', paddingLeft: '15px', borderLeft: '2px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Règlement</label>
                                {student.payment !== 'OK' && (student.unpaid_count > 0 || student.sessions_count > 0) && <AlertTriangle size={12} color="#ef4444" />}
                              </div>
                              <select
                                value={student.payment === 'OK' ? 'payer' : (student.payment === 'PARTIAL' ? 'partial' : 'non_payer')}
                                onChange={(e) => {
                                  if (e.target.value === 'partial') {
                                    const amt = prompt('Montant payé (DT) / المبلغ المدفوع:', student.partial_amount || 0);
                                    if (amt !== null) updatePayment(student.id, 'PARTIAL', parseFloat(amt) || 0);
                                  } else {
                                    updatePayment(student.id, e.target.value === 'payer' ? 'OK' : 'PENDING');
                                  }
                                }}
                                style={{
                                  padding: '5px 8px',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 800,
                                  border: '2px solid',
                                  borderColor: student.payment === 'OK' ? '#10b981' : (student.payment === 'PARTIAL' ? '#3b82f6' : '#ef4444'),
                                  background: student.payment === 'OK' ? '#ecfdf5' : (student.payment === 'PARTIAL' ? '#eff6ff' : '#fef2f2'),
                                  color: student.payment === 'OK' ? '#059669' : (student.payment === 'PARTIAL' ? '#2563eb' : '#b91c1c'),
                                  cursor: 'pointer',
                                  outline: 'none'
                                }}
                              >
                                <option value="non_payer">Non Payer</option>
                                <option value="partial">Dépôt / دفع جزئي</option>
                                <option value="payer">Payer</option>
                              </select>
                              {student.payment === 'PARTIAL' && (
                                <div style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', marginTop: '2px' }}>
                                  Reste: {Math.max(0, (student.price || 0) - (student.partial_amount || 0)).toFixed(1)} DT
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                {activeStudentsList.filter(s => isSessionScheduled(s, sessionModal.sessionId)).length === 0 && (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0', fontWeight: 600 }}>Aucun étudiant programmé pour cette séance.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {historyModal.show && historyModal.student && (() => {
          const currentStudent = students.find(s => s.id === historyModal.student.id) || historyModal.student;
          return (
            <div className="modal-overlay" style={{ zIndex: 1100 }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content" style={{ width: 'min(800px, 95vw)' }}>
                <button onClick={() => setHistoryModal({ show: false, student: null })} style={{ position: 'absolute', top: 30, right: 30, color: 'var(--text-muted)' }}><X size={32} /></button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', fontWeight: 800, boxShadow: '0 8px 16px var(--accent-glow)' }}>
                      {currentStudent.name.charAt(0)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '2.2rem', margin: 0, color: 'var(--primary)' }}>Historique</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontWeight: 600 }}>{currentStudent.name}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {currentStudent.session_log && currentStudent.session_log.length > 0 && (
                      <div style={{ background: '#f8fafc', padding: '10px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Séances</p>
                        <p style={{ fontSize: '1.5rem', color: 'var(--accent)', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                          {currentStudent.session_log.filter(l => l.present).length}
                        </p>
                      </div>
                    )}
                    {currentStudent.phone && (
                      <div style={{ background: '#f0f9ff', padding: '10px 20px', borderRadius: '16px', border: '1px solid #bae6fd', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase', marginBottom: '2px' }}>Téléphone</p>
                        <p style={{ fontSize: '1.1rem', color: '#0284c7', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{currentStudent.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <Calendar size={32} color="var(--accent)" />
                    <div>
                      <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Date d'inscription / تاريخ التسجيل</p>
                      <p style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: 800, margin: 0 }}>{currentStudent.registrationDate || '---'}</p>
                    </div>
                  </div>

                  {currentStudent.idCard ? (
                    <div
                      onClick={() => {
                        const w = window.open("");
                        w.document.write(`<img src="${currentStudent.idCard}" style="width:100%; height:auto;" />`);
                      }}
                      style={{ background: '#f1f5f9', borderRadius: '24px', border: '1px solid #e2e8f0', height: '100px', display: 'flex', alignItems: 'center', padding: '1rem', cursor: 'pointer', gap: '15px' }}
                    >
                      <img src={currentStudent.idCard} alt="CIN" style={{ height: '70px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }} />
                      <div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>CIN / بطاقة التعريف</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 800, margin: 0 }}>Cliquer pour agrandir</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#f1f5f9', borderRadius: '24px', border: '1px dashed #cbd5e1', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 700 }}>
                      Aucune photo CIN
                    </div>
                  )}
                </div>

                <div style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', border: '1px solid #eef2f6' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(90deg, #f8fafc, #f1f5f9)' }}>
                        <th style={{ padding: '18px 12px', color: '#475569', borderBottom: '2px solid #e2e8f0', width: '80px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Cycle</th>
                        {[...Array(getMaxSessions(currentStudent.schedule))].map((_, i) => (
                          <th key={i} style={{ padding: '18px 12px', color: '#64748b', borderBottom: '2px solid #e2e8f0', fontWeight: 800, fontSize: '0.9rem' }}>S {i + 1}</th>
                        ))}
                        <th style={{ padding: '18px 12px', color: '#475569', borderBottom: '2px solid #e2e8f0', fontWeight: 800, fontSize: '0.8rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(12)].map((_, rowIdx) => {
                        const maxS = getMaxSessions(currentStudent.schedule);
                        const startIndex = rowIdx * maxS;
                        const isEven = rowIdx % 2 === 0;

                        const totalLogs = currentStudent.session_log ? currentStudent.session_log.length : 0;
                        const rowLogs = Math.max(0, Math.min(maxS, totalLogs - startIndex));

                        const isCyclePaid = (currentStudent.paid_cycles || []).includes(rowIdx);
                        const isCycleStarted = rowLogs > 0;

                        let rowBg = isEven ? '#ffffff' : '#fafafa';
                        let tdCycleBg = isEven ? '#f8fafc' : '#f1f5f9';

                        if (isCycleStarted) {
                          if (isCyclePaid) {
                            rowBg = '#ecfdf5'; // Soft Green
                            tdCycleBg = '#d1fae5';
                          } else {
                            rowBg = '#fef2f2'; // Soft Red warning
                            tdCycleBg = '#fee2e2';
                          }
                        }

                        return (
                          <tr key={rowIdx} style={{ background: rowBg, transition: 'background 0.2s' }}>
                            <td style={{ padding: '12px', fontWeight: 800, color: '#3b82f6', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: tdCycleBg, transition: 'background 0.2s' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                {rowIdx + 1}
                              </div>
                            </td>
                            {[...Array(maxS)].map((_, colIdx) => {
                              const globalIndex = startIndex + colIdx;
                              const logEntry = currentStudent.session_log ? currentStudent.session_log[globalIndex] : null;

                              let iconBg, iconShadow, IconComp;
                              if (logEntry) {
                                const isDelayed = logEntry.status === 'delayed';
                                const isPresent = logEntry.present === true || logEntry.status === 'present';

                                if (isDelayed) {
                                  iconBg = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                                  iconShadow = '0 4px 10px rgba(59, 130, 246, 0.4)';
                                  IconComp = <Clock size={16} strokeWidth={3} />;
                                } else if (isPresent) {
                                  iconBg = 'linear-gradient(135deg, #10b981, #059669)';
                                  iconShadow = '0 4px 10px rgba(16, 185, 129, 0.4)';
                                  IconComp = <CheckCircle2 size={16} />;
                                } else {
                                  iconBg = 'linear-gradient(135deg, #ef4444, #dc2626)';
                                  iconShadow = '0 4px 10px rgba(239, 68, 68, 0.4)';
                                  IconComp = <X size={16} strokeWidth={3} />;
                                }
                              }

                              return (
                                <td key={colIdx} style={{ padding: '10px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', height: '65px', position: 'relative' }}>
                                  {logEntry ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', cursor: 'pointer' }} onClick={() => toggleLogStatus(currentStudent.id, globalIndex)} title="Cliquez pour modifier l'état (Présent/Absent/Reporté)">
                                      <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: iconBg,
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: iconShadow,
                                        transition: 'all 0.2s'
                                      }}>
                                        {IconComp}
                                      </div>
                                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, whiteSpace: 'nowrap' }}>{logEntry.date.slice(0, 5)}</span>
                                      <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1, marginTop: '-2px' }}>{logEntry.name?.includes(' ') ? logEntry.name.split(' ').slice(1).join(' ') : ''}</span>
                                    </div>
                                  ) : (
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #e2e8f0', background: '#f8fafc', margin: '0 auto', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}></div>
                                  )}
                                </td>
                              );
                            })}
                            <td style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
                              {rowLogs > 0 && (() => {
                                const isCyclePaid = (currentStudent.paid_cycles || []).includes(rowIdx);

                                return (
                                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    {!isCyclePaid ? (
                                      <button
                                        onClick={() => {
                                          const newStudents = students.map(s => {
                                            if (s.id === currentStudent.id) {
                                              const newPaid = [...(s.paid_cycles || []), rowIdx];
                                              const total = s.session_log ? s.session_log.length : 0;

                                              let nextUnpaid = 0;
                                              for (let j = 0; j < 12; j++) {
                                                const rLogs = Math.max(0, Math.min(maxS, total - j * maxS));
                                                if (rLogs > 0 && !newPaid.includes(j)) {
                                                  nextUnpaid += rLogs;
                                                }
                                              }

                                              return {
                                                ...s,
                                                paid_cycles: newPaid,
                                                payment: nextUnpaid > 0 ? 'PENDING' : 'OK',
                                                unpaid_count: nextUnpaid,
                                                sessions_count: (s.sessions_count === maxS && nextUnpaid === 0) ? 0 : s.sessions_count
                                              };
                                            }
                                            return s;
                                          });
                                          saveData(newStudents);
                                        }}
                                        style={{ padding: '6px 12px', borderRadius: '8px', background: rowLogs === maxS ? '#ef4444' : '#10b981', color: 'white', border: 'none', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                      >
                                        {rowLogs === maxS ? 'Régler Cycle' : 'Marquer Payé'}
                                      </button>
                                    ) : (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }}>
                                        <CheckCircle2 size={14} />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>Réglé</span>
                                        <button
                                          onClick={() => {
                                            const newStudents = students.map(s => {
                                              if (s.id === currentStudent.id) {
                                                const newPaid = (s.paid_cycles || []).filter(c => c !== rowIdx);
                                                const total = s.session_log ? s.session_log.length : 0;

                                                let nextUnpaid = 0;
                                                for (let j = 0; j < 12; j++) {
                                                  const rLogs = Math.max(0, Math.min(maxS, total - j * maxS));
                                                  if (rLogs > 0 && !newPaid.includes(j)) {
                                                    nextUnpaid += rLogs;
                                                  }
                                                }

                                                return {
                                                  ...s,
                                                  paid_cycles: newPaid,
                                                  payment: 'PENDING',
                                                  unpaid_count: nextUnpaid
                                                };
                                              }
                                              return s;
                                            });
                                            saveData(newStudents);
                                          }}
                                          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', opacity: 0.5 }}
                                          title="Marquer كما غير دافع"
                                        >
                                          <Pencil size={10} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDialog.show && (
          <div className="modal-overlay" style={{ zIndex: 1200 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-content" style={{ width: '450px', padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ margin: '0 auto 1.5rem', width: '64px', height: '64px', borderRadius: '50%', background: confirmDialog.type === 'danger' ? '#fef2f2' : '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: confirmDialog.type === 'danger' ? '#ef4444' : '#3b82f6' }}>
                {confirmDialog.type === 'danger' ? <AlertTriangle size={32} /> : <Info size={32} />}
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>{confirmDialog.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>{confirmDialog.message}</p>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setConfirmDialog({ show: false, message: '', title: '', type: 'danger', onConfirm: null })}
                  style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '1rem', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseOver={(e) => e.target.style.background = '#e2e8f0'}
                  onMouseOut={(e) => e.target.style.background = '#f1f5f9'}
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                    setConfirmDialog({ show: false, message: '', title: '', type: 'danger', onConfirm: null });
                  }}
                  style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: confirmDialog.type === 'danger' ? '#ef4444' : 'var(--accent)', color: 'white', fontWeight: 700, fontSize: '1rem', transition: 'all 0.2s', cursor: 'pointer', boxShadow: confirmDialog.type === 'danger' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px var(--accent-glow)' }}
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
