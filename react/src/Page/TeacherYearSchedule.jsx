import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function TeacherYearSchedule() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // รับ teacher object จากหน้าที่แล้ว
    const { teacher } = location.state || {}; // { teacher: { teacher_id, fname, lname, ... } }

    const [uniquePlans, setUniquePlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!teacher) return;

        axios.get(`${API_BASE_URL}/server/api/GET/Get_group_information.php`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                
                // Extract unique student_id (Plan Code) AND plan_year
                const planMap = new Map();
                data.forEach(p => {
                    if (p.student_id != null && !planMap.has(p.student_id)) {
                        planMap.set(p.student_id, p.plan_year);
                    }
                });

                const plans = Array.from(planMap.entries())
                    .map(([id, year]) => ({ id, year }))
                    .sort((a, b) => b.id - a.id); // Sort by ID descending

                setUniquePlans(plans);
            })
            .catch((err) => console.error("Error fetching plans:", err))
            .finally(() => setLoading(false));
    }, [teacher]);

    const handleBack = () => {
        navigate("/IntoTeacherSchedule");
    };

    const handleSelectPlan = (student_id) => {
        navigate("/TeacherGroupSchedule", {
            state: {
                teacher: teacher,
                student_id: student_id
            }
        });
    };

    if (!teacher) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>ไม่พบข้อมูลครู กรุณากลับไปเลือกใหม่</p>
                <button onClick={() => navigate("/IntoTeacherSchedule")} className="ml-4 text-blue-600 underline">กลับ</button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="ml-65 container mx-auto p-6">
                
                <button onClick={handleBack} className="mb-6 flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                                        <ArrowLeft size={20} />
                                        <span className="font-medium">ย้อนกลับ</span>
                </button>

                <h2 className="text-center text-3xl font-bold mb-2">ตารางสอนครู</h2>
                <h3 className="text-center text-xl text-gray-600 mb-8">
                    ครู{teacher.fname} {teacher.lname}
                </h3>

                <h4 className="text-xl font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
                    เลือกแผนการเรียน (รหัสรุ่น)
                </h4>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">กำลังโหลด...</div>
                ) : uniquePlans.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        ไม่พบข้อมูลแผนการเรียน
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {uniquePlans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-white shadow-md rounded-xl p-6 cursor-pointer hover:bg-blue-50 hover:shadow-lg transition-all border border-gray-100"
                                onClick={() => handleSelectPlan(plan.id)}
                            >
                                <h3 className="text-2xl font-bold text-blue-600 mb-2">
                                    ตารางเรียน รหัส: {plan.id}
                                </h3>
                                <p className="text-gray-500">
                                    ปีการศึกษา {plan.year || "-"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeacherYearSchedule;
