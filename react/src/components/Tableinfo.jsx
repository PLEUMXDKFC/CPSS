import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Tableinfo({ planid, subject_groups, subject_category }) {
  const [filteredCourses, setFilteredCourses] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  // ใช้ useEffect เพื่อดึงข้อมูลเมื่อ planid หรือ subject_groups เปลี่ยนแปลง
  useEffect(() => {
    const fetchFilteredCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/server/api/GET/Courses.php`, {
          params: {
            planid: planid, // ส่ง planid ไปยัง API
            subject_groups: subject_groups,
            subject_category: subject_category,
            

          },
        });
        console.log('API Response:', response.data); // ตรวจสอบข้อมูลที่ได้จาก API
        setFilteredCourses(response.data);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา:', error);
      }
    };
    console.log('Filtered Courses:', filteredCourses);

    
    fetchFilteredCourses();
  }, [planid, subject_groups, subject_category]);

  return (
    <table className='ml-9 text-lg'>
      <thead>
        <tr>
          <th className='p-3 text-center'>รหัสวิชา</th>
          <th className='p-3 px-10'>ชื่อวิชา</th>
          <th className='p-3 px-10 text-center'>ท-ป-น</th>
        </tr>
      </thead>
      <tbody>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <tr key={index}>
              <td className='p-3 text-center'>{course.course_code}</td>
              <td className='p-3 px-10'>{course.course_name}</td>
              <td className='p-3 px-10 text-center'>{course.theory}-{course.comply}-{course.credit}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan='3' className='p-3 text-center text-gray-500'>
              ไม่มีรายวิชาที่เพิ่ม
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default Tableinfo;