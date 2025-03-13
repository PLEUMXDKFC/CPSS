import React from 'react';
import { Link } from 'react-router-dom'; // นำเข้า Link
import Sidebar from '../components/sidebar';
import CourseTable from '../components/Tableinfo';

function Courseinfo() {
  // ข้อมูลตัวอย่าง
  const courses = [
    { id: "20000-1596", name: 'วิชาภาษาไทย', credits: '3-0-3' },
    { id: "20000-1485", name: 'วิชาคณิตศาสตร์', credits: '2-2-3' },
  ];

  // คำนวณผลรวมของหน่วยกิต
  const totalCredits = courses.reduce((sum, course) => {
    const [theory, practice, credit] = course.credits.split('-').map(Number);
    return sum + credit;
  }, 0);

  return (
    <div>
      <Sidebar />
      <div className='ml-65 mt-6'>
        {/* ปุ่มย้อนกลับ */}
        <Link to="/dashboard" className='bg-red-500 text-white rounded-lg py-3 px-6 ml-5 hover:bg-red-600 transition'>ย้อนกลับ</Link>

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

        {/* หมวดวิชาสมรรถนะแกนกลาง */}
        <span className='text-lg ml-5'>1.หมวดวิชาสมรรถนะแกนกลาง</span>
        <div className='ml-10'>
          <br />
          <span className='text-lg ml-5'>1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent('กลุ่มสมรรถนะภาษาและการสื่อสาร')}`} // ส่งหัวข้อผ่าน URL parameters
            className='ml-5 text-blue-500 text-lg'
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
        </div>
        <CourseTable courses={courses} totalCredits={totalCredits} />

        {/* ส่วนอื่น ๆ ของหน้า */}
        {/* ... */}
      </div>
    </div>
  );
}

export default Courseinfo;