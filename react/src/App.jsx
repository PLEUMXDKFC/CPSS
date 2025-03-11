import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Createstudyplan from './Page/Createstudyplan';
import Courseinfo from './Page/Courseinfo'; // นำเข้าหน้า Courseinfo

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Createstudyplan />} />
        <Route path="/Courseinfo" element={<Courseinfo />} /> {/* เพิ่ม Route สำหรับ Courseinfo */}
      </Routes>
    </Router>
  );
}

export default App;