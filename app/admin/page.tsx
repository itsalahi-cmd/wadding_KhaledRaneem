'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface Guest {
  id: string;
  name: string;
  attendance_status: string;
  companion_count: number;
  ticket_id: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/guests')
      .then((res) => res.json())
      .then((data) => {
        if (data.guests) setGuests(data.guests);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const attendingGroups = guests.filter(g => g.attendance_status === 'attending');
  const mightAttend = guests.filter(g => g.attendance_status === 'might_attend');
  const notAttending = guests.filter(g => g.attendance_status === 'not_attending');

  const totalCompanions = attendingGroups.reduce((acc, curr) => acc + curr.companion_count, 0);
  const totalExpected = attendingGroups.length + totalCompanions;

  if (loading) return <div style={{ padding: '2rem' }}>جاري التحميل...</div>;

  const handleUpdateCompanions = async (id: string, newCount: number) => {
    try {
      const res = await fetch('/api/admin/guests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, companion_count: newCount })
      });
      if (res.ok) {
        setGuests(guests.map(g => g.id === id ? { ...g, companion_count: newCount } : g));
      } else {
        alert('فشل تحديث العدد');
      }
    } catch (err) {
      console.error(err);
      alert('فشل تحديث العدد');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من أنك تريد حذف هذا الضيف؟')) return;
    
    try {
      const res = await fetch('/api/admin/guests', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setGuests(guests.filter(g => g.id !== id));
      } else {
        alert('فشل الحذف');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الحذف');
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'attending': return 'مؤكد الحضور';
      case 'might_attend': return 'محتمل';
      case 'not_attending': return 'معتذر';
      default: return status;
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className={styles.title}>لوحة تحكم الحضور الدائمة (RSVPs)</h1>
        <Link href="/admin/attendance" style={{ color: '#c9a45c', textDecoration: 'underline', fontSize: '1.2rem', fontWeight: 'bold' }}>
          ← الانتقال لسجل الحضور المباشر (البوابة)
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalExpected}</div>
          <div className={styles.statLabel}>إجمالي الحضور الكلي</div>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>( الضيوف + المرافقين )</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{attendingGroups.length}</div>
          <div className={styles.statLabel}>الضيوف المؤكد حضورهم</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalCompanions}</div>
          <div className={styles.statLabel}>إجمالي المرافقين</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{mightAttend.length}</div>
          <div className={styles.statLabel}>المحتمل حضورهم</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{notAttending.length}</div>
          <div className={styles.statLabel}>المعتذرون</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>الاسم</th>
              <th className={styles.th}>الحالة</th>
              <th className={styles.th}>المرافقون</th>
              <th className={styles.th}>رقم التذكرة (QR)</th>
              <th className={styles.th}>تاريخ الإرسال</th>
              <th className={styles.th}>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g.id}>
                <td className={styles.td}><strong>{g.name}</strong></td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${styles[g.attendance_status]}`}>
                    {translateStatus(g.attendance_status)}
                  </span>
                </td>
                <td className={styles.td}>
                  <select 
                    title="تعديل المرافقين"
                    value={g.companion_count} 
                    onChange={(e) => handleUpdateCompanions(g.id, parseInt(e.target.value, 10))}
                    className={styles.companionSelect}
                    disabled={g.attendance_status === 'not_attending'}
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                  </select>
                </td>
                <td className={styles.td}>
                  <span style={{ fontFamily: 'monospace', color: '#666' }}>{g.ticket_id}</span>
                </td>
                <td className={styles.td}>{new Date(g.created_at).toLocaleString('ar-EG')}</td>
                <td className={styles.td}>
                  <button onClick={() => handleDelete(g.id)} className={styles.deleteButton}>
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {guests.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.td} style={{ textAlign: 'center' }}>
                  لا توجد ردود بعد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
