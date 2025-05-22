import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './components/index';
import AdminDashboard from './components/adminDashboard';
import UserDashboard from './components/userDashboard';

function App() {
  return (
    <BrowserRouter>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
