import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, Search, Calendar, User, ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatPrefix = (prefix) => {
    if (!prefix) return "";
    const map = {
        "อ.": "อาจารย์",
        "ผศ.": "ผู้ช่วยศาสตราจารย์",
        "รศ.": "รองศาสตราจารย์",
        "ศ.": "ศาสตราจารย์",
        "ดร.": "ด็อกเตอร์",
        "นาย": "นาย",
        "นาง": "นาง",
        "น.ส.": "นางสาว",
    };
    return map[prefix] || prefix;
};

function IntoTeacherSchedule() {
    const navigate = useNavigate();
    const location = useLocation();

    // ── Step 1: เลือกแผนการเรียน ──
    const [plans, setPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null); // เมื่อเลือกแล้วจะเก็บ plan object

    // ── Step 2: เลือกครู ──
    const [teachers, setTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // ── Fetch แผนการเรียนทั้งหมด ──
    useEffect(() => {
        axios.get(`${API_BASE_URL}/server/api/GET/Get_group_information.php`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];

                const groupedBySublevel = {};
                data.forEach((plan) => {
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
                                    if (a.year !== b.year) return a.year - b.year;
                                    const aIsSummer = a.summer !== null;
                                    const bIsSummer = b.summer !== null;
                                    if (aIsSummer !== bIsSummer) return aIsSummer ? 1 : -1;
                                    return 0;
                                }),
                            })),
                    }));

                setPlans(finalGrouped);
            })
            .catch((err) => console.error("Error fetching plans:", err))
            .finally(() => setLoadingPlans(false));
    }, []);

    // ── Fetch รายชื่อครู (เมื่อเลือกแผนแล้ว) ──
    useEffect(() => {
        if (!selectedPlan) return;
        setLoadingTeachers(true);
        axios.get(`${API_BASE_URL}/server/api/GET/get_teachers.php`)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setTeachers(res.data);
                } else {
                    setTeachers([]);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoadingTeachers(false));
    }, [selectedPlan]);

    const filteredTeachers = teachers.filter((t) => {
        const full = `${t.prefix || ""} ${t.fname || ""} ${t.lname || ""} ${t.department || ""}`.toLowerCase();
        return full.includes(searchTerm.toLowerCase());
    });

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setSearchTerm("");
    };

    const handleSelectTeacher = (t) => {
        navigate(`/TeacherHistoryTable/${t.teacher_id}`, {
            state: {
                teacher_id: t.teacher_id,
                planid: selectedPlan.planid,
                infoid: selectedPlan.infoid,
                term: selectedPlan.term,
                year: selectedPlan.year,
                group_name: selectedPlan.group_name,
            },
        });
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="ml-64 flex-1 p-6 overflow-y-auto">
                <div className="container mx-auto max-w-6xl">

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Users className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-800">ตารางสอนครู</h1>
                    </div>

                    {/* ── Step 1: เลือกแผนการเรียน ── */}
                    {!selectedPlan ? (
                        <div className="bg-white rounded-lg shadow-md p-6 min-h-[500px]">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-3">
                                ขั้นตอนที่ 1: เลือกกลุ่มการเรียน
                            </h2>

                            {loadingPlans ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
                                    <p>กำลังโหลดข้อมูลแผนการเรียน...</p>
                                </div>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-500 text-lg">ไม่พบข้อมูลแผนการเรียน</p>
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
                                                            className="bg-white shadow-md rounded-xl p-4 mb-3 hover:bg-blue-50 transition cursor-pointer border border-gray-200"
                                                            onClick={() => handleSelectPlan(plan)}
                                                        >
                                                            <p className="text-blue-600 font-medium">
                                                                {plan.summer ? "ภาคฤดูร้อน" : `ภาคเรียนปกติ ${plan.term} เทอม`}
                                                            </p>
                                                            <p className="text-gray-700">
                                                                ปีการศึกษา: {plan.year}
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
                    ) : (
                        /* ── Step 2: เลือกครู ── */
                        <div className="bg-white rounded-lg shadow-md p-6 min-h-[500px]">
                            {/* ปุ่มย้อนกลับไปเลือกแผน + ข้อมูลแผนที่เลือก */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b pb-4">
                                <div>
                                    <button
                                        onClick={() => setSelectedPlan(null)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-500 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer mb-2"
                                    >
                                        <ArrowLeft size={18} />
                                        <span className="font-medium">เปลี่ยนกลุ่มการเรียน</span>
                                    </button>
                                    <p className="text-sm text-gray-500">
                                        {selectedPlan.sublevel} | กลุ่ม ก.{selectedPlan.group_name} | {selectedPlan.summer ? "ภาคฤดูร้อน" : `เทอม ${selectedPlan.term}`} | ปี {selectedPlan.year}
                                    </p>
                                </div>
                                <div className="relative w-full md:w-1/3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อ หรือ แผนก..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                ขั้นตอนที่ 2: เลือกครูผู้สอน
                            </h2>

                            {loadingTeachers ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                    <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
                                    <p>กำลังโหลดข้อมูลครู...</p>
                                </div>
                            ) : filteredTeachers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredTeachers.map((t) => (
                                        <div
                                            key={t.teacher_id}
                                            onClick={() => handleSelectTeacher(t)}
                                            className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Calendar className="w-5 h-5 text-blue-500" />
                                            </div>

                                            <div className="flex items-start gap-4 mb-3">
                                                <div className="flex-shrink-0 bg-blue-50 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg leading-snug group-hover:text-blue-700 transition-colors">
                                                        {t.fname} {t.lname}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">{formatPrefix(t.prefix)}</p>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-gray-100">
                                                <div className="text-xs text-gray-400 uppercase font-semibold mb-1">แผนกวิชา</div>
                                                <div className="text-sm text-gray-700 font-medium truncate">
                                                    {t.department || "-"}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-lg">ไม่พบข้อมูลครูที่ค้นหา</p>
                                    <p className="text-gray-400 text-sm mt-1">ลองค้นหาด้วยชื่ออื่น หรือตรวจสอบคำสะกด</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default IntoTeacherSchedule;
