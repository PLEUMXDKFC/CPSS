import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function TeacherGroupSchedule() {
    const navigate = useNavigate();
    const location = useLocation();

    // รับข้อมูลจากหน้าที่แล้ว (student_id แทน year)
    const { teacher, student_id } = location.state || {};

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!teacher || !student_id) return;

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

                                    // Sort logic: Year Ascending, then Term
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
    }, [teacher, student_id]);

    const handleBack = () => {
        navigate("/TeacherYearSchedule", { state: { teacher } });
    };

    const getTerms = (plan) => {
        const level = plan.sublevel || "";
        // Check level first to enforce correct terms for known levels
        if (level.includes("ปวช.1") || level.includes("ปวส.1")) return ["1", "2"];
        if (level.includes("ปวช.2") || level.includes("ปวส.2")) return ["3", "4"];
        if (level.includes("ปวช.3")) return ["5", "6"];

        if (plan.subterm) return plan.subterm.split("-").map(t => t.trim());
        return ["1", "2"];
    };

    const handleSelectPlan = (plan) => {
        navigate(`/TeacherHistoryTable/${teacher.teacher_id}`, {
            state: {
                teacher: teacher,
                teacher_id: teacher.teacher_id,
                planid: plan.planid,
                infoid: plan.infoid,
                term: plan.term,
                subterm: plan.subterm,
                sublevel: plan.sublevel,
                terms: getTerms(plan),
                year: plan.year,
                group_name: plan.group_name,
            },
        });
    };

    if (!teacher || !student_id) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>ข้อมูลไม่ครบถ้วน กรุณากลับไปเลือกใหม่</p>
                <button onClick={() => navigate("/IntoTeacherSchedule")} className="ml-4 text-blue-600 underline">กลับหน้าแรก</button>
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
                    ครู{teacher.fname} {teacher.lname} | รหัสรุ่น {student_id}
                </h3>

                <h4 className="text-xl font-semibold text-gray-700 mb-6 border-l-4 border-blue-500 pl-3">
                    เลือกกลุ่มการเรียน
                </h4>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">กำลังโหลด...</div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        ไม่พบข้อมูลกลุ่มการเรียนในแผนการเรียนนี้
                    </div>
                ) : (
                    plans.map(({ level, groups }) => (
                        <div key={level} className="mb-10">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-1">{level}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groups.map(({ group, plans: groupPlans }) => (
                                    <div key={group}>
                                        <h4 className="text-xl font-semibold text-gray-700 mb-2">กลุ่ม ก.{group}</h4>
                                        {groupPlans.map((plan) => (
                                            <div
                                                key={plan.infoid}
                                                className="bg-white shadow-md rounded-xl p-4 mb-4 hover:bg-blue-100 transition cursor-pointer border border-gray-100"
                                                onClick={() => handleSelectPlan(plan)}
                                            >
                                                <p className="text-gray-800 font-medium">ปีการศึกษา {plan.year}</p>
                                                <p className="text-blue-600">
                                                    {plan.summer ? "ภาคฤดูร้อน" : `ภาคเรียนปกติ ${plan.term} เทอม`}
                                                </p>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    (รหัสรุ่น {plan.student_id})
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

export default TeacherGroupSchedule;
