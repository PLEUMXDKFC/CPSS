import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, Search, User, ArrowLeft } from "lucide-react";
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

    // ── Step 1: เลือกครูผู้สอน ──
    const [teachers, setTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [searchTeacher, setSearchTeacher] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    // ── Step 2: เลือกปีการศึกษา ──
    const [allPlans, setAllPlans] = useState([]);
    const [uniqueYears, setUniqueYears] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    // ── Step 3: เลือกกลุ่มการเรียน ──
    const [plans, setPlans] = useState([]);

    // ── Fetch ครูทั้งหมด ──
    useEffect(() => {
        axios.get(`${API_BASE_URL}/server/api/GET/get_teachers.php`)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setTeachers(res.data);
                } else {
                    setTeachers([]);
                }
            })
            .catch((err) => console.error("Error fetching teachers:", err))
            .finally(() => setLoadingTeachers(false));
    }, []);

    const filteredTeachers = teachers.filter((t) => {
        const full = `${t.prefix || ""} ${t.fname || ""} ${t.lname || ""} ${t.department || ""}`.toLowerCase();
        return full.includes(searchTeacher.toLowerCase());
    });

    // ── เมื่อเลือกครู → fetch ปีการศึกษา ──
    const handleSelectTeacher = (t) => {
        setSelectedTeacher(t);
        setSelectedYear(null);
        setPlans([]);
        setLoadingPlans(true);

        axios.get(`${API_BASE_URL}/server/api/GET/Get_group_information.php`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setAllPlans(data);
                const years = [...new Set(data.map((p) => p.year))].sort((a, b) => b - a);
                setUniqueYears(years);
            })
            .catch((err) => console.error("Error fetching plans:", err))
            .finally(() => setLoadingPlans(false));
    };

    // ── เมื่อเลือกปี → สร้าง grouped plans ──
    const handleSelectYear = (year) => {
        setSelectedYear(year);
        setPlans([]);

        const filtered = allPlans.filter((p) => p.year === year);

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
                            if (aIsSummer !== bIsSummer) return aIsSummer ? 1 : -1;
                            return 0;
                        }),
                    })),
            }));

        setPlans(finalGrouped);
    };

    // ── เมื่อเลือกกลุ่ม → navigate ──
    const handleSelectPlan = (plan) => {
        navigate(`/TeacherHistoryTable/${selectedTeacher.teacher_id}`, {
            state: {
                teacher_id: selectedTeacher.teacher_id,
                planid: plan.planid,
                infoid: plan.infoid,
                term: plan.term,
                year: plan.year,
                group_name: plan.group_name,
            },
        });
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="ml-65 container mx-auto p-6">

                {/* Header */}
                <h2 className="text-center text-3xl font-bold mb-6">ตารางสอนครู</h2>

                {/* ── Step 1: เลือกครูผู้สอน ── */}
                {!selectedTeacher ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                            <h3 className="text-xl font-semibold text-gray-700">
                                ขั้นตอนที่ 1: เลือกครูผู้สอน
                            </h3>
                            <div className="relative w-full md:w-1/3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อ หรือ แผนก..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full shadow-sm"
                                    value={searchTeacher}
                                    onChange={(e) => setSearchTeacher(e.target.value)}
                                />
                            </div>
                        </div>

                        {loadingTeachers ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
                                <p>กำลังโหลดข้อมูลครู...</p>
                            </div>
                        ) : filteredTeachers.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-lg">ไม่พบข้อมูลครูที่ค้นหา</p>
                                <p className="text-gray-400 text-sm mt-1">ลองค้นหาด้วยชื่ออื่น หรือตรวจสอบคำสะกด</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredTeachers.map((t) => (
                                    <div
                                        key={t.teacher_id}
                                        onClick={() => handleSelectTeacher(t)}
                                        className="bg-white shadow-lg p-6 rounded-xl cursor-pointer hover:bg-blue-200 transition-all"
                                    >
                                        <div className="flex items-start gap-4 mb-3">
                                            <div className="flex-shrink-0 bg-blue-50 p-3 rounded-full">
                                                <User className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-blue-600 leading-snug">
                                                    {t.fname} {t.lname}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-0.5">{formatPrefix(t.prefix)}</p>
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
                        )}
                    </>
                ) : !selectedYear ? (
                    /* ── Step 2: เลือกปีการศึกษา ── */
                    <>
                        <div className="mb-4">
                            <button
                                onClick={() => setSelectedTeacher(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-500 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer mb-2"
                            >
                                <ArrowLeft size={18} />
                                <span className="font-medium">เปลี่ยนครูผู้สอน</span>
                            </button>
                            <p className="text-sm text-gray-500">
                                ครู: {selectedTeacher.fname} {selectedTeacher.lname}
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                            ขั้นตอนที่ 2: เลือกปีการศึกษา
                        </h3>

                        {loadingPlans ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
                                <p>กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : uniqueYears.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 text-lg">ไม่พบข้อมูลปีการศึกษา</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {uniqueYears.map((year) => (
                                    <div
                                        key={year}
                                        className="bg-white shadow-lg p-6 rounded-xl cursor-pointer hover:bg-blue-200 transition-all"
                                        onClick={() => handleSelectYear(year)}
                                    >
                                        <h3 className="text-xl font-semibold text-blue-600 mb-2">
                                            ปีการศึกษา {year}
                                        </h3>
                                        <p className="text-gray-700">พุทธศักราช: {year}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    /* ── Step 3: เลือกกลุ่มการเรียน ── */
                    <>
                        <div className="mb-4">
                            <button
                                onClick={() => setSelectedYear(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-500 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer mb-2"
                            >
                                <ArrowLeft size={18} />
                                <span className="font-medium">เปลี่ยนปีการศึกษา</span>
                            </button>
                            <p className="text-sm text-gray-500">
                                ครู: {selectedTeacher.fname} {selectedTeacher.lname} | ปีการศึกษา: {selectedYear}
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                            ขั้นตอนที่ 3: เลือกกลุ่มการเรียน
                        </h3>

                        {plans.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 text-lg">ไม่พบข้อมูลแผนการเรียน</p>
                            </div>
                        ) : (
                            plans.map(({ level, groups }) => (
                                <div key={level} className="mb-8">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-1">{level}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {groups.map(({ group, plans: groupPlans }) => (
                                            <div key={group}>
                                                <h4 className="text-xl font-semibold text-gray-700 mb-2">กลุ่ม ก.{group}</h4>
                                                {groupPlans.map((plan) => (
                                                    <div
                                                        key={plan.infoid}
                                                        className="bg-white shadow-lg p-6 rounded-xl cursor-pointer hover:bg-blue-200 transition-all mb-3"
                                                        onClick={() => handleSelectPlan(plan)}
                                                    >
                                                        <h3 className="text-xl font-semibold text-blue-600 mb-2">
                                                            {plan.summer ? "ภาคฤดูร้อน" : `ภาคเรียนปกติ ${plan.term} เทอม`}
                                                        </h3>
                                                        <p className="text-gray-700">ปีการศึกษา: {plan.year}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}

            </div>
        </div>
    );
}

export default IntoTeacherSchedule;
