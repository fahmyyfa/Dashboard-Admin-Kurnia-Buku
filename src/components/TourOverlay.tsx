import React, { useEffect, useState, useRef } from 'react';

interface TourStep {
  selector: string;
  title: string;
  content: string;
  placement: 'right' | 'bottom' | 'left' | 'top';
}

interface TourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps: TourStep[] = [
  {
    selector: '.sidebar',
    title: 'Menu Navigasi',
    content: 'Akses cepat untuk berpindah antara Dashboard, Data Transaksi, Presensi Staf, dan Laporan.',
    placement: 'right',
  },
  {
    selector: '.tour-summary-cards',
    title: 'Ringkasan Finansial',
    content: 'Pantau kondisi keuangan, arus kas, dan saldo akhir bisnis Anda secara real-time.',
    placement: 'bottom',
  },
  {
    selector: '.tour-charts',
    title: 'Tren Pendapatan',
    content: 'Grafik visual untuk menganalisis pertumbuhan omzet dan perbandingan pengeluaran antar tahun.',
    placement: 'bottom',
  },
  {
    selector: '.tour-presence-widget',
    title: 'Status Kehadiran',
    content: 'Pantau staf yang aktif bekerja, izin, atau absen hari ini secara instan.',
    placement: 'left',
  },
  {
    selector: '.tour-help-btn',
    title: 'Butuh Bantuan?',
    content: 'Jika Anda bingung, klik ikon bantuan ini kapan saja untuk memutar kembali panduan ini.',
    placement: 'bottom',
  },
];

export const TourOverlay: React.FC<TourOverlayProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updateRect = () => {
      const stepInfo = steps[currentStep];
      const element = document.querySelector(stepInfo.selector);
      if (element) {
        // Highlight element
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Wait a brief moment for scroll to settle
        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
        }, 150);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isOpen, currentStep]);

  if (!isOpen || !targetRect) return null;

  const stepInfo = steps[currentStep];

  // Calculate popover position
  const getPopoverStyle = () => {
    if (!targetRect) return {};
    
    const margin = 16;
    let top = 0;
    let left = 0;

    switch (stepInfo.placement) {
      case 'right':
        top = targetRect.top + targetRect.height / 2 - 100; // center vertically
        left = targetRect.right + margin;
        break;
      case 'bottom':
        top = targetRect.bottom + margin;
        left = targetRect.left + targetRect.width / 2 - 160; // center horizontally
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - 100;
        left = targetRect.left - 320 - margin;
        break;
      case 'top':
        top = targetRect.top - 200 - margin;
        left = targetRect.left + targetRect.width / 2 - 160;
        break;
    }

    // Boundary check
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (left < 16) left = 16;
    if (left + 320 > screenWidth) left = screenWidth - 336;
    if (top < 16) top = 16;
    if (top + 220 > screenHeight) top = screenHeight - 236;

    return {
      position: 'fixed' as const,
      top: `${top}px`,
      left: `${left}px`,
      width: '320px',
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid #e2e8f0',
      zIndex: 10001,
      pointerEvents: 'auto' as const,
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('kurnia_buku_tour_completed', 'true');
    setCurrentStep(0);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      pointerEvents: 'none',
      fontFamily: 'var(--font-body)'
    }}>
      {/* Spotlight Backdrop (4 panels around targetRect) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: `${targetRect.top}px`,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        pointerEvents: 'auto',
      }} />
      <div style={{
        position: 'fixed',
        top: `${targetRect.bottom}px`,
        left: 0,
        width: '100vw',
        height: `calc(100vh - ${targetRect.bottom}px)`,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        pointerEvents: 'auto',
      }} />
      <div style={{
        position: 'fixed',
        top: `${targetRect.top}px`,
        left: 0,
        width: `${targetRect.left}px`,
        height: `${targetRect.height}px`,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        pointerEvents: 'auto',
      }} />
      <div style={{
        position: 'fixed',
        top: `${targetRect.top}px`,
        left: `${targetRect.right}px`,
        width: `calc(100vw - ${targetRect.right}px)`,
        height: `${targetRect.height}px`,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        pointerEvents: 'auto',
      }} />

      {/* Popover Card */}
      <div ref={popoverRef} style={getPopoverStyle()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: '#10b981',
            letterSpacing: '0.5px'
          }}>
            Langkah {currentStep + 1} dari {steps.length}
          </span>
          <button
            onClick={handleComplete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            Lewati
          </button>
        </div>

        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          {stepInfo.title}
        </h4>
        
        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4', marginBottom: '1.25rem' }}>
          {stepInfo.content}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: 'white',
              color: currentStep === 0 ? '#cbd5e1' : '#475569',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Kembali
          </button>

          <button
            onClick={handleNext}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#1e293b',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {currentStep === steps.length - 1 ? 'Selesai' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  );
};
