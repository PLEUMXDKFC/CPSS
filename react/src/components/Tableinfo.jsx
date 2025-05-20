import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Tableinfo({ planid, subject_groups, subject_category }) {
  const [filteredCourses, setFilteredCourses] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchFilteredCourses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/server/api/GET/Courses.php`, {
          params: {
            planid: planid,
            subject_groups: subject_groups,
            subject_category: subject_category,
          },
        });
        setFilteredCourses(response.data);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา:', error);
      }
    };

    fetchFilteredCourses();
  }, [planid, subject_groups, subject_category]);

  // คำนวณหน่วยกิตรวมของหมวดและกลุ่ม
  const totalCredits = filteredCourses.reduce((sum, course) => sum + parseFloat(course.credit || 0), 0);

  return (
    <table className='text-lg border-collapse w-full table-fixed'>
      <thead>
        <tr>
          {/* <th className='p-3 text-center '></th>
          <th className='p-3 text-left '></th>
          <th className='p-3 text-center '></th> */}
        </tr>
      </thead>
      <tbody>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <tr key={index}>
              <td className='p-3 text-center truncate'>{course.course_code}</td>
              <td className='p-3 text-left truncate'>{course.course_name}</td>
              <td className='p-3 text-center truncate'>{course.theory}-{course.comply}-{course.credit}</td>
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
      <tfoot>
        <tr className="bg-white font-bold">
          <td colSpan="2" className="p-3 text-right"></td>
          <td className="p-3 text-center">รวม: {totalCredits}</td>
        </tr>
      </tfoot>
    </table>
  );
}

export default Tableinfo;
