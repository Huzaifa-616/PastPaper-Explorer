import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { WifiOff, RefreshCw, X } from 'lucide-react';

// Small, unobtrusive PWA status UI:
//  - a banner when a new version is ready (tap to update)
//  - a quiet pill when the student goes offline (so they know why fresh
//    content isn't loading, but cached papers still work)
export default function PWAStatus() {
  const [offline, setOffline] = useState(!navigator.onLine);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW() { /* registered */ },
    onRegisterError(e) { console.warn('SW registration failed', e); },
  });

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return (
    <>
      {offline && (
        <div style={{
          position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', color: 'var(--text2)', border: '1px solid var(--line2)',
          borderRadius: 100, padding: '8px 16px', fontSize: 12, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>
          <WifiOff size={14} /> Offline — saved papers still available
        </div>
      )}

      {needRefresh && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--text)', color: 'var(--bg)',
          borderRadius: 12, padding: '12px 16px', fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        }}>
          <RefreshCw size={15} />
          <span>New version available</span>
          <button
            onClick={() => updateServiceWorker(true)}
            style={{ background: 'var(--bg)', color: 'var(--text)', border: 'none', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            Update
          </button>
          <button onClick={() => setNeedRefresh(false)} style={{ background: 'none', border: 'none', color: 'var(--bg)', cursor: 'pointer', display: 'flex', opacity: 0.7 }}>
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
