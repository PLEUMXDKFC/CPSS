// pages/Courseadd.js
import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import Addinfo from '../components/Addinfo'; // Import Addinfo component

function Courseadd() {
  const [coursescode, setcoursescode] = useState('');
  const [coursesname, setcoursesname] = useState('');
  const [theory, settheory] = useState('');
  const [practice, setpractice] = useState('');
  const [credit, setcredit] = useState('');

  const [courses, setCourses] = useState([
    { id: '20000-1596', name: 'ภาษาอังกฤษ', credits: '0-2-1' },
  ]);

  const totalCredits = courses.reduce((sum, course) => {
    const [theory, practice, credit] = course.credits.split('-').map(Number);
    return sum + credit;
  }, 0);

  const handleAddCourse = () => {
    const newCourse = {
      id: coursescode,
      name: coursesname,
      credits: `${theory}-${practice}-${credit}`,
    };
    setCourses([...courses, newCourse]);
    setcoursescode('');
    setcoursesname('');
    settheory('');
    setpractice('');
    setcredit('');
  };

  return (
    <div>
      <Sidebar />

      <div className='ml-65 mt-6'>
        <a href="dashboard" className='bg-red-500 text-white rounded-lg py-3 px-6 ml-5 hover:bg-red-600 transition'>ย้อนกลับ</a>

        <h1 className='text-center font-bold text-lg'>เพิ่มข้อมูลรายวิชา กลุ่มสมรรถนะภาษาและการสื่อสาร</h1>

        <div className='ml-10 mt-10'>
          <div className='flex space-x-4'>
            <div className='flex-1'>
              <label htmlFor="coursescode" className=' font-medium'>รหัสวิชา:</label>
              <input
                type="text"
                id="coursescode"
                value={coursescode}
                onChange={(e) => setcoursescode(e.target.value)}
                className='border-2 border-gray-700 rounded-lg ml-1 p-2'
              />

              <label htmlFor="coursesname" className='ml-5 font-medium'>ชื่อวิชา:</label>
              <input
                type="text"
                id="coursesname"
                value={coursesname}
                onChange={(e) => setcoursesname(e.target.value)}
                className='border-2 border-gray-700 rounded-lg ml-1 p-2 w-90'
              />

              <label htmlFor="theory" className='font-medium ml-1'>ทฤษฎี:</label>
              <input
                type="number"
                id="theory"
                value={theory}
                onChange={(e) => settheory(e.target.value)}
                className='border-2 border-gray-700 rounded-lg p-2 w-13'
                min="0"
                max="9"
              />

              <label htmlFor="practice" className='font-medium ml-1'>ปฏิบัติ:</label>
              <input
                type="number"
                id="practice"
                value={practice}
                onChange={(e) => setpractice(e.target.value)}
                className='border-2 border-gray-700 rounded-lg p-2 w-13 ml-1'
                min="0"
                max="9"
              />

              <label htmlFor="credit" className='font-medium ml-1'>หน่วยกิต:</label>
              <input
                type="number"
                id="credit"
                value={credit}
                onChange={(e) => setcredit(e.target.value)}
                className='border-2 border-gray-700 rounded-lg p-2 w-13 ml-1'
                min="0"
                max="9"
              />
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className='flex justify-center mt-5'>
            <button 
              onClick={handleAddCourse} 
              className='bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition'>
              บันทึก
            </button>
          </div>
        </div>

        {/* แสดงตารางรายวิชา */}
        <Addinfo courses={courses} totalCredits={totalCredits} />
      </div>
    </div>
  );
}

export default Courseadd;