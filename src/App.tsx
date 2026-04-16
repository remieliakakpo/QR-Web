import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicProfile from './pages/PublicProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Cette route signifie : quand l'URL finit par /scan/quelquechose */}
        <Route path="/scan/:token" element={<PublicProfile />} />
        
        {/* Page par défaut si l'URL est vide */}
        <Route path="/" element={
          <div className="h-screen flex items-center justify-center">
            <h1 className="text-xl font-bold text-gray-400">SafeLife Web Service Ready</h1>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;