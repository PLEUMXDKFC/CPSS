import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, School } from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function RoomYearSchedule() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Receive room object from previous page
    const { room } = location.state || {}; // { room: { room_id, room_name, room_type } }

    const [uniquePlans, setUniquePlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!room) return;

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
    }, [room]);

    const handleBack = () => {
        navigate("/IntoRoomSchedule");
    };

    const handleSelectPlan = (student_id) => {
        navigate("/RoomGroupSchedule", {
            state: {
                room: room,
                student_id: student_id
            }
        });
    };

    if (!room) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>ไม่พบข้อมูลห้องเรียน กรุณากลับไปเลือกใหม่</p>
                <button onClick={() => navigate("/IntoRoomSchedule")} className="ml-4 text-blue-600 underline">กลับ</button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <div className="flex-1 p-8 ml-64">
                
                <button onClick={handleBack} className="mb-6 flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                                        <ArrowLeft size={20} />
                                        <span className="font-medium">ย้อนกลับ</span>
                </button>

                <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                    <School className="text-blue-600" />
                    ตารางการใช้ห้อง
                </h2>
                <h3 className="text-xl text-gray-600 mb-8 border-l-4 border-blue-500 pl-3">
                    ห้อง {room.room_name} <span className="text-sm bg-gray-200 px-2 py-1 rounded ml-2">{room.room_type}</span>
                </h3>

                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                    เลือกแผนการเรียน (รหัสรุ่น)
                </h4>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>
                ) : uniquePlans.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        ไม่พบข้อมูลแผนการเรียน
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {uniquePlans.map((plan) => (
                            <div
                                key={plan.id}
                                className="bg-white shadow-sm rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all border border-gray-100 group"
                                onClick={() => handleSelectPlan(plan.id)}
                            >
                                <h3 className="text-xl font-bold text-blue-600 mb-2 group-hover:text-blue-700">
                                    รหัสรุ่น: {plan.id}
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

export default RoomYearSchedule;
