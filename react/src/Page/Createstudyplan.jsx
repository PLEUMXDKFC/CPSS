import React, { useState, useEffect } from 'react'
import Sidebar from '../components/sidebar'
import axios from 'axios';
import Swal from 'sweetalert2';
import { LucideEdit, LucideEye, LucideTrash, LucideCheck, LucideX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Createstudyplan() {
    const navigate=useNavigate();
    const [course, setCourse] = useState('');
    const [year, setYear] = useState('');
    const [student_id, setStudent_id] = useState('');
    const [message, setMessage] = useState('');
    const [plans, setPlans] = useState([]); // สร้าง state สำหรับเก็บข้อมูลแผน
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    
    // State สำหรับการแก้ไขแบบ inline
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        course: '',
        year: '',
        student_id: ''
    });

    // ฟังก์ชันสำหรับยกเลิกการกรอกข้อมูล
    const handleCancel = () => {
        setCourse(""); // รีเซ็ตหลักสูตร
        setYear(""); // รีเซ็ตพุทธศักราช
        setStudent_id(""); // รีเซ็ตรหัสนักศึกษา
    };

    // ฟังก์ชันสำหรับบันทึกข้อมูล
    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
        course: course,
        year: year,
        student_id: student_id
        };

        try {
        // ส่งข้อมูลไปยัง API ด้วย axios
        const response = await axios.post(`${API_BASE_URL}/server/api/POST/Insertstudyplan.php`, data);

        // ตรวจสอบการตอบกลับจาก API และแสดง SweetAlert
        if (response.data.message === "Data inserted successfully") {
            const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
            });
            Toast.fire({
            icon: "success",
            title: "ข้อมูลถูกบันทึกสำเร็จ!"
            });

            // เรียกใช้ฟังก์ชัน fetchData เพื่อดึงข้อมูลใหม่หลังบันทึกสำเร็จ
            fetchData();
            handleCancel(); // รีเซ็ตฟอร์ม
        }
        } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: 'ไม่สามารถบันทึกข้อมูลได้ โปรดลองใหม่อีกครั้ง.',
            confirmButtonText: 'ตกลง'
        });
        }
    };

    // ฟังก์ชันดึงข้อมูลจาก API
    const fetchData = async () => {
        try {
        const response = await axios.get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php`);
        setPlans(response.data); // อัปเดต state ด้วยข้อมูลจาก API
        } catch (error) {
        console.error("Error fetching data:", error);
        }
    };

    // ใช้ useEffect เพื่อดึงข้อมูลเมื่อ component ถูกโหลด
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', function () {
                if (this.value < 0) {
                    this.value = 0;
                }
            });
        });
    }, []);
    
    const handleDelete = async (planId) => {
    
        Swal.fire({
            title: 'คุณต้องการลบหลักสูตรนี้หรือไม่?',
            text: "ข้อมูลในหลักสูตรนี้จะหายทั้งหมด!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ใช่',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    let formData = new FormData();
                    formData.append('_method', 'DELETE');  // บอกว่าเป็น DELETE
                    formData.append('planid', planId);    // ส่ง planid
    
                    const response = await axios.post(`${API_BASE_URL}/server/api/DELETE/Deletestudyplan.php`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data' // บอกเซิร์ฟเวอร์ว่าเป็น FormData
                        }
                    });
    
                    if (response.data.status === "success") {
                        Swal.fire({
                            icon: 'success',
                            title: 'ลบข้อมูลสำเร็จ!',
                            text: 'ข้อมูลถูกลบออกจากระบบแล้ว',
                            confirmButtonText: 'ตกลง'
                        }).then(() => {
                            fetchData(); // รีเฟรชข้อมูลหลังจากลบ
                        });
                    } else {
                        console.warn("⚠️ Delete failed:", response.data);
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด!',
                            text: 'ไม่สามารถลบข้อมูลได้',
                            confirmButtonText: 'ตกลง'
                        });
                    }
                } catch (error) {
                    console.error("❌ Error deleting data:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด!',
                        text: 'ไม่สามารถลบข้อมูลได้',
                        confirmButtonText: 'ตกลง'
                    });
                }
            }
        });
    };
    
    
    // ฟังก์ชันสำหรับการแก้ไขแบบ inline
    const handleEditClick = (plan) => {
        setEditingId(plan.planid);
        setEditFormData({
            course: plan.course,
            year: plan.year,
            student_id: plan.student_id
        });
    };
    
    // ฟังก์ชันสำหรับการยกเลิกการแก้ไข
    const handleCancelEdit = () => {
        setEditingId(null);
    };
    
    // ฟังก์ชันสำหรับการเปลี่ยนแปลงข้อมูลในฟอร์มแก้ไข
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };
    
    // ฟังก์ชันสำหรับบันทึกข้อมูลที่แก้ไข
    const handleEditSubmit = async () => {
    
        try {
            const response = await axios.post(`${API_BASE_URL}/server/api/UPDATE/Updatestudyplan.php`, {
                planid: editingId,
                ...editFormData
            });
    
            if (response.data.status === "success") {
                const Toast = Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                });
                Toast.fire({
                    icon: "success",
                    title: "ข้อมูลถูกแก้ไขแล้ว!"
                });
    
                fetchData(); // รีเฟรชข้อมูล
                setEditingId(null); // ปิดโหมดแก้ไข
            } else {
                console.warn("⚠️ Update failed:", response.data);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: 'ไม่สามารถอัปเดตข้อมูลได้',
                    confirmButtonText: 'ตกลง'
                });
            }
        } catch (error) {
            console.error("❌ Error updating data:", error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถอัปเดตข้อมูลได้',
                confirmButtonText: 'ตกลง'
            });
        }
    };
    

    // Return the UI
    return (
        <>
        <div className="flex min-h-screen ">
        <Sidebar />
            <div className="ml-65 container mx-auto p-4 ">
                <h2 className="text-center mb-4 text-2xl font-bold">สร้างหลักสูตร</h2>

               <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-3 md:grid-cols-3 gap-2">
                        <div>
                            <label htmlFor="course" className="block font-medium">หลักสูตร</label>
                            <select
                                name="course"
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                className="border-2 border-gray-700 rounded-lg w-full p-2"
                                required
                            >
                                <option value="" disabled>เลือกหลักสูตร</option>
                                <option value="หลักสูตรประกาศณียบัตรวิชาชีพ">หลักสูตรประกาศณียบัตรวิชาชีพ</option>
                                <option value="หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง">หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง</option>
                                <option value="หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง (ม.6)">หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง (ม.6)</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="year" className="block font-medium">พุทธศักราช</label>
                            <input
                                type="number"
                                id="year"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="border-2 border-gray-700 rounded-lg w-full p-2"
                                placeholder="กรอกพุทธศักราช"
                                min="1000"
                                max="9999"
                                maxLength="4"
                                onInput={(e) => {
                                    if (e.target.value.length > 4) {
                                        e.target.value = e.target.value.slice(0, 4);
                                    }
                                }}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="student_id" className="block font-medium">รหัสนักศึกษา</label>
                            <input
                                type="number"
                                name="student_id"
                                value={student_id}
                                onChange={(e) => setStudent_id(e.target.value)}
                                className="border-2 border-gray-700 rounded-lg w-full p-2"
                                placeholder="กรอกรหัสนักศึกษา"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="text-center mt-4 mb-4">
                        <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 cursor-pointer transition duration-300 ease-in-out">
                            บันทึก
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 cursor-pointer transition duration-300 ease-in-out ml-4"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>

                {message && <div className="text-center text-green-500 mt-4">{message}</div>}

                {/* table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 p-2">หลักสูตร</th>
                                <th className="border border-gray-300 p-2">พุทธศักราช</th>
                                <th className="border border-gray-300 p-2">รหัส</th>
                                <th className="border border-gray-300 p-2">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={plan.planid}>
                                    <td className="border border-gray-300 p-2">
                                        {editingId === plan.planid ? (
                                            <select
                                                name="course"
                                                value={editFormData.course}
                                                onChange={handleEditFormChange}
                                                className="border border-gray-500 rounded w-full p-1"
                                                required
                                            >
                                                <option value="หลักสูตรประกาศณียบัตรวิชาชีพ">หลักสูตรประกาศณียบัตรวิชาชีพ</option>
                                                <option value="หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง">หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง</option>
                                                <option value="หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง (ม.6)">หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง (ม.6)</option>
                                            </select>
                                        ) : (
                                            plan.course
                                        )}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        {editingId === plan.planid ? (
                                            <input
                                                type="number"
                                                name="year"
                                                value={editFormData.year}
                                                onChange={handleEditFormChange}
                                                className="border border-gray-500 rounded w-full p-1"
                                                min="1000"
                                                max="9999"
                                                required
                                            />
                                        ) : (
                                            plan.year
                                        )}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        {editingId === plan.planid ? (
                                            <input
                                                type="number"
                                                name="student_id"
                                                value={editFormData.student_id}
                                                onChange={handleEditFormChange}
                                                className="border border-gray-500 rounded w-full p-1"
                                                min="0"
                                                required
                                            />
                                        ) : (
                                            plan.student_id
                                        )}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center">
                                        {editingId === plan.planid ? (
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
                                                <button onClick={()=>navigate(`/courseinfo/${plan.planid}`)} className="bg-yellow-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-yellow-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2">
                                                    <LucideEye size={16} /> ดูข้อมูลรายวิชา
                                                </button>
                                        
                                                <button 
                                                    type="button"
                                                    onClick={() => handleEditClick(plan)}
                                                    className="bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2"
                                                >
                                                    <LucideEdit size={16} /> แก้ไข
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(plan.planid)}
                                                    className="bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2"
                                                >
                                                    <LucideTrash size={16} /> ลบ
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </>
    )
}

export default Createstudyplan