/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Droplet, ShieldCheck, User, Activity, MapPin, Share2, Lock, Truck, Shield, HeartPulse, ClipboardList, Info } from 'lucide-react';
import axios from 'axios';

const PublicProfile = () => {
  const { token } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [userType, setUserType] = useState<'ambulance' | 'police' | null>(null);
  const [code, setCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState(false);

  // --- LOGIQUE DE VÉRIFICATION ---
  const verifierCode = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setAuthError(false);
    try {
      // Connexion au backend Railway 
      const response = await axios.post(`https://safelife.up.railway.app/scan/verify`, {
        token: token,
        pin: code.trim().toUpperCase(),
        authority_type: 'emergency_unit'
      });
      
      setUser(response.data);
      setIsUnlocked(true);
      setLoading(false);
    } catch (err: any) {
      console.error("Erreur d'authentification:", err.response?.data || err.message);
      setAuthError(true);
      setLoading(false);
      setCode("");
    }
  };

  // --- ÉTAPE 1 : CHOIX DE L'AUTORITÉ ---
  if (!userType && !isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-red-600 mb-2 italic">SafeLife</h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-10">Protocole d'urgence</p>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Identification de l'intervenant</h2>
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          <button onClick={() => setUserType('ambulance')} className="flex flex-col items-center justify-center bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-blue-500 shadow-xl shadow-gray-200 transition-all group active:scale-95">
            <div className="bg-blue-100 p-4 rounded-full mb-3 group-hover:bg-blue-600 transition-colors">
              <Truck size={40} className="text-blue-600 group-hover:text-white" />
            </div>
            <span className="font-black uppercase tracking-tighter text-gray-800">Ambulancier / Médical</span>
          </button>
          <button onClick={() => setUserType('police')} className="flex flex-col items-center justify-center bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-red-600 shadow-xl shadow-gray-200 transition-all group active:scale-95">
            <div className="bg-red-100 p-4 rounded-full mb-3 group-hover:bg-red-600 transition-colors">
              <Shield size={40} className="text-red-600 group-hover:text-white" />
            </div>
            <span className="font-black uppercase tracking-tighter text-gray-800">Police / Gendarmerie</span>
          </button>
        </div>
      </div>
    );
  }

  // --- ÉTAPE 2 : SAISIE DU CODE SECRET ---
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom duration-300">
        <button onClick={() => setUserType(null)} className="absolute top-10 left-6 text-gray-400 font-bold text-xs uppercase underline">← Retour</button>
        <div className="w-full max-w-md text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${userType === 'ambulance' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
            {userType === 'ambulance' ? <Truck size={40} /> : <Shield size={40} />}
          </div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Code Unité</h2>
          <p className="text-gray-500 text-sm mt-2 mb-8">Entrez votre code (ex: AMBU1818 ou POL1717)</p>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center text-3xl font-bold p-6 border-2 border-gray-100 bg-gray-50 rounded-3xl mb-4 outline-none focus:border-gray-300 transition-all"
            placeholder="••••••"
          />
          {authError && <p className="text-red-600 text-xs font-bold mb-4 uppercase">Code invalide</p>}
          <button
            onClick={verifierCode}
            className={`w-full py-5 rounded-3xl font-black text-white shadow-xl transition active:scale-95 ${userType === 'ambulance' ? 'bg-blue-600 shadow-blue-200' : 'bg-red-600 shadow-red-200'}`}
          >
            {loading ? "VÉRIFICATION..." : "DÉVERROUILLER"}
          </button>
        </div>
      </div>
    );
  }

  // --- ÉTAPE 3 : AFFICHAGE DES INFOS (Données déverrouillées) ---
  const { identity, medical, emergency_contacts, authority } = user;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-12">
      {/* Header Profil */}
      <div className="w-full bg-slate-900 text-white p-8 pt-12 rounded-b-[3rem] shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-4 right-6 bg-green-500 text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
          ACCÈS SÉCURISÉ : {authority}
        </div>
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
          <User size={50} className="text-white" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          {identity?.first_name} {identity?.last_name}
        </h1>
        <p className="text-blue-300 font-bold text-sm mt-1">
          {identity?.gender} • Né(e) le {identity?.birth_date}
        </p>
      </div>

      <div className="w-full max-w-md px-6 -mt-8 space-y-4">
        {/* Section Médicale */}
        <div className="bg-white p-6 rounded-[2rem] shadow-lg border-l-8 border-red-600">
          <div className="flex items-center gap-2 mb-4 text-red-600">
            <HeartPulse size={20} />
            <h3 className="font-black uppercase text-sm tracking-widest">Données Vitales</h3>
          </div>
          
          <div className="flex justify-between items-center bg-red-50 p-4 rounded-2xl mb-4">
            <span className="text-xs font-bold text-red-800 uppercase">Groupe Sanguin</span>
            <span className="text-4xl font-black text-red-600">{medical?.blood_type}</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 text-xs font-bold uppercase">Allergies</span>
              <span className="text-sm font-black text-red-600">{medical?.allergies}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 text-xs font-bold uppercase">Maladies</span>
              <span className="text-sm font-bold text-gray-800">{medical?.conditions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs font-bold uppercase">Traitement</span>
              <span className="text-sm font-bold text-gray-800">{medical?.medications}</span>
            </div>
          </div>
        </div>

        {/* Section Contacts */}
        <div className="bg-white p-6 rounded-[2rem] shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Phone size={20} />
            <h3 className="font-black uppercase text-sm tracking-widest">Contacts d'urgence</h3>
          </div>
          {emergency_contacts && emergency_contacts.map((contact: any, index: number) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl mb-2">
              <div>
                <p className="font-black text-gray-800 uppercase text-sm">{contact.name}</p>
                <p className="text-xs text-gray-500 font-bold">{contact.relation} • {contact.phone}</p>
              </div>
              <a href={`tel:${contact.phone}`} className="bg-green-500 p-3 rounded-full text-white shadow-lg shadow-green-200 active:scale-90 transition-transform">
                <Phone size={18} />
              </a>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-center px-10">
        Les données affichées sont strictement confidentielles et réservées à un usage médical ou légal.
      </p>
    </div>
  );
};

export default PublicProfile;