'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import styles from './page.module.css';

export default function RSVPPage() {
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState('attending');
  const [companions, setCompanions] = useState('0');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          attendance_status: attendance,
          companion_count: parseInt(companions, 10)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ ما');
      }

      setTicketId(data.ticket_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAsImage = async () => {
    const ticketCard = document.getElementById('ticket-card');
    if (!ticketCard) return;

    // Temporarily hide the buttons so they don't appear in the saved image
    const actionsGroup = document.getElementById('ticket-actions');
    if (actionsGroup) {
      actionsGroup.style.display = 'none';
    }

    try {
      const canvas = await html2canvas(ticketCard, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const pngUrl = canvas.toDataURL('image/png');
      
      // Convert to blob to ensure it downloads properly on all devices
      const byteString = atob(pngUrl.split(',')[1]);
      const mimeString = pngUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: mimeString });
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `تذكرة_زفاف_خالد_ورنيم_${name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Failed to save image', err);
    } finally {
      if (actionsGroup) {
        actionsGroup.style.display = 'flex';
      }
    }
  };

  const saveAsPDF = () => {
    window.print();
  };

  return (
    <main className={styles.container}>
      <div className={styles.card} id="ticket-card">
        <div className={styles.namesContainer}>
          <span className={styles.nameText}>خالد</span>
          <svg 
            width="56" 
            height="34" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.2" 
            className={styles.ringsIcon}
          >
            <path d="M8 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
            <path d="M16 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
            <path d="M16 6l-2-3 2-1 2 1-2 3z" fill="currentColor" opacity="0.8"/>
            <path d="M14.5 9L16 6l1.5 3" />
          </svg>
          <span className={styles.nameText}>رنيم</span>
        </div>
        
        <div className={styles.dividerWrap}>
          <div className={styles.dividerLine}></div>
          <span className={styles.dividerText}>حفل الزفاف</span>
          <div className={styles.dividerLine}></div>
        </div>

        {!ticketId ? (
          <form onSubmit={handleSubmit} className={styles.formContainer}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>الاسم الكامل</label>
              <input
                id="name"
                type="text"
                required
                className={styles.input}
                placeholder="أدخل اسمك"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="attendance" className={styles.label}>تأكيد الحضور</label>
              <select
                id="attendance"
                className={styles.select}
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
              >
                <option value="attending">سأحضر بالتأكيد</option>
                <option value="might_attend">قد أحضر</option>
                <option value="not_attending">أعتذر عن الحضور</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="companions" className={styles.label}>المرافقون</label>
              <select
                id="companions"
                className={styles.select}
                value={companions}
                onChange={(e) => setCompanions(e.target.value)}
              >
                <option value="0">بدون مرافق</option>
                <option value="1">مرافق واحد</option>
                <option value="2">مرافقان</option>
              </select>
              <div style={{ marginTop: '1rem', textAlign: 'center', backgroundColor: '#fdfbf7', padding: '0.75rem', borderRadius: '8px', border: '1px dashed #e8dcc4' }}>
                <div style={{ fontWeight: 'bold', color: '#c9a45c', fontSize: '1.05rem', marginBottom: '0.25rem' }}>جنة الأطفال منازلهم</div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>الرجاء عدم إحضار الأطفال 🤍</div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading ? 'جاري الإرسال...' : 'تأكيد الحضور'}
            </button>
          </form>
        ) : (
          <div className={styles.ticketContainer}>
            <div className={styles.successMessage}>
              شكراً لك، <strong>{name}</strong>! تم استلام ردك بنجاح.
            </div>
            
            {attendance !== 'not_attending' ? (
              <>
                <h3 className={styles.ticketTitle}>تذكرتك الرقمية</h3>
                <div className={styles.qrWrapper} ref={qrRef}>
                  <QRCodeCanvas value={ticketId} size={150} level="M" fgColor="#A68A64" />
                </div>
                <div className={styles.ticketId}>{ticketId}</div>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }} className={styles.hideOnPrint}>
                  يرجى الاحتفاظ برمز الاستجابة السريعة (QR) للدخول.
                </p>
                <div className={styles.actionsGroup} id="ticket-actions">
                  <button onClick={saveAsImage} className={styles.actionButton}>
                    حفظ الصورة
                  </button>
                  <button onClick={saveAsPDF} className={styles.actionButtonSecondary}>
                    حفظ كـ PDF
                  </button>
                </div>
              </>
            ) : (
              <p style={{ marginTop: '1rem' }} className={styles.hideOnPrint}>سنفتقدك في الحفل!</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
