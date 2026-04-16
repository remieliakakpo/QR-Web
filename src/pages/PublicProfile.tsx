/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, Droplet, ShieldCheck, User, Activity, MapPin, Share2, Lock, Truck, Shield } from 'lucide-react';
import axios from 'axios';

const PublicProfile = () => {
  const { token } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // États pour la logique d'accès
  const [userType, setUserType] = useState<'ambulance' | 'police' | null>(null);
  const [code, setCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState(false);

  const verifierCode = async () => {
    setLoading(true);
    setAuthError(false);
    try {
      // On envoie le token, le code ET le type d'autorité au backend
      const response = await axios.post(`https://safelife.up.railway.app/api/profile/scan/verify`, {
        token: token,
        pin: code,
        authority_type: userType // 'ambulance' ou 'police'
      });
      
      setUser(response.data);
      setIsUnlocked(true);
      setLoading(false);
    } catch (err) {
      setAuthError(true);
      setLoading(false);
      setCode("");
    }
  };

  // --- ÉTAPE 1 : CHOIX DE L'AUTORITÉ ---
  if (!userType && !isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-danger mb-2 italic">SafeLife</h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mb-10">Protocole d'urgence</p>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">Identification de l'intervenant</h2>
        
        <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
          <button 
            onClick={() => setUserType('ambulance')}
            className="flex flex-col items-center justify-center bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-primary shadow-xl shadow-gray-200 transition-all group active:scale-95"
          >
            <div className="bg-primary/10 p-4 rounded-full mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
              <Truck size={40} className="text-primary group-hover:text-white" />
            </div>
            <span className="font-black uppercase tracking-tighter text-gray-800">Ambulancier / Médical</span>
          </button>

          <button 
            onClick={() => setUserType('police')}
            className="flex flex-col items-center justify-center bg-white p-8 rounded-[2rem] border-2 border-transparent hover:border-danger shadow-xl shadow-gray-200 transition-all group active:scale-95"
          >
            <div className="bg-danger/10 p-4 rounded-full mb-3 group-hover:bg-danger group-hover:text-white transition-colors">
              <Shield size={40} className="text-danger group-hover:text-white" />
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
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${userType === 'ambulance' ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'}`}>
            {userType === 'ambulance' ? <Truck size={40} /> : <Shield size={40} />}
          </div>
          
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Code Unité</h2>
          <p className="text-gray-500 text-sm mt-2 mb-8">Entrez votre identifiant secret d'accès pour {userType === 'ambulance' ? 'les services médicaux' : 'les forces de l\'ordre'}.</p>

          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center text-3xl font-bold p-6 border-2 border-gray-100 bg-gray-50 rounded-3xl mb-4 outline-none focus:border-gray-300 transition-all"
            placeholder="••••••"
          />

          {authError && <p className="text-danger text-xs font-bold mb-4 uppercase">Code invalide pour cette unité</p>}

          <button
            onClick={verifierCode}
            className={`w-full py-5 rounded-3xl font-black text-white shadow-xl transition active:scale-95 ${userType === 'ambulance' ? 'bg-primary shadow-primary/20' : 'bg-danger shadow-danger/20'}`}
          >
            {loading ? "VÉRIFICATION..." : "DÉVERROUILLER"}
          </button>
        </div>
      </div>
    );
  }

  // --- ÉTAPE 3 : AFFICHAGE DES INFOS (Idem que précédemment) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-12">
        {/* Ton code d'affichage complet ici... */}
        <p className="mt-4 text-xs font-bold text-gray-300 italic">Connecté en tant que : {userType?.toUpperCase()}</p>
    </div>
  );
};

export default PublicProfile;