import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, School } from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function RoomGroupSchedule() {
    const navigate = useNavigate();
    const location = useLocation();

    // Receive room and student_id from previous page
    const { room, student_id } = location.state || {};

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!room || !student_id) return;

        axios.get(`${API_BASE_URL}/server/api/GET/Get_group_information.php`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];

                // Filter by Student ID (Plan)
                const filtered = data.filter((p) => String(p.student_id) === String(student_id));

                // Grouping Logic
                const groupedBySublevel = {};
                filtered.forEach((plan) => {
                    const level = plan.sublevel;
                    const group = plan.group_name;
                    if (!groupedBySublevel[level]) groupedBySublevel[level] = {};
                    if (!groupedBySublevel[level][group]) groupedBySublevel[level][group] = [];
                    groupedBySublevel[level][group].push(plan);
                });

                const orderedLevels = [
                    "ปวช.1", "ปวช.2", "ปวช.3",
                    "ปวส.1", "ปวส.2",
                    "ปวส.1 ม.6", "ปวส.2 ม.6"
                ];

                const finalGrouped = orderedLevels
                    .filter((level) => groupedBySublevel[level])
                    .map((level) => ({
                        level,
                        groups: Object.entries(groupedBySublevel[level])
                            .sort(([a], [b]) => parseInt(a) - parseInt(b))
                            .map(([group, plans]) => ({
                                group,
                                plans: plans.sort((a, b) => {
                                    const aIsSummer = a.summer !== null;
                                    const bIsSummer = b.summer !== null;
                                    if (a.year !== b.year) return a.year - b.year;
                                    if (aIsSummer !== bIsSummer) return aIsSummer ? 1 : -1;
                                    return a.term - b.term;
                                }),
                            })),
                    }));

                setPlans(finalGrouped);
            })
            .catch((err) => console.error("Error fetching plans:", err))
            .finally(() => setLoading(false));
    }, [room, student_id]);

    const handleBack = () => {
        navigate("/RoomYearSchedule", { state: { room } });
    };

    const handleSelectPlan = (plan) => {
        let globalTerm = parseInt(plan.term);
        const level = plan.sublevel;

        // Map Term 1/2 to Global Term 3,4,5,6 based on level
        if (level.includes("ปวช.2") || level.includes("ปวส.2")) {
            globalTerm += 2;
        } else if (level.includes("ปวช.3")) {
            globalTerm += 4;
        }

        navigate(`/RoomHistoryTable/${room.room_id}`, {
            state: {
                room: room,
                room_id: room.room_id,
                planid: plan.planid,
                infoid: plan.infoid,
                term: globalTerm,
                year: plan.year,
                group_name: plan.group_name,
                sublevel: plan.sublevel,
            },
        });
    };

    if (!room || !student_id) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>ข้อมูลไม่ครบถ้วน กรุณากลับไปเลือกใหม่</p>
                <button onClick={() => navigate("/IntoRoomSchedule")} className="ml-4 text-blue-600 underline">กลับหน้าแรก</button>
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
                    ห้อง {room.room_name} ({room.room_type}) | รหัสรุ่น {student_id}
                </h3>

                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                    เลือกกลุ่มการเรียน
                </h4>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        ไม่พบข้อมูลกลุ่มการเรียนในแผนการเรียนนี้
                    </div>
                ) : (
                    plans.map(({ level, groups }) => (
                        <div key={level} className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-1">{level}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groups.map(({ group, plans: groupPlans }) => (
                                    <div key={group}>
                                        <h4 className="text-xl font-semibold text-gray-700 mb-2">กลุ่ม ก.{group}</h4>
                                        {groupPlans.map((plan) => (
                                            <div
                                                key={plan.infoid}
                                                className="bg-white shadow-sm rounded-xl p-4 mb-3 hover:shadow-md hover:text-blue-600 transition cursor-pointer border border-gray-100"
                                                onClick={() => handleSelectPlan(plan)}
                                            >
                                                <p className="font-semibold text-lg">ปีการศึกษา {plan.year}</p>
                                                <p className="text-gray-600">
                                                    {plan.summer ? "ภาคฤดูร้อน" : `ภาคเรียนปกติ ${plan.term} เทอม`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default RoomGroupSchedule;
