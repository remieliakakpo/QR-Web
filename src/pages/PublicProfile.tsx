import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Shield, Truck, HeartPulse, User, MapPin, MessageCircle, ChevronRight, Lock, AlertTriangle, Droplets, Activity } from 'lucide-react';
import axios from 'axios';

const API_URL = "https://safelife.up.railway.app";

const PublicProfile = () => {
  const { token } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'ambulance' | 'police' | null>(null);
  const [code, setCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Capture GPS au chargement
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("GPS non disponible")
      );
    }
  }, []);

  const verifierCode = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setAuthError(false);
    try {
      const response = await axios.post(`${API_URL}/scan/verify`, {
        token,
        pin: code.trim().toUpperCase(),
        authority_type: 'emergency_unit'
      });
      setUser(response.data);
      setIsUnlocked(true);
    } catch {
      setAuthError(true);
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = (contact: any) => {
    const locationText = userLocation
      ? `📍 Position exacte : https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
      : "📍 Position GPS non disponible";

    const victime = user?.identity
      ? `${user.identity.first_name} ${user.identity.last_name}`
      : "une personne";

    const message = encodeURIComponent(
      `🚨 *ALERTE URGENCE — SafeLife*\n\n` +
      `Un accident impliquant *${victime}* vient d'être signalé.\n\n` +
      `${locationText}\n\n` +
      `⏰ Heure : ${new Date().toLocaleTimeString('fr-FR')}\n\n` +
      `Cliquez sur le lien pour rejoindre la victime immédiatement.`
    );

    const phone = contact.phone.replace(/\s/g, '').replace('+', '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // ── ÉTAPE 1 : CHOIX AUTORITÉ ─────────────────────────────────
  if (!userType && !isUnlocked) {
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.step1Wrap}>
          <div style={s.logoBlock}>
            <div style={s.logoText}>
              <span style={{ color: '#fff' }}>SAFE</span>
              <span style={{ color: '#FFCD00' }}>LIFE</span>
            </div>
            <div style={s.logoBadge}>FICHE D'URGENCE</div>
          </div>

          <div style={s.sosTag}>
            <AlertTriangle size={14} color="#dc2626" />
            <span>Urgence détectée — Identifiez-vous</span>
          </div>

          <h2 style={s.step1Title}>Qui êtes-vous ?</h2>
          <p style={s.step1Sub}>Sélectionnez votre profil pour accéder à la fiche d'urgence</p>

          <div style={s.authorityGrid}>
            <button
              style={{ ...s.authorityCard, ...s.cardAmbu }}
              onClick={() => setUserType('ambulance')}
              className="authority-card"
            >
              <div style={{ ...s.authorityIcon, background: 'rgba(37,99,235,0.15)' }}>
                <Truck size={32} color="#3b82f6" />
              </div>
              <span style={s.authorityLabel}>Ambulancier</span>
              <span style={s.authoritySub}>Corps médical</span>
              <ChevronRight size={16} color="#94a3b8" style={{ marginTop: 8 }} />
            </button>

            <button
              style={{ ...s.authorityCard, ...s.cardPolice }}
              onClick={() => setUserType('police')}
              className="authority-card"
            >
              <div style={{ ...s.authorityIcon, background: 'rgba(220,38,38,0.12)' }}>
                <Shield size={32} color="#dc2626" />
              </div>
              <span style={s.authorityLabel}>Police</span>
              <span style={s.authoritySub}>Gendarmerie</span>
              <ChevronRight size={16} color="#94a3b8" style={{ marginTop: 8 }} />
            </button>
          </div>

          <p style={s.disclaimer}>
            Les données sont protégées et accessibles uniquement aux professionnels accrédités
          </p>
        </div>
      </div>
    );
  }

  // ── ÉTAPE 2 : CODE SECRET ────────────────────────────────────
  if (!isUnlocked) {
    const isAmbu = userType === 'ambulance';
    return (
      <div style={s.page}>
        <style>{css}</style>
        <div style={s.step2Wrap}>
          <button style={s.backBtn} onClick={() => setUserType(null)}>← Retour</button>

          <div style={{ ...s.step2Icon, background: isAmbu ? 'rgba(37,99,235,0.12)' : 'rgba(220,38,38,0.12)' }}>
            {isAmbu ? <Truck size={36} color="#3b82f6" /> : <Shield size={36} color="#dc2626" />}
          </div>

          <h2 style={s.step2Title}>Code d'unité</h2>
          <p style={s.step2Sub}>
            {isAmbu ? 'Corps médical / Ambulancier' : 'Police / Gendarmerie'}
          </p>

          <div style={s.inputWrap}>
            <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              style={s.codeInput}
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifierCode()}
              placeholder="••••••••"
              maxLength={12}
              autoFocus
            />
          </div>

          {authError && (
            <div style={s.errorBox}>
              <AlertTriangle size={14} />
              <span>Code invalide — Accès refusé</span>
            </div>
          )}

          <button
            style={{ ...s.unlockBtn, background: isAmbu ? '#2563eb' : '#dc2626' }}
            onClick={verifierCode}
            disabled={loading}
          >
            {loading ? <div style={s.spinner} className="spinner" /> : 'DÉVERROUILLER'}
          </button>

          <p style={s.codeHint}>Ex : AMBU1818 · POL1717 · POMP2626</p>
        </div>
      </div>
    );
  }

  // ── ÉTAPE 3 : DONNÉES DÉVERROUILLÉES ─────────────────────────
  const { identity, medical, emergency_contacts, audit } = user;

  return (
    <div style={s.page}>
      <style>{css}</style>

      {/* Header */}
      <div style={s.profileHeader}>
        <div style={s.flagBar}>
          <div style={{ flex: 1, background: '#007A3D' }} />
          <div style={{ flex: 1, background: '#FFCD00' }} />
          <div style={{ flex: 1, background: '#D21034' }} />
        </div>

        <div style={s.headerContent}>
          <div style={s.ficheLabel}>
            <AlertTriangle size={13} color="#fbbf24" />
            <span>FICHE D'URGENCE SAFELIFE</span>
          </div>

          <div style={s.accessBadge} className="pulse-badge">
            <div style={s.pulseDot} />
            <span>ACCÈS SÉCURISÉ · {audit?.authority?.toUpperCase()}</span>
          </div>

          <div style={s.avatarCircle}>
            <User size={40} color="rgba(255,255,255,0.9)" />
          </div>

          <h1 style={s.profileName}>
            {identity?.first_name} {identity?.last_name}
          </h1>
          <p style={s.profileMeta}>
            {identity?.gender} &nbsp;·&nbsp; Né(e) le {identity?.birth_date}
            {identity?.nationality && ` · ${identity.nationality}`}
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div style={s.contentWrap}>

        {/* Groupe sanguin — card critique */}
        <div style={s.bloodCard} className="slide-up">
          <div style={s.bloodCardLeft}>
            <Droplets size={20} color="#dc2626" />
            <span style={s.bloodCardLabel}>Groupe sanguin</span>
          </div>
          <div style={s.bloodValue}>{medical?.blood_type || 'NC'}</div>
        </div>

        {/* Données médicales */}
        <div style={s.card} className="slide-up" data-delay="1">
          <div style={s.cardHeader}>
            <HeartPulse size={18} color="#dc2626" />
            <h3 style={s.cardTitle}>Données médicales critiques</h3>
          </div>

          {medical?.disabilities && medical.disabilities !== 'Aucun' && (
            <div style={s.dataRow}>
              <span style={s.dataLabel}>Handicap / Condition</span>
              <span style={{ ...s.dataValue, color: '#dc2626', fontWeight: 700 }}>{medical.disabilities}</span>
            </div>
          )}
          
          {(!medical?.disabilities || medical.disabilities === 'Aucun') && 
    
           (!medical?.conditions || medical.conditions === 'Aucune') && (
            <p style={s.noData}>Aucune condition médicale particulière renseignée</p>
          )}
        </div>

        {/* Contacts d'urgence */}
        <div style={s.card} className="slide-up" data-delay="2">
          <div style={s.cardHeader}>
            <Phone size={18} color="#007A3D" />
            <h3 style={s.cardTitle}>Contacts d'urgence</h3>
          </div>

          {emergency_contacts && emergency_contacts.length > 0
            ? emergency_contacts.map((contact: any, i: number) => (
              <div key={i} style={s.contactCard}>
                <div style={s.contactAvatar}>
                  <span style={s.contactAvatarText}>
                    {contact.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div style={s.contactInfo}>
                  <span style={s.contactName}>{contact.name}</span>
                  <span style={s.contactMeta}>
                    {contact.relation || 'Contact'} &nbsp;·&nbsp; {contact.phone}
                  </span>
                </div>
                <div style={s.contactActions}>
                  <button
                    style={s.actionBtn}
                    onClick={() => handleCall(contact.phone)}
                    title="Appeler"
                  >
                    <Phone size={16} color="#fff" />
                  </button>
                  <button
                    style={{ ...s.actionBtn, background: '#25D366' }}
                    onClick={() => handleWhatsApp(contact)}
                    title="Envoyer position WhatsApp"
                  >
                    <MessageCircle size={16} color="#fff" />
                  </button>
                </div>
              </div>
            ))
            : <p style={s.noData}>Aucun contact d'urgence renseigné</p>
          }

          {userLocation && (
            <div style={s.locationTag}>
              <MapPin size={13} color="#007A3D" />
              <span>Position GPS capturée · Les contacts peuvent être localisés</span>
            </div>
          )}
        </div>

        {/* Audit */}
        <p style={s.auditText}>
          Session sécurisée · {audit?.authority} · Token {audit?.token}
        </p>
      </div>
    </div>
  );
};

