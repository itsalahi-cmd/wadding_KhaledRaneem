'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import styles from './page.module.css';

interface GuestDetails {
  id: string;
  name: string;
  attendance_status: string;
  companion_count: number;
}

export default function GatePage() {
  const [guest, setGuest] = useState<GuestDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          rememberLastUsedCamera: true
        },
        false
      );

      const onScanSuccess = async (decodedText: string) => {
        if (!scanning) return;
        
        // Stop scanning once we get a result
        setScanning(false);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
          scannerRef.current = null;
        }

        try {
          const response = await fetch('/api/gate/scan', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticket_id: decodedText }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to verify ticket');
          }

          setGuest(data.guest);
          setError('');
        } catch (err: any) {
          setError(err.message);
        }
      };

      const onScanFailure = (error: any) => {
        // Ignore minor read errors
      };

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [scanning]);

  const handleScanAnother = () => {
    setGuest(null);
    setError('');
    setScanning(true);
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Gate Check-in</h1>

      {scanning ? (
        <div className={styles.scannerCard}>
          <div id="qr-reader" className={styles.scannerWrapper}></div>
          <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
            Point camera at guest's QR ticket
          </p>
        </div>
      ) : guest ? (
        <div className={styles.resultCard}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.guestName}>{guest.name}</h2>
          
          <div className={styles.guestDetails}>
            <p><strong>Status:</strong> <span>{guest.attendance_status === 'yes' ? 'Attending' : 'Not Attending'}</span></p>
            <p><strong>Companions (+):</strong> <span>{guest.companion_count}</span></p>
            <p style={{ borderTop: '1px solid #ddd', paddingTop: '0.5rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
              <strong>Total Party Size:</strong> <span>{guest.companion_count + 1}</span>
            </p>
          </div>

          <button className={styles.button} onClick={handleScanAnother}>
            Scan Next Ticket
          </button>
        </div>
      ) : error ? (
        <div className={styles.resultCard}>
          <div className={styles.errorIcon}>✗</div>
          <h2 className={styles.guestName}>Invalid Ticket</h2>
          <p className={styles.errorMsg}>{error}</p>
          <button className={styles.button} onClick={handleScanAnother}>
            Try Again
          </button>
        </div>
      ) : null}
    </main>
  );
}
