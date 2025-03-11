// components/CourseTable.js
import React from 'react';

function CourseTable({ courses, totalCredits }) {
  return (
    <div className='ml-5 mt-5'>
      <div className='ml-5 mt-5'>
        <span className='text-lg ml-5'>1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร</span>
        <a href="#" className='ml-5 text-blue-500 text-lg'>เพิ่มข้อมูลรายวิชา</a>
      </div>
      <table className='ml-9 text-lg'>
        {/* เนื้อหาตาราง */}
        <tbody>
          {courses.map((course, index) => (
            <tr key={index}>
              <td className='p-3 text-center'>{course.id}</td>
              <td className='p-3 px-10 '>{course.name}</td>
              <td className='p-3 px-10 text-center'>{course.credits}</td>
            </tr>
          ))}
        </tbody>
        {/* ส่วนสรุปผลรวม */}
        <tfoot>
          <tr>
            <td className='p-1 text-center font-bold' colSpan="2"></td>
            <td className='p-1 text-center font-bold' colSpan="2">รวม: {totalCredits}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default CourseTable;