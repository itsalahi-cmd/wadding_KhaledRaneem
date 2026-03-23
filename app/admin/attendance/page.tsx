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
  scanned?: boolean;
  scanned_at?: string;
}

export default function AttendanceDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuests = async () => {
    try {
      const res = await fetch('/api/admin/guests');
      const data = await res.json();
      if (data.guests) {
        // filter out only scanned ones
        const scannedGuests = data.guests.filter((g: Guest) => g.scanned === true);
        // sort by newest scanned first
        scannedGuests.sort((a: Guest, b: Guest) => {
          return new Date(b.scanned_at || 0).getTime() - new Date(a.scanned_at || 0).getTime();
        });
        setGuests(scannedGuests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
    // Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchGuests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من إلغاء تحضير ${name}؟`)) return;

    try {
      const res = await fetch('/api/admin/unscan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        // Remove from local state immediately
        setGuests(prev => prev.filter(g => g.id !== id));
      } else {
        alert('فشل إلغاء التحضير.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ.');
    }
  };

  const totalParties = guests.length;
  const totalPeople = guests.reduce((sum, g) => sum + 1 + g.companion_count, 0);

  if (loading) {
    return <main className={styles.container}><p style={{textAlign: 'center', marginTop: '4rem'}}>جاري التحميل...</p></main>;
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>سجل الحضور المباشر (البوابة)</h1>
          <Link href="/admin" className={styles.navLink}>العودة للوحة دعوات الحضور (RSVPs)</Link>
        </div>
        <div className={styles.statsCard}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalParties}</span>
            <span className={styles.statLabel}>المجموعات الحاضرة</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalPeople}</span>
            <span className={styles.statLabel}>إجمالي الحاضرين الفعلي</span>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {guests.length === 0 ? (
          <div className={styles.emptyState}>
            لم يسجل أحد حضوره بعد عبر البوابة المباشرة.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>وقت الدخول</th>
                <th>عدد الأفراد (الضيف + المرافقين)</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {guests.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: 500, fontSize: '1.1rem' }}>{g.name}</td>
                  <td dir="ltr" style={{ textAlign: 'right' }}>
                    {g.scanned_at ? new Date(g.scanned_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'غير متوفر'}
                  </td>
                  <td>{g.companion_count + 1}</td>
                  <td>
                    <button 
                      className={styles.removeBtn}
                      onClick={() => handleRemove(g.id, g.name)}
                    >
                      إلغاء التحضير
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
