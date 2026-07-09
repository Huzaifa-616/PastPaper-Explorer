import React, { useState, useEffect } from 'react';
import { Check, Copy, Mail, X } from 'lucide-react';

const ContactModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = "huzaifa.bravo@gmail.com";
  useEffect(() => { if (copied) { const t = setTimeout(()=>setCopied(false),2000); return ()=>clearTimeout(t); } }, [copied]);
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'24px',borderBottom:'1px solid var(--line2)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center' }}><Mail size={18} color="var(--text)" /></div>
            <span style={{ fontSize:20,fontWeight:700,color:'var(--text)' }}>Contact</span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div style={{ padding:'32px 24px',textAlign:'center' }}>
          <p style={{ color:'var(--text2)',fontSize:15,lineHeight:1.6,marginBottom:24 }}>Questions, feedback, or just want to say hi?<br />Drop a line below.</p>
          <div style={{ display:'flex',alignItems:'center',gap:10,background:'var(--surface2)',border:'1px solid var(--line2)',borderRadius:12,padding:'8px 8px 8px 16px',marginBottom:12 }}>
            <span style={{ flex:1,fontSize:14,color:'var(--text)',textAlign:'left',fontFamily:'Roboto Mono, monospace' }}>{email}</span>
            <button onClick={()=>{navigator.clipboard.writeText(email);setCopied(true);}}
              style={{ display:'flex',alignItems:'center',gap:6,padding:'10px 16px',borderRadius:8,border:'none',cursor:'pointer',background:copied?'var(--text)':'var(--surface3)',color:copied?'var(--bg)':'var(--text)',fontSize:13,fontWeight:600,transition:'all 0.2s' }}>
              {copied?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ContactModal;
