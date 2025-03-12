// components/Addinfo.js
import React from 'react';

function Addinfo({ courses, totalCredits }) {
  return (
    <div className='flex justify-center items-center mt-5'> {/* จัดเนื้อหาให้อยู่กึ่งกลาง */}
      <div className='w-full max-w-4xl'> {/* กำหนดความกว้างสูงสุดของตาราง */}
        <table className='border-collapse border border-gray-300 w-full mt-3'>
          {/* หัวตาราง */}
          <thead>
            <tr className='bg-gray-200'>
              <th className='border border-gray-300 p-3 w-40'>รหัสวิชา</th>
              <th className='border border-gray-300 p-3 w-90'>ชื่อวิชา</th>
              <th className='border border-gray-300 p-3'>หน่วยกิต</th>
              <th className='border border-gray-300 p-3'>การดำเนินการ</th>
            </tr>
          </thead>
          {/* เนื้อหาตาราง */}
          <tbody>
            {courses.map((course, index) => (
              <tr key={index} className='hover:bg-gray-100'>
                <td className='border border-gray-300 p-3 text-center'>{course.id}</td>
                <td className='border border-gray-300 p-3'>{course.name}</td>
                <td className='border border-gray-300 p-3 text-center'>{course.credits}</td>
                <td className='border border-gray-300 p-3 text-center'>
                  <button className='bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition'>
                    แก้ไข
                  </button>
                  <button className='bg-red-500 text-white py-1 px-3 rounded-md ml-2 hover:bg-red-600 transition'>
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {/* ส่วนสรุปผลรวม */}
          <tfoot>
            <tr className='bg-gray-200'>
              <td className='border border-gray-300 p-1 text-center font-bold' colSpan="2"></td>
              <td className='border border-gray-300 p-1 text-center font-bold'>รวม: {totalCredits}</td>
              <td className='border border-gray-300 p-1 text-center font-bold'></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default Addinfo;