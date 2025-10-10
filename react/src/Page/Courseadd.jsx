import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from '../components/sidebar';
import Addinfo from '../components/Addinfo';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ArrowLeft } from "lucide-react";

function Courseadd() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const planid = searchParams.get('planid');
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const addinforef = useRef(null);
  const navigate = useNavigate();


  const displayText = category && subcategory ? subcategory : category || '';

  const [course_code, setcourse_code] = useState('');
  const [course_name, setcourse_name] = useState('');
  const [theory, settheory] = useState('');
  const [comply, setcomply] = useState('');
  const [credit, setcredit] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [courses, setCourses] = useState([]);

  // จัดรูปแบบรหัสวิชาอัตโนมัติ
  const handleCourseCodeChange = (e) => {
    let value = e.target.value.replace(/[^0-9\-]/g, '');
    if (value.length > 5 && value.charAt(5) !== '-') {
      value = value.slice(0, 5) + '-' + value.slice(5);
    }
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    setcourse_code(value);
  };

  // ดึงข้อมูลจาก API เมื่อหน้าโหลด
  const handleAddCourse = async () => {
    
    if (!course_code || !course_name || !theory || !comply || !credit) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบถ้วน',
        text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
      });
      return;
    }

    const newCourse = {
      course_code: course_code,
      course_name: course_name,
      theory: theory,
      comply: comply,
      credit: credit,
      subject_category: category,
      subject_groups: subcategory,
      planid: planid,
    };
  
    try {
      const response = await axios.post(`${API_BASE_URL}/server/api/POST/Courseadd.php`, newCourse);
      console.log('คำตอบจาก API:', response); // ตรวจสอบคำตอบจาก API
  
      // ตรวจสอบสถานะและข้อมูลที่ส่งกลับมา
      if (response.status === 201 || response.status === 200) {
        setCourses([...courses, newCourse]);
        setcourse_code('');
        setcourse_name('');
        settheory('');
        setcomply('');
        setcredit('');
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'รายวิชาถูกเพิ่มเรียบร้อยแล้ว',
      }).then(() => {
        addinforef.current.fetchFilteredCourses();
      });

      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: response.data.message || 'ไม่สามารถเพิ่มรายวิชาได้',
        });
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มรายวิชา:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.response?.data?.message || 'ไม่สามารถเพิ่มรายวิชาได้',
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
};
  return (
    <div className='flex min-h-screen'>
      <Sidebar />
      <div className='ml-65 container mx-auto p-4'>
        <button onClick={handleBack} className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
          <ArrowLeft size={20} />
          <span className="font-medium">ย้อนกลับ</span>
        </button>

        <h1 className='text-center mb-4 text-2xl font-bold'>เพิ่มข้อมูลรายวิชา {decodeURIComponent(displayText)}</h1>

        <div className='ml-10 mt-10'>
          <div className='flex flex-col space-y-4'>
            <div className='flex items-center space-x-2 '>
              <label htmlFor="coursescode" className='font-medium'>รหัสวิชา:</label>
              <input
                type="text"
                id="coursescode"
                value={course_code}
                onChange={handleCourseCodeChange}
                className='border-2 border-gray-700 rounded-lg ml-1 p-2'
              />

              <label htmlFor="coursesname" className='ml-5 font-medium'>ชื่อวิชา:</label>
              <input
                type="text"
                id="coursesname"
                value={course_name}
                onChange={(e) => setcourse_name(e.target.value)}
                className='border-2 border-gray-700 rounded-lg ml-1 p-2 w-90'
              />

              <label htmlFor="theory" className='font-medium ml-1'>ท:</label>
              <input
                type="number"
                id="theory"
                value={theory}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1); 
                  settheory(value);
                }}
                className='border-2 border-gray-700 rounded-lg p-2 flex-1'
                min="0"
                max="9"
              />

              <label htmlFor="comply" className='font-medium ml-1'>ป:</label>
              <input
                type="number"
                id="comply"
                value={comply}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
                    setcomply(value);
                  }}
                className='border-2 border-gray-700 rounded-lg p-2 flex-1 ml-1'
                min="0"
                max="9"
              />

              <label htmlFor="credit" className='font-medium ml-1'>น:</label>
              <input
                type="number"
                id="credit"
                value={credit}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
                  setcredit(value);
                }}
                className='border-2 border-gray-700 rounded-lg p-2 flex-1 ml-1'
                min="0"
                max="9"
              />
            </div>
          </div>

          <div className='flex justify-center mt-5'>
            <button
              onClick={handleAddCourse}
              className='bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition'
            >
              บันทึก
            </button>
          </div>
        </div>

        <Addinfo subject_groups={subcategory} subject_category={category} planid={planid} ref={addinforef} />
      </div>
    </div>
  );
}

export default Courseadd;