// ── STYLES ───────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: '#0f172a',
  },

  // Step 1
  step1Wrap: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px', textAlign: 'center',
    background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
  },
  logoBlock: { marginBottom: 32 },
  logoText: { fontSize: 42, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 },
  logoBadge: {
    display: 'inline-block', marginTop: 8,
    background: 'rgba(255,205,0,0.15)', color: '#FFCD00',
    fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
    padding: '4px 14px', borderRadius: 99,
  },
  sosTag: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)',
    color: '#fca5a5', fontSize: 12, fontWeight: 600,
    padding: '6px 16px', borderRadius: 99, marginBottom: 28,
  },
  step1Title: { fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px' },
  step1Sub: { fontSize: 13, color: '#94a3b8', marginBottom: 32, maxWidth: 300, lineHeight: 1.6 },
  authorityGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, width: '100%', maxWidth: 340, marginBottom: 28 },
  authorityCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 24, padding: '24px 16px', cursor: 'pointer',
    transition: 'all 0.2s', color: '#fff',
  },
  cardAmbu: {},
  cardPolice: {},
  authorityIcon: {
    width: 64, height: 64, borderRadius: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  authorityLabel: { fontSize: 15, fontWeight: 800, color: '#fff' },
  authoritySub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  disclaimer: { fontSize: 11, color: '#475569', maxWidth: 280, lineHeight: 1.6 },

  // Step 2
  step2Wrap: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 24px', background: '#fff', position: 'relative',
  },
  backBtn: {
    position: 'absolute', top: 40, left: 24,
    background: 'none', border: 'none', color: '#94a3b8',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
  },
  step2Icon: {
    width: 80, height: 80, borderRadius: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  step2Title: { fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0 },
  step2Sub: { fontSize: 13, color: '#64748b', marginTop: 6, marginBottom: 32 },
  inputWrap: { position: 'relative', width: '100%', maxWidth: 320, marginBottom: 16 },
  codeInput: {
    width: '100%', padding: '18px 18px 18px 46px',
    fontSize: 24, fontWeight: 800, textAlign: 'center',
    letterSpacing: 6, background: '#f8fafc',
    border: '2px solid #e2e8f0', borderRadius: 16,
    outline: 'none', color: '#0f172a',
    boxSizing: 'border-box',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#fff1f2', color: '#dc2626',
    fontSize: 12, fontWeight: 700, padding: '8px 14px',
    borderRadius: 10, marginBottom: 16,
  },
  unlockBtn: {
    width: '100%', maxWidth: 320, padding: '18px',
    borderRadius: 16, border: 'none', color: '#fff',
    fontSize: 14, fontWeight: 900, letterSpacing: '0.1em',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  spinner: {
    width: 20, height: 20, borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
  },
  codeHint: { fontSize: 11, color: '#94a3b8', marginTop: 16, fontStyle: 'italic' },

  // Profile
  profileHeader: {
    background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
    paddingBottom: 40,
  },
  flagBar: { display: 'flex', height: 4 },
  headerContent: {
    padding: '24px 24px 0', display: 'flex',
    flexDirection: 'column', alignItems: 'center', textAlign: 'center',
  },
  ficheLabel: {
    display: 'flex', alignItems: 'center', gap: 6,
    color: '#fbbf24', fontSize: 10, fontWeight: 800,
    letterSpacing: '0.2em', marginBottom: 12,
  },
  accessBadge: {
    display: 'flex', alignItems: 'center', gap: 7,
    background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
    color: '#4ade80', fontSize: 10, fontWeight: 800,
    letterSpacing: '0.12em', padding: '5px 14px',
    borderRadius: 99, marginBottom: 20,
  },
  pulseDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#4ade80',
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: '2px solid rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 28, fontWeight: 900, color: '#fff',
    margin: 0, letterSpacing: '-0.5px',
  },
  profileMeta: { fontSize: 13, color: '#94a3b8', marginTop: 6 },

  contentWrap: { padding: '0 16px 40px', marginTop: -20 },

  bloodCard: {
    background: 'linear-gradient(135deg, #fff1f2, #fff)',
    border: '2px solid #fca5a5', borderRadius: 20,
    padding: '18px 24px', marginBottom: 12,
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 20px rgba(220,38,38,0.1)',
  },
  bloodCardLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  bloodCardLabel: { fontSize: 13, fontWeight: 700, color: '#dc2626' },
  bloodValue: { fontSize: 44, fontWeight: 900, color: '#dc2626', lineHeight: 1 },

  card: {
    background: '#fff', borderRadius: 20,
    padding: '20px', marginBottom: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' },

  dataRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: '10px 0',
    borderBottom: '1px solid #f8fafc',
  },
  dataLabel: { fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  dataValue: { fontSize: 14, fontWeight: 600, color: '#0f172a', textAlign: 'right', maxWidth: '60%' },

  contactCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 0', borderBottom: '1px solid #f8fafc',
  },
  contactAvatar: {
    width: 44, height: 44, borderRadius: 14,
    background: 'linear-gradient(135deg, #007A3D, #4ade80)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  contactAvatarText: { fontSize: 18, fontWeight: 900, color: '#fff' },
  contactInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  contactName: { fontSize: 15, fontWeight: 700, color: '#0f172a' },
  contactMeta: { fontSize: 12, color: '#94a3b8' },
  contactActions: { display: 'flex', gap: 8 },
  actionBtn: {
    width: 38, height: 38, borderRadius: 12, border: 'none',
    background: '#007A3D', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer',
  },

  locationTag: {
    display: 'flex', alignItems: 'center', gap: 6,
    marginTop: 14, padding: '8px 12px',
    background: '#f0fdf4', borderRadius: 10,
    fontSize: 11, color: '#007A3D', fontWeight: 600,
  },

  noData: { fontSize: 13, color: '#cbd5e1', textAlign: 'center', padding: '12px 0' },
  auditText: {
    fontSize: 10, color: '#cbd5e1', textAlign: 'center',
    padding: '16px 0', fontStyle: 'italic',
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; }

  .authority-card:hover {
    background: rgba(255,255,255,0.1) !important;
    border-color: rgba(255,255,255,0.3) !important;
    transform: translateY(-2px);
  }

  .pulse-badge {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.3); }
    50% { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
  }

  .slide-up {
    animation: slideUp 0.4s ease forwards;
    opacity: 0;
  }

  .slide-up:nth-child(1) { animation-delay: 0.1s; }
  .slide-up:nth-child(2) { animation-delay: 0.2s; }
  .slide-up:nth-child(3) { animation-delay: 0.3s; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .spinner {
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  input:focus {
    border-color: #007A3D !important;
    box-shadow: 0 0 0 3px rgba(0,122,61,0.15);
  }

  button:active { transform: scale(0.97); }
`;

export default PublicProfile;
