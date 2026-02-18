import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { School, Search, Monitor, MapPin, ArrowLeft } from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function IntoRoomSchedule() {
    const navigate = useNavigate();
    const location = useLocation();

    // ── Step 0: เลือกปีการศึกษา ──
    const [allPlans, setAllPlans] = useState([]);         // ข้อมูลดิบทั้งหมด
    const [uniqueYears, setUniqueYears] = useState([]);   // ปีที่ไม่ซ้ำ
    const [selectedYear, setSelectedYear] = useState(null);
    const [loadingPlans, setLoadingPlans] = useState(true);

    // ── Step 1: เลือกกลุ่มการเรียน ──
    const [plans, setPlans] = useState([]);               // grouped ตาม year ที่เลือก
    const [selectedPlan, setSelectedPlan] = useState(null);

    // ── Step 2: เลือกห้อง ──
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // ── Fetch ข้อมูลทั้งหมด ──
    useEffect(() => {
        axios.get(`${API_BASE_URL}/server/api/GET/Get_group_information.php`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setAllPlans(data);

                // ดึงปีที่ไม่ซ้ำ เรียงจากมากไปน้อย
                const years = [...new Set(data.map((p) => p.year))].sort((a, b) => b - a);
                setUniqueYears(years);
            })
            .catch((err) => console.error("Error fetching plans:", err))
            .finally(() => setLoadingPlans(false));
    }, []);

    // ── เมื่อเลือกปี → สร้าง grouped plans ──
    const handleSelectYear = (year) => {
        setSelectedYear(year);
        setSelectedPlan(null);
        setSearchTerm("");

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

    // ── Fetch รายชื่อห้อง (เมื่อเลือกแผนแล้ว) ──
    useEffect(() => {
        if (!selectedPlan) return;
        setLoadingRooms(true);
        axios.get(`${API_BASE_URL}/server/api/GET/get_rooms.php`)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setRooms(res.data);
                } else {
                    setRooms([]);
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoadingRooms(false));
    }, [selectedPlan]);

    const filteredRooms = rooms.filter((r) => {
        const full = `${r.room_name} ${r.room_type}`.toLowerCase();
        return full.includes(searchTerm.toLowerCase());
    });

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setSearchTerm("");
    };

    const handleSelectRoom = (r) => {
        navigate(`/RoomHistoryTable/${r.room_id}`, {
            state: {
                room_id: r.room_id,
                planid: selectedPlan.planid,
                infoid: selectedPlan.infoid,
                term: selectedPlan.term,
                year: selectedPlan.year,
                group_name: selectedPlan.group_name,
            },
        });
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="ml-65 container mx-auto p-6">

                {/* Header */}
                <h2 className="text-center text-3xl font-bold mb-6">ตารางการใช้ห้อง</h2>

                {/* ── Step 0: เลือกปีการศึกษา ── */}
                {!selectedYear ? (
                    <>
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                            ขั้นตอนที่ 1: เลือกปีการศึกษา
                        </h3>

                        {loadingPlans ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mb-4" />
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
                                        <p className="text-gray-700">
                                            พุทธศักราช: {year}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : !selectedPlan ? (
                    /* ── Step 1: เลือกกลุ่มการเรียน ── */
                    <>
                        {/* ปุ่มย้อนกลับไปเลือกปี */}
                        <div className="mb-4">
                            <button
                                onClick={() => setSelectedYear(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-500 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer mb-2"
                            >
                                <ArrowLeft size={18} />
                                <span className="font-medium">เปลี่ยนปีการศึกษา</span>
                            </button>
                            <p className="text-sm text-gray-500">ปีการศึกษา: {selectedYear}</p>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                            ขั้นตอนที่ 2: เลือกกลุ่มการเรียน
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
                ) : (
                    /* ── Step 2: เลือกห้อง ── */
                    <>
                        {/* ปุ่มย้อนกลับ + ข้อมูลแผนที่เลือก */}
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
                                    placeholder="ค้นหาห้อง..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                            ขั้นตอนที่ 3: เลือกห้องเรียน
                        </h3>

                        {loadingRooms ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mb-4" />
                                <p>กำลังโหลดข้อมูลห้อง...</p>
                            </div>
                        ) : filteredRooms.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredRooms.map((r) => (
                                    <div
                                        key={r.room_id}
                                        onClick={() => handleSelectRoom(r)}
                                        className="bg-white shadow-lg p-6 rounded-xl cursor-pointer hover:bg-blue-200 transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-green-50 p-2 rounded-full">
                                                {r.room_type?.includes("ปฏิบัติ") ? (
                                                    <Monitor className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <School className="w-5 h-5 text-green-600" />
                                                )}
                                            </div>
                                            <h3 className="text-xl font-semibold text-blue-600">
                                                {r.room_name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center text-gray-500 gap-1 text-sm">
                                            <MapPin className="w-4 h-4" />
                                            <span>{r.room_type || "-"}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <School className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-lg">ไม่พบข้อมูลห้อง</p>
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
}

export default IntoRoomSchedule;
