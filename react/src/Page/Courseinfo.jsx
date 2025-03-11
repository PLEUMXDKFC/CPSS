// pages/Createstudyplan.js
import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import CourseTable from '../components/Tableinfo'; // นำเข้าคอมโพเนนต์ตาราง

function Createstudyplan() {
  const [courses, setCourses] = useState([
    { id: '20000-1596', name: 'ภาษาอังกฤษ', credits: '0-2-1' },
    // เพิ่มข้อมูลรายวิชาอื่น ๆ ที่นี่
  ]);

  // คำนวณผลรวมของหน่วยกิต
  const totalCredits = courses.reduce((sum, course) => {
    const [lecture, lab, self] = course.credits.split('-').map(Number);
    return sum + lecture + lab + self;
  }, 0);

  return (
    <div>
      <Sidebar />
      <div className='ml-65 mt-6'>
        {/* ปุ่มย้อนกลับ */}
        <a href="dashboard" className='bg-red-500 text-white rounded-lg py-3 px-6 ml-5 hover:bg-red-600 transition'>ย้อนกลับ</a>

        {/* หัวข้อหลัก */}
        <h1 className='text-center font-bold text-lg'>ข้อมูลรายวิชา</h1>

        {/* Section เลือกระดับชั้นและปี */}
        <div className='ml-5 mt-5 mb-12'>
          <div className='flex space-x-5'>
            {/* เลือกระดับชั้น */}
            <div>
              <label htmlFor="grade" className='text-lg'>ระดับชั้น:</label>
              <select id="grade" className='ml-2 p-2 border rounded-lg'>
                <option value="1">ปวช.</option>
                <option value="2">ปวส.</option>
                <option value="3">ปวส.ม6</option>
              </select>
            </div>

            {/* เลือกปีการศึกษา */}
            <div>
              <label htmlFor="year" className='text-lg'>ปีการศึกษา:</label>
              <select id="year" className='ml-2 p-2 border rounded-lg'>
                <option value="2023">2566</option>
                <option value="2024">2567</option>
                <option value="2025">2568</option>
              </select>
            </div>
          </div>
        </div>

        <span className='text-lg ml-5'>1.หมวดวิชาสมรรถนะแกนกลาง</span>
        
        {/* ใช้คอมโพเนนต์ตาราง */}
        <CourseTable courses={courses} totalCredits={totalCredits} />
      </div>
    </div>
  );
}

export default Createstudyplan;