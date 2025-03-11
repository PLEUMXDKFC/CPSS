import React,{ useState, useEffect } from 'react'
import Sidebar from '../components/sidebar'
import axios from 'axios';
import Swal from 'sweetalert2';

function Createstudyplan() {
    const [course, setCourse] = useState('');
    const [year, setYear] = useState('');
    const [student_id, setStudent_id] = useState('');
    const [group, setGroup] = useState('');
    const [message, setMessage] = useState('');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleCancel = () => {
        setCourse(""); // รีเซ็ตหลักสูตร
        setYear(""); // รีเซ็ตพุทธศักราช
        setStudent_id(""); // รีเซ็ตรหัสนักศึกษา
        setGroup(""); // รีเซ็ตกลุ่ม
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
        course: course,
        year: year,
        student_id: student_id,
        group: group
        };

        console.log('ข้อมูลที่กรอก:', data);        
        try {
            // ส่งข้อมูลไปยัง API ด้วย axios
            const response = await axios.post(`${API_BASE_URL}/server/api/POST/Insertstudyplan.php`, data);
            console.log("API Response:", response); // ตรวจสอบค่า response ที่ได้รับ
            
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
            }
        } catch (error) {
            // หากเกิดข้อผิดพลาดแสดง SweetAlert
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถบันทึกข้อมูลได้ โปรดลองใหม่อีกครั้ง.',
                confirmButtonText: 'ตกลง'
            });
        }
    }

    const [plans, setPlans] = useState([]); // สร้าง state เพื่อเก็บข้อมูล

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

    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function () {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            let planId = this.getAttribute('data-id');

            Swal.fire({
                title: 'คุณแน่ใจหรือไม่?',
                text: "คุณต้องการลบแผนการเรียนนี้หรือไม่?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'ใช่',
                cancelButtonText: 'ยกเลิก'
            }).then((result) => {
                if (result.isConfirmed) {
                    // ส่งฟอร์มหลังจากยืนยัน
                    document.getElementById('delete-form-' + planId).submit();
                }
            });
        });
    });

    // Return the UI

  return (
    <>
    <div className="flex min-h-screen">
    <Sidebar />
        <div className="ml-65 container mx-auto p-4">
                <h2 className="text-center mb-4 text-2xl font-bold">สร้างหลักสูตร</h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

                        <div>
                            <label htmlFor="group" className="block font-medium">กลุ่ม</label>
                            <select
                                name="group"
                                value={group}
                                onChange={(e) => setGroup(e.target.value)}
                                className="border-2 border-gray-700 rounded-lg w-full p-2"
                                required
                            >
                                <option value="" disabled>เลือกกลุ่ม</option>
                                <option value="1">1</option>
                                <option value="1-2">1-2</option>
                                <option value="3">3</option>
                                <option value="3-4">3-4</option>
                                <option value="5">5</option>
                                <option value="5-6">5-6</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-center mt-4 mb-4">
                        <button type="submit" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 cursor-pointer transition duration-300 ease-in-out">
                            บันทึก
                        </button>

                        <button
                            type="button" // เปลี่ยน type เป็น "button"
                            onClick={handleCancel} // เพิ่ม onClick เพื่อเรียกฟังก์ชัน handleCancel
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
                            <th className="border border-gray-300 p-2">กลุ่ม</th>
                            <th className="border border-gray-300 p-2">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.map((plan) => (
                            <tr key={plan.planid}>
                                <td className="border border-gray-300 p-2">{plan.course}</td>
                                <td className="border border-gray-300 p-2">{plan.year}</td>
                                <td className="border border-gray-300 p-2">{plan.student_id}</td>
                                <td className="border border-gray-300 p-2">{plan.group}</td>
                                <td className="border border-gray-300 p-2 text-center">
                                    <div className="flex space-x-1 justify-center">
                                        <a href="{{ route('subjects.subject', $plan->planid) }}" className="bg-yellow-500  px-4 py-2 text-sm rounded-lg hover:bg-yellow-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2">
                                            <i data-lucide="eye"></i> ดูข้อมูลรายวิชา
                                        </a>
                                
                                        <a href="{{ route('plan.edit', $plan->planid) }}" className="bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2">
                                            <i data-lucide="edit"></i> แก้ไข
                                        </a>
                                        <form action="{{ route('plan.destroy', $plan->planid) }}" method="POST" id="delete-form-{{ $plan->planid }}">
                                            <button type="button" className="bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 cursor-pointer transition duration-300 ease-in-out delete-btn flex items-center gap-x-2" data-id="{{ $plan->planid }}">
                                                <i data-lucide="trash"></i> ลบ
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* table */}
            
        </div>
    </div>
    </>
  )
}

export default Createstudyplan