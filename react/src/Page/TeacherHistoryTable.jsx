import React, { useState, useEffect, useCallback, useRef, } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import Sidebar from "../components/Sidebar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = {
    getSchedule: async ({ teacher_id, term, year, planid, infoid, group_name }) => {
        if (!teacher_id) throw new Error("กรุณาระบุ teacher_id");

        const params = new URLSearchParams({
            teacher_id: String(teacher_id),
            ...(term ? { term: String(term) } : {}),
            ...(year ? { year: String(year) } : {}),
            ...(planid ? { planid: String(planid) } : {}),
            ...(infoid ? { infoid: String(infoid) } : {}),
            ...(group_name ? { group_name: String(group_name) } : {}),
        });

        const res = await fetch(`${API_BASE_URL}/server/api/GET/get_schedule_by_teacher.php?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    },
};

const DAYS = [
    { key: "monday", label: "จันทร์" },
    { key: "tuesday", label: "อังคาร" },
    { key: "wednesday", label: "พุธ" },
    { key: "thursday", label: "พฤหัสบดี" },
    { key: "friday", label: "ศุกร์" },
];

const PERIODS = [
    { period: null, label: "07.30\n08.00", sub: "", isSpecial: true, specialLabel: "กิจกรรมหน้าเสาธงหัวหน้าแผนก" },
    { period: 1, label: "08.00\n09.00", sub: "1" },
    { period: 2, label: "09.00\n10.00", sub: "2" },
    { period: 3, label: "10.00\n11.00", sub: "3" },
    { period: 4, label: "11.00\n12.00", sub: "4" },
    { period: null, label: "12.00\n13.00", sub: "", isSpecial: true, specialLabel: "พักรับประทานอาหารกลางวัน" },
    { period: 5, label: "13.00\n14.00", sub: "5" },
    { period: 6, label: "14.00\n15.00", sub: "6" },
    { period: 7, label: "15.00\n16.00", sub: "7" },
    { period: 8, label: "16.00\n17.00", sub: "8" },
    { period: 9, label: "17.00\n18.00", sub: "9" },
    { period: 10, label: "18.00\n19.00", sub: "10" },
];

const ROW_H = 100; // ความสูงแต่ละแถว px

// ── เส้นลูกศร ◄────────► ─────────────────────────────────────────────────
const ArrowLine = () => (
    <div className="flex items-center px-1" style={{ minHeight: 5, margin: "1px 0" }}>
        <div className="flex-1 border-t border-gray-400 relative">
            <span className="absolute text-gray-400" style={{ left: -7, top: -9, fontSize: 13 }}>◄</span>
            <span className="absolute text-gray-400" style={{ right: -7, top: -9, fontSize: 13 }}>►</span>
        </div>
    </div>
);

// ── helper: สร้าง label กลุ่ม (เพิ่ม ก. นำหน้า) ──────────────────────────
const groupLabel = (item) => {
    if (!item.group_name) return "";
    return `ก.${item.group_name}`;
};

// ── Cell แบบ Combined (table_split_status = false) ───────────────────────
const CombinedCell = ({ item }) => (
    <div className="flex flex-col justify-between px-1.5 pt-1 pb-0.5" style={{ height: ROW_H, overflow: "hidden" }}>
        {/* บรรทัด 1: รหัสวิชา + ชื่อวิชา (ย่อ) */}
        <p className="text-gray-900 leading-tight truncate text-center" style={{ fontSize: 14 }}>
            <span className="font-extrabold">{item.course_code}</span>
        </p>

        {/* บรรทัด 2: กลุ่ม */}
        <p className="text-gray-600 leading-snug truncate text-center" style={{ fontSize: 14 }}>
            {groupLabel(item)}
        </p>

        {/* ลูกศร */}
        <ArrowLine />

        {/* บรรทัด 3: ห้อง */}
        <p className="text-gray-800 leading-snug truncate text-center font-semibold" style={{ fontSize: 14 }}>
            {item.room_name || "-"}
        </p>
    </div>
);

// ── ครึ่งหนึ่งของ Split cell (compact, 1-2 บรรทัด) ──────────────────────
const SplitHalf = ({ item }) => (
    <div className="px-1.5 py-0.5" style={{ overflow: "hidden" }}>
        {/* รหัสวิชา */}
        <p className="text-gray-900 leading-tight truncate" style={{ fontSize: 14 }}>
            <span className="font-extrabold">{item.course_code}</span>
        </p>
        {/* กลุ่ม + ห้อง */}
        <p className="text-gray-600 leading-snug truncate" style={{ fontSize: 14 }}>
            {[groupLabel(item), item.room_name].filter(Boolean).join(" ")}
        </p>
    </div>
);

// ── Cell แบบ Split (table_split_status = true) ──────────────────────────
const SplitCell = ({ topItem, bottomItem }) => (
    <div className="flex flex-col justify-between" style={{ height: ROW_H, overflow: "hidden" }}>
        <SplitHalf item={topItem} />
        <ArrowLine />
        <SplitHalf item={bottomItem} />
    </div>
);

const TeacherHistoryTable = () => {
    const { teacher_id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const printRef = useRef(null);

    // Default values or from navigation state
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filterTeacher, setFilterTeacher] = useState(location.state?.teacher_id || teacher_id || "");
    // Helper to get terms
    const getTermsFromSubterm = (sub) => {
        if (!sub) return [];
        return sub.split("-").map(t => t.trim());
    };

    const getTermsFromSublevel = (level) => {
        if (!level) return [];
        if (level.includes("ปวช.1") || level.includes("ปวส.1")) return ["1", "2"];
        if (level.includes("ปวช.2") || level.includes("ปวส.2")) return ["3", "4"];
        if (level.includes("ปวช.3")) return ["5", "6"];
        return ["1", "2"];
    };

    // Determine initial terms
    let initialTerms = ["1", "2"];
    if (location.state?.terms) {
        initialTerms = location.state.terms;
    } else if (location.state?.subterm) {
        initialTerms = getTermsFromSubterm(location.state.subterm);
    } else if (location.state?.sublevel) {
        initialTerms = getTermsFromSublevel(location.state.sublevel);
    }

    const [availableTerms, setAvailableTerms] = useState(initialTerms);
    const [filterTerm, setFilterTerm] = useState(initialTerms[0] || "1");
    const [filterYear, setFilterYear] = useState(location.state?.year || "2568");
    const [filterPlanId, setFilterPlanId] = useState(location.state?.planid || "");
    const [filterInfoId, setFilterInfoId] = useState(location.state?.infoid || "");
    const [filterGroupName, setFilterGroupName] = useState(location.state?.group_name || "");

    useEffect(() => {
        if (location.state) {
            setFilterTeacher(location.state.teacher_id);

            // Determine terms from passed terms OR subterm OR sublevel fallback
            let terms = [];
            if (location.state.terms) {
                terms = location.state.terms;
            } else if (location.state.subterm) {
                terms = getTermsFromSubterm(location.state.subterm);
            } else if (location.state.sublevel) {
                terms = getTermsFromSublevel(location.state.sublevel);
            }

            if (terms.length > 0) {
                setAvailableTerms(terms);
                setFilterTerm(terms[0] || "1");
            }

            if (location.state.year) setFilterYear(location.state.year);
            if (location.state.planid) setFilterPlanId(location.state.planid);
            if (location.state.infoid) setFilterInfoId(location.state.infoid);
            if (location.state.group_name) setFilterGroupName(location.state.group_name);
        } else if (teacher_id) {
            setFilterTeacher(teacher_id);
        }
    }, [location.state, teacher_id]);

    const handleBack = () => {
        navigate(-1);
    };

    const handlePrint = () => {
        const originalContent = document.body.innerHTML;
        const printContent = printRef.current.innerHTML;
        document.body.innerHTML = `
            <style>
                @page {
                    size: A4 landscape !important;
                    margin: 5mm;
                }
                html, body {
                    margin: 0; padding: 0;
                    font-family: 'Sarabun','TH Sarabun New', sans-serif;
                    font-size: 11px;
                }
                table { border-collapse: collapse; width: 100%; }
                td, th { border: 1px solid #333; padding: 1px 3px; font-size: 11px; }
            </style>
            ${printContent}
        `;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const teacherInfo = data.length > 0 ? data[0] : null;
    const stateTeacher = location.state?.teacher;
    const currentTeacherName = teacherInfo?.teacher_name || (stateTeacher ? `${stateTeacher.prefix} ${stateTeacher.fname} ${stateTeacher.lname}`.trim() : "");
    const currentDepartment = teacherInfo?.department || stateTeacher?.department || "";

    const fetchData = useCallback(async () => {
        const teacherIdNum = Number(filterTeacher);

        if (!teacherIdNum) {
            setError("กรุณาระบุ teacher_id");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log("Fetching schedule:", {
                teacher_id: teacherIdNum,
                term: filterTerm,
                year: filterYear,
                planid: filterPlanId,
                infoid: filterInfoId,
                group_name: filterGroupName,
            });

            const rows = await api.getSchedule({
                teacher_id: teacherIdNum,
                term: filterTerm,
                year: filterYear,
                planid: filterPlanId,
                infoid: filterInfoId,
                group_name: filterGroupName,
            });

            console.log("Fetched Rows:", rows);

            const normalized = (Array.isArray(rows) ? rows : []).map((r) => ({
                ...r,
                date: (r.date || "").toLowerCase(),
                start_time: Number(r.start_time),
                end_time: Number(r.end_time),
                courseid: Number(r.courseid),
                planid: Number(r.planid),
                infoid: Number(r.infoid),
                split_status: Number(r.split_status),
                table_split_status: r.table_split_status ?? "false",
            }));

            // Filter locally (though API should handle it)
            // Note: Filter strictness depends on requirements. 
            // Here we trust the API result primarily.
            setData(normalized);
        } catch (e) {
            setError(e.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [filterTeacher, filterTerm, filterYear, filterPlanId, filterInfoId, filterGroupName]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── render แต่ละแถววัน ────────────────────────────────────────────────
    const renderRow = (dayKey, dayLabel) => {
        const covered = new Set();
        const deferredSplit = new Map();

        return (
            <tr key={dayKey} style={{ height: ROW_H }}>
                <td
                    className="border border-gray-400 text-center font-bold align-middle bg-white"
                    style={{ width: 68, minWidth: 68, fontSize: 16 }}
                >
                    {dayLabel}
                </td>

                {PERIODS.map((p, idx) => {
                    if (p.isSpecial && idx === 0) {
                        if (dayKey !== "monday") return null;
                        return (
                            <td key={idx} rowSpan={5} className="border border-gray-400 bg-gray-50" style={{ width: 50, textAlign: "center", verticalAlign: "middle" }}>
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                    <span className="text-gray-500 font-medium" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 18 }}>{p.specialLabel}</span>
                                </div>
                            </td>
                        );
                    }

                    if (p.isSpecial && idx === 5) {
                        if (dayKey !== "monday") return null;
                        return (
                            <td key={idx} rowSpan={5} className="border border-gray-400 bg-gray-50" style={{ width: 50, textAlign: "center", verticalAlign: "middle" }}>
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                    <span className="text-gray-500 font-medium" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 18 }}>{p.specialLabel}</span>
                                </div>
                            </td>
                        );
                    }

                    if (covered.has(p.period)) return null;

                    if (deferredSplit.has(p.period)) {
                        const { topItem: dTop, bottomItem: dBot, span: dSpan } = deferredSplit.get(p.period);
                        return (
                            <td key={idx} colSpan={dSpan} className="border border-gray-400 align-top bg-white p-0" style={{ minWidth: 70, height: ROW_H, overflow: "hidden" }}>
                                <SplitCell topItem={dTop} bottomItem={dBot} />
                            </td>
                        );
                    }

                    // ล็อกคาบครูที่ปรึกษา: วันพุธ คาบ 5
                    if (dayKey === "wednesday" && p.period === 5) {
                        return (
                            <td key={idx} className="border border-gray-400 bg-white align-middle text-center" style={{ minWidth: 70, height: ROW_H }}>
                                <span className="text-gray-700 font-bold" style={{ fontSize: 16 }}>พบครูที่ปรึกษา</span>
                            </td>
                        );
                    }

                    const items = data
                        .filter(s => s.date === dayKey && s.start_time === p.period)
                        .sort((a, b) => a.split_status - b.split_status);

                    if (items.length > 0) {
                        const mainItem = items[0];
                        const totalSpan = mainItem.end_time - mainItem.start_time + 1;
                        const isSplit = items.some(i => i.table_split_status === "true");

                        if (isSplit) {
                            const topItem = items.find(i => i.split_status === 1);
                            const bottomItem = items.find(i => i.split_status === 2);

                            if (topItem && bottomItem) {
                                const combinedGroup = `${topItem.group_name}-${bottomItem.group_name}`;
                                const firstCellItem = { ...topItem, group_name: combinedGroup };

                                if (totalSpan > 1) {
                                    const remainingSpan = totalSpan - 1;
                                    deferredSplit.set(mainItem.start_time + 1, { topItem, bottomItem, span: remainingSpan });
                                    for (let pp = mainItem.start_time + 2; pp <= mainItem.end_time; pp++) covered.add(pp);
                                }

                                return (
                                    <td key={idx} colSpan={1} className="border border-gray-400 align-middle text-center bg-white p-0" style={{ minWidth: 70, height: ROW_H, overflow: "hidden" }}>
                                        <CombinedCell item={firstCellItem} />
                                    </td>
                                );
                            }

                            if (topItem) {
                                return (
                                    <td key={idx} className="border border-gray-400 align-top bg-white p-0" style={{ minWidth: 70, height: ROW_H, overflow: "hidden" }}>
                                        <CombinedCell item={topItem} />
                                    </td>
                                );
                            }
                        }

                        for (let pp = mainItem.start_time + 1; pp <= mainItem.end_time; pp++) covered.add(pp);
                        return (
                            <td key={idx} colSpan={totalSpan} className="border border-gray-400 align-top bg-white p-0" style={{ minWidth: 70, height: ROW_H, overflow: "hidden" }}>
                                <CombinedCell item={mainItem} />
                            </td>
                        );
                    }

                    return <td key={idx} className="border border-gray-400 bg-white" style={{ minWidth: 70, height: ROW_H }} />;
                })}
            </tr>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="ml-64 flex-1 p-6 space-y-4">

                <div className="flex items-center justify-between">
                    <button onClick={handleBack} className="mb-6 flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                        <ArrowLeft size={20} />
                        <span className="font-medium">ย้อนกลับ</span>
                    </button>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="font-semibold text-gray-700">เลือกเทอม:</span>
                        {availableTerms.map((term) => (
                            <button
                                key={term}
                                onClick={() => {
                                    setFilterTerm(term);
                                    console.log("User selected Term:", term);
                                }}
                                className={`px-4 py-2 rounded-lg border transition-all ${filterTerm === term ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}
                            >
                                เทอม {term}
                            </button>
                        ))}
                        <span className="ml-2 text-sm font-semibold text-blue-600">
                            (กำลังแสดงผล: {filterTerm === "summer" ? "ฤดูร้อน" : `เทอม ${filterTerm}`})
                        </span>
                    </div>

                    <button onClick={handlePrint} className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                        <Printer size={20} />
                        <span className="font-medium">พิมพ์ตาราง</span>
                    </button>
                </div>

                {!loading && teacherInfo && (
                    <p className="text-lg text-gray-600 px-1 font-semibold">
                        แสดงข้อมูลสำหรับ Teacher ID: <strong className="text-gray-800">{teacherInfo.teacher_id}</strong>
                        {filterGroupName && <> / Group: <strong className="text-gray-800">{filterGroupName}</strong></>}
                    </p>
                )}

                {error && <div className="bg-red-50 border border-red-300 rounded p-3 text-sm text-red-700">⚠️ {error}</div>}

                <div ref={printRef} className="bg-white border border-gray-400 shadow-sm" style={{ fontFamily: "'Sarabun', 'TH Sarabun New', sans-serif" }}>
                    <div className="relative px-6 pt-4 pb-3 text-center border-b border-gray-300">
                        <div className="absolute top-4 right-4 border border-gray-400 px-3 py-1 text-sm font-medium">
                            เอกสารหมายเลข 7 (ครู)
                        </div>
                        <p className="text-xl font-bold">วิทยาลัยเทคนิคแพร่</p>
                        <p className="text-base mt-1">
                            ตารางสอนครู&nbsp;
                            ชื่อ......{currentTeacherName}............
                            แผนกวิชา......{currentDepartment}.......
                        </p>
                        <p className="text-base mt-0.5">
                            ภาคเรียนที่..........{filterTerm}...............&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            ปีการศึกษา..........{filterYear}...............
                        </p>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-gray-400 text-base">กำลังโหลด...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="border-collapse" style={{ width: "100%", minWidth: 1050 }}>
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-400 p-2 text-center font-bold" style={{ width: 68, fontSize: 18 }}>เวลา</th>
                                        {PERIODS.map((p, i) => (
                                            <th key={i} colSpan={1} rowSpan={p.isSpecial ? 2 : 1} className={`border border-gray-400 p-1 text-center font-normal whitespace-pre-line ${p.isSpecial ? "bg-gray-100" : ""}`} style={{ width: p.isSpecial ? 50 : 70, minWidth: p.isSpecial ? 50 : 70, fontSize: 18, lineHeight: 1.5 }}>{p.label}</th>
                                        ))}
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-400 p-2 text-center font-bold" style={{ fontSize: 18 }}>วัน / คาบ</th>
                                        {PERIODS.map((p, i) => {
                                            if (p.isSpecial) return null;
                                            return <th key={i} className={`border border-gray-400 p-1 text-center font-semibold ${p.isSpecial ? "bg-gray-100" : ""}`} style={{ fontSize: 18 }}>{p.sub}</th>;
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAYS.map((d) => renderRow(d.key, d.label))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default TeacherHistoryTable;
