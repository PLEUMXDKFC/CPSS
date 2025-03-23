import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';
import { LucideEdit, LucideTrash, LucideCheck, LucideX } from 'lucide-react';
import Swal from 'sweetalert2';

const Addinfo = forwardRef(({ planid, subject_groups, subject_category }, ref) => {
  const [filteredCourses, setFilteredCourses] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [editingId, setEditingId] = useState(null); // เก็บ ID ของรายวิชาที่กำลังแก้ไข
  const [editFormData, setEditFormData] = useState({
    course_code: '',
    course_name: '',
    theory: '',
    comply: '',
    credit: '',
  });

  // ฟังก์ชันที่ใช้ดึงข้อมูล
  const fetchFilteredCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/server/api/GET/Courses.php`, {
        params: {
          planid: planid,
          subject_groups: subject_groups,
          subject_category: subject_category,
        },
      });
      console.log('API Response:', response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา:', error);
    }
  };

  // ส่งฟังก์ชัน `fetchFilteredCourses` ไปให้ Parent ผ่าน ref
  useImperativeHandle(ref, () => ({
    fetchFilteredCourses
  }));

  // ดึงข้อมูลรายวิชาเมื่อ planid, subject_groups, หรือ subject_category เปลี่ยนแปลง
  useEffect(() => {
    fetchFilteredCourses();
  }, [planid, subject_category, subject_groups]);

  // เปิดโหมดแก้ไข
  const handleEditClick = (course) => {
    setEditingId(course.subject_id);
    setEditFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      theory: course.theory,
      comply: course.comply,
      credit: course.credit,
    });
  };

  // อัปเดตข้อมูลในฟอร์มแก้ไข
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // บันทึกข้อมูลที่แก้ไข
  const handleEditSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/server/api/UPDATE/Updatecourse.php`, {
        subject_id: editingId,
        ...editFormData,
      });

      if (response.data.status === "success") {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'รายวิชาถูกอัปเดตเรียบร้อยแล้ว',
          confirmButtonText: 'ตกลง',
        }).then(() => {
          fetchFilteredCourses(); // รีเฟรชข้อมูลหลังจากอัปเดต
          setEditingId(null); // ปิดโหมดแก้ไข
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: response.data.message || 'ไม่สามารถอัปเดตรายวิชาได้',
          confirmButtonText: 'ตกลง',
        });
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัปเดตรายวิชา:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตรายวิชาได้',
        confirmButtonText: 'ตกลง',
      });
    }
  };

  // ยกเลิกการแก้ไข
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // ฟังก์ชันสำหรับการลบรายวิชา
  const handleDelete = async (subject_id) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณจะไม่สามารถย้อนกลับการลบได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.post(`${API_BASE_URL}/server/api/DELETE/Deletecourses.php`, {
          subject_id: subject_id,
        });

        console.log('คำตอบจาก API:', response.data);

        if (response.data.status === "success") {
          Swal.fire({
            icon: 'success',
            title: 'ลบรายวิชาสำเร็จ!',
            text: 'รายวิชาถูกลบออกจากระบบแล้ว',
            confirmButtonText: 'ตกลง',
          }).then(() => {
            fetchFilteredCourses(); // รีเฟรชข้อมูลหลังจากลบ
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: response.data.message || 'ไม่สามารถลบรายวิชาได้',
            confirmButtonText: 'ตกลง',
          });
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบรายวิชา:', error.response?.data || error.message);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: error.response?.data?.message || 'ไม่สามารถลบรายวิชาได้',
          confirmButtonText: 'ตกลง',
        });
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 mt-3">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-3">รหัสวิชา</th>
            <th className="border border-gray-300 p-3">ชื่อวิชา</th>
            <th className="border border-gray-300 p-3">ทฤษฎี</th>
            <th className="border border-gray-300 p-3">ปฏิบัติ</th>
            <th className="border border-gray-300 p-3">หน่วยกิต</th>
            <th className="border border-gray-300 p-3">การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <tr key={index}>
                <td className="p-3 text-center border border-gray-300">
                  {editingId === course.subject_id ? (
                    <input
                      type="text"
                      name="course_code"
                      value={editFormData.course_code}
                      onChange={handleEditFormChange}
                      className="border border-gray-500 rounded w-full p-1"
                    />
                  ) : (
                    course.course_code
                  )}
                </td>
                <td className="p-3 px-10 border border-gray-300">
                  {editingId === course.subject_id ? (
                    <input
                      type="text"
                      name="course_name"
                      value={editFormData.course_name}
                      onChange={handleEditFormChange}
                      className="border border-gray-500 rounded w-full p-1"
                    />
                  ) : (
                    course.course_name
                  )}
                </td>
                <td className="p-3 px-10 text-center border border-gray-300">
                  {editingId === course.subject_id ? (
                    <input
                      type="number"
                      name="theory"
                      value={editFormData.theory}
                      onChange={handleEditFormChange}
                      className="border border-gray-500 rounded w-full p-1"
                    />
                  ) : (
                    course.theory
                  )}
                </td>
                <td className="p-3 px-10 text-center border border-gray-300">
                  {editingId === course.subject_id ? (
                    <input
                      type="number"
                      name="comply"
                      value={editFormData.comply}
                      onChange={handleEditFormChange}
                      className="border border-gray-500 rounded w-full p-1"
                    />
                  ) : (
                    course.comply
                  )}
                </td>
                <td className="p-3 px-10 text-center border border-gray-300">
                  {editingId === course.subject_id ? (
                    <input
                      type="number"
                      name="credit"
                      value={editFormData.credit}
                      onChange={handleEditFormChange}
                      className="border border-gray-500 rounded w-full p-1"
                    />
                  ) : (
                    course.credit
                  )}
                </td>
                <td className="p-3 px-10 text-center border border-gray-300">
                  {editingId === course.subject_id ? (
                    <div className="flex space-x-1 justify-center">
                      <button
                        type="button"
                        onClick={handleEditSubmit}
                        className="bg-green-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2"
                      >
                        <LucideCheck size={16} /> บันทึก
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-gray-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2"
                      >
                        <LucideX size={16} /> ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-1 justify-center">
                      <button
                        type="button"
                        onClick={() => handleEditClick(course)}
                        className="bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2"
                      >
                        <LucideEdit size={16} /> แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(course.subject_id)}
                        className="bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2"
                      >
                        <LucideTrash size={16} /> ลบ
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-3 text-center text-gray-500">
                ไม่มีรายวิชาที่เพิ่ม
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default Addinfo;