import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import Sidebar from "../components/Sidebar";

const BASE_URL = "http://localhost/cpss/server/api/GET";

const api = {
    getSchedule: async ({ planid, infoid, term, year }) => {
        if (!planid) throw new Error("กรุณาระบุ planid");
        // if (!infoid) throw new Error("กรุณาระบุ infoid");

        const params = new URLSearchParams({
            planid: String(planid),
            infoid: String(infoid),
            ...(term ? { term: String(term) } : {}),
            ...(year ? { year: String(year) } : {}),
        });

        const res = await fetch(`${BASE_URL}/get_schedule.php?${params}`);
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

// ── helper: สร้างชื่ออาจารย์ ────────────────────────────────────────────
const teacherLabel = (item) => {
    if (item.fname) return `อ.${item.fname}`;
    return "";
};

// ── helper: สร้าง label กลุ่ม (เพิ่ม ก. นำหน้า) ──────────────────────────
const groupLabel = (item) => {
    if (!item.group_name) return "";
    return `ก.${item.group_name}`;
};

// ── Cell แบบ Combined (table_split_status = false) ───────────────────────
// Layout:  รหัสวิชา ชื่อวิชา  /  ก.กลุ่ม  /  ◄────►  /  ห้อง ก.กลุ่ม อาจารย์
const CombinedCell = ({ item }) => (
    <div className="flex flex-col justify-between px-1.5 pt-1 pb-0.5" style={{ height: ROW_H, overflow: "hidden" }}>
        {/* บรรทัด 1: รหัสวิชา + ชื่อวิชา */}
        <p className="text-gray-900 leading-tight truncate text-center" style={{ fontSize: 14 }}>
            <span className="font-extrabold">{item.course_code}</span>
        </p>

        {/* บรรทัด 2: กลุ่ม */}
        <p className="text-gray-600 leading-snug truncate text-center" style={{ fontSize: 14 }}>
            {groupLabel(item)}
        </p>

        {/* ลูกศร */}
        <ArrowLine />

        {/* บรรทัด 3: ห้อง + อาจารย์ */}
        <p className="text-gray-800 leading-snug truncate text-center font-semibold" style={{ fontSize: 14 }}>
            {[item.room_name, teacherLabel(item)].filter(Boolean).join(" ")}
        </p>
    </div>
);

// ── ครึ่งหนึ่งของ Split cell (compact, 1-2 บรรทัด) ──────────────────────
// Layout: รหัสวิชา ชื่อวิชา  /  ก.กลุ่ม ห้อง อาจารย์
const SplitHalf = ({ item }) => (
    <div className="px-1.5 py-0.5" style={{ overflow: "hidden" }}>
        {/* รหัสวิชา + ชื่อวิชา */}
        <p className="text-gray-900 leading-tight truncate" style={{ fontSize: 14 }}>
            <span className="font-extrabold">{item.course_code}</span>
        </p>
        {/* กลุ่ม + ห้อง + อาจารย์ */}
        <p className="text-gray-600 leading-snug truncate" style={{ fontSize: 14 }}>
            {[groupLabel(item), item.room_name, teacherLabel(item)].filter(Boolean).join(" ")}
        </p>
    </div>
);

// ── Cell แบบ Split (table_split_status = true) ──────────────────────────
// Layout:  [Subject 1]  ◄────►  [Subject 2]
const SplitCell = ({ topItem, bottomItem }) => (
    <div className="flex flex-col justify-between" style={{ height: ROW_H, overflow: "hidden" }}>
        <SplitHalf item={topItem} />
        <ArrowLine />
        <SplitHalf item={bottomItem} />
    </div>
);

const Plans = () => {
    const { planid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const printRef = useRef(null);

    // Helper to get terms - Copied from TeacherHistoryTable for consistency
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

    // Determine initial terms based on location.state (passed from IntoStudyHistoryTable)
    let initialTerms = ["1", "2"];
    let initialFilterTerm = "1";

    if (location.state) {
        if (location.state.terms && location.state.terms.length > 0) {
            initialTerms = location.state.terms;
        } else if (location.state.subterm) {
            initialTerms = getTermsFromSubterm(location.state.subterm);
        } else if (location.state.sublevel) {
            initialTerms = getTermsFromSublevel(location.state.sublevel);
        }

        // Use the passed term as initial filter if valid, else first available
        if (location.state.term && initialTerms.includes(String(location.state.term))) {
            initialFilterTerm = String(location.state.term);
        } else {
            initialFilterTerm = initialTerms[0] || "1";
        }
    }

    const [availableTerms, setAvailableTerms] = useState(initialTerms);
    const [filterTerm, setFilterTerm] = useState(initialFilterTerm);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filterPlan, setFilterPlan] = useState(location.state?.planid || planid || "");
    const [filterInfo, setFilterInfo] = useState(location.state?.infoid || "");
    const [filterYear, setFilterYear] = useState(location.state?.year || "");

    // Initialize from location state if available (Only for non-primitive updates if any, but we handled them above)
    // We can remove the useEffect that handled location.state logic for term/pair
    useEffect(() => {
        if (location.state) {
            setFilterPlan(location.state.planid);
            setFilterInfo(location.state.infoid);
            setFilterYear(location.state.year);
            // Term logic is now handled in useState initialization
        }
    }, [location.state]);

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
                .print-area {
                    width: 100%;
                    transform-origin: top left;
                }
                table { border-collapse: collapse; width: 100%; }
                td, th { border: 1px solid #333; padding: 1px 3px; font-size: 11px; }
                p { margin: 2px 0; }
            </style>
            ${printContent}
        `;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const targetPlanId = Number(filterPlan);
    const targetInfoId = Number(filterInfo);
    const classInfo = data.length > 0 ? data[0] : null;

    const fetchData = useCallback(async () => {
        const planIdNum = Number(filterPlan);
        const infoIdNum = Number(filterInfo);

        console.log("DEBUG fetchData:", { filterPlan, filterInfo, planIdNum, infoIdNum, filterTerm, filterYear });

        if (!planIdNum) {
            setError("กรุณาระบุ planid ให้ครบถ้วน");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const rows = await api.getSchedule({
                planid: planIdNum,
                infoid: infoIdNum,
                term: filterTerm, // Using strict filterTerm logic
                year: filterYear,
            });

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

            // Filter strict logic
            const filtered = normalized.filter(
                (r) => r.planid === planIdNum
                    && (filterInfo ? r.infoid === Number(filterInfo) : true)
                    && (filterTerm ? r.term == filterTerm : true)
            );

            setData(filtered);
        } catch (e) {
            setError(e.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [filterPlan, filterInfo, filterTerm, filterYear]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── render แต่ละแถววัน ────────────────────────────────────────────────
    const renderRow = (dayKey, dayLabel) => {
        const covered = new Set();
        const deferredSplit = new Map(); // เก็บ split items สำหรับคาบถัดไป

        return (
            <tr key={dayKey} style={{ height: ROW_H }}>
                {/* ชื่อวัน */}
                <td
                    className="border border-gray-400 text-center font-bold align-middle bg-white"
                    style={{ width: 68, minWidth: 68, fontSize: 16 }}
                >
                    {dayLabel}
                </td>

                {PERIODS.map((p, idx) => {
                    /* ── ช่องพิเศษ: กิจกรรมหน้าเสาธง ── */
                    if (p.isSpecial && idx === 0) {
                        if (dayKey !== "monday") return null;
                        return (
                            <td
                                key={idx}
                                rowSpan={5}
                                className="border border-gray-400 bg-gray-50"
                                style={{ width: 50, minWidth: 50, verticalAlign: "middle", textAlign: "center" }}
                            >
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                    <span
                                        className="text-gray-500 font-medium"
                                        style={{
                                            writingMode: "vertical-rl",
                                            textOrientation: "mixed",
                                            transform: "rotate(180deg)",
                                            whiteSpace: "pre-line",
                                            fontSize: 18,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {p.specialLabel}
                                    </span>
                                </div>
                            </td>
                        );
                    }

                    /* ── ช่องพิเศษ: พักกลางวัน ── */
                    if (p.isSpecial && idx === 5) {
                        if (dayKey !== "monday") return null;
                        return (
                            <td
                                key={idx}
                                rowSpan={5}
                                className="border border-gray-400 bg-gray-50"
                                style={{ width: 50, minWidth: 50, verticalAlign: "middle", textAlign: "center" }}
                            >
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                    <span
                                        className="text-gray-500 font-medium"
                                        style={{
                                            writingMode: "vertical-rl",
                                            textOrientation: "mixed",
                                            transform: "rotate(180deg)",
                                            whiteSpace: "pre-line",
                                            fontSize: 18,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {p.specialLabel}
                                    </span>
                                </div>
                            </td>
                        );
                    }

                    if (covered.has(p.period)) return null;

                    // ── ตรวจสอบ deferred split (คาบที่ 2+ ของ split) ──
                    if (deferredSplit.has(p.period)) {
                        const { topItem: dTop, bottomItem: dBot, span: dSpan } = deferredSplit.get(p.period);
                        return (
                            <td
                                key={idx}
                                colSpan={dSpan}
                                className="border border-gray-400 align-top bg-white p-0"
                                style={{ minWidth: 70, height: ROW_H, overflow: "hidden" }}
                            >
                                <SplitCell topItem={dTop} bottomItem={dBot} />
                            </td>
                        );
                    }

                    // ── ล็อกคาบครูที่ปรึกษา: วันพุธ คาบ 5 ──
                    if (dayKey === "wednesday" && p.period === 5) {
                        return (
                            <td
                                key={idx}
                                className="border border-gray-400 bg-white align-middle text-center"
                                style={{ minWidth: 70, height: ROW_H }}
                            >
                                <span className="text-gray-700 font-bold" style={{ fontSize: 16 }}>
                                    พบครูที่ปรึกษา
                                </span>
                            </td>
                        );
                    }

                    // หา items ทั้งหมดที่ตรงกับช่องนี้ (รองรับ split)
                    const items = data
                        .filter(
                            (s) =>
                                s.planid === targetPlanId &&
                                s.infoid === targetInfoId &&
                                s.date === dayKey &&
                                s.start_time === p.period
                        )
                        .sort((a, b) => a.split_status - b.split_status); // 1=top, 2=bottom

                    if (items.length > 0) {
                        const mainItem = items[0];
                        const totalSpan = mainItem.end_time - mainItem.start_time + 1;

                        // ตรวจสอบว่าเป็น split cell หรือไม่
                        const isSplit = items.some(i => i.table_split_status === "true");

                        if (isSplit) {
                            const topItem = items.find(i => i.split_status === 1);
                            const bottomItem = items.find(i => i.split_status === 2);

                            if (topItem && bottomItem) {
                                // สร้างกลุ่มรวม เช่น "1-2"
                                const combinedGroup = `${topItem.group_name}-${bottomItem.group_name}`;
                                // สร้าง item สำหรับคาบแรก (แสดงแบบ CombinedCell)
                                const firstCellItem = { ...topItem, group_name: combinedGroup };

                                if (totalSpan > 1) {
                                    // คาบแรก: แสดงเดี่ยว (colSpan=1)
                                    // คาบที่เหลือ: แสดง SplitCell
                                    const remainingSpan = totalSpan - 1;
                                    deferredSplit.set(mainItem.start_time + 1, {
                                        topItem,
                                        bottomItem,
                                        span: remainingSpan,
                                    });
                                    // cover คาบที่ 3+ (คาบที่ 2 จะถูก deferred)
                                    for (let pp = mainItem.start_time + 2; pp <= mainItem.end_time; pp++)
                                        covered.add(pp);
                                }
                                // else: totalSpan === 1 → คาบเดียว แสดงแบบ CombinedCell

                                return (
                                    <td
                                        key={idx}
                                        colSpan={1}
                                        className="border border-gray-400 align-middle text-center bg-white p-0"
                                        style={{ minWidth: 70, height: ROW_H, overflow: "hidden" }}
                                    >
                                        <CombinedCell item={firstCellItem} />
                                    </td>
                                );
                            }

                            // มีแค่ตัวเดียว (split_status=1) → แสดงตัวเดียว ไม่ merge
                            if (topItem) {
                                return (
                                    <td
                                        key={idx}
                                        className="border border-gray-400 align-top bg-white p-0"
                                        style={{ minWidth: 70, height: ROW_H, overflow: "hidden" }}
                                    >
                                        <CombinedCell item={topItem} />
                                    </td>
                                );
                            }
                        }

                        // Combined mode: merge cells ตาม colSpan
                        for (let pp = mainItem.start_time + 1; pp <= mainItem.end_time; pp++)
                            covered.add(pp);
                        return (
                            <td
                                key={idx}
                                colSpan={totalSpan}
                                className="border border-gray-400 align-top bg-white p-0"
                                style={{ minWidth: 70, height: ROW_H, overflow: "hidden" }}
                            >
                                <CombinedCell item={mainItem} />
                            </td>
                        );
                    }

                    /* ── ช่องว่าง ── */
                    return (
                        <td
                            key={idx}
                            className="border border-gray-400 bg-white"
                            style={{ minWidth: 70, height: ROW_H }}
                        />
                    );
                })}
            </tr>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="ml-64 flex-1 p-6 space-y-4">

                <div className="flex items-center justify-between">
                    {/* Left side actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">ย้อนกลับ</span>
                        </button>

                        {/* Dynamic Term Toggles (from TeacherHistoryTable style) */}
                        <div className="flex items-center gap-2 mb-0">
                            <span className="font-semibold text-gray-700 ml-2">เลือกเทอม:</span>
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
                        </div>
                    </div>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                        <Printer size={20} />
                        <span className="font-medium">พิมพ์ตาราง</span>
                    </button>
                </div>

                {/* badge สรุป */}
                {!loading && data.length > 0 && (
                    <p className="text-lg text-gray-600 px-1 font-semibold">
                        แสดงข้อมูลสำหรับ planid = <strong className="text-gray-800">{targetPlanId}</strong>
                        {" "}/ infoid = <strong className="text-gray-800">{targetInfoId}</strong>
                        {" "}({data.length} คาบ)
                    </p>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-300 rounded p-3 text-sm text-red-700">
                        ⚠️ {error}
                    </div>
                )}

                {/* ── เอกสารตารางสอน ── */}
                <div
                    ref={printRef}
                    className="bg-white border border-gray-400 shadow-sm"
                    style={{ fontFamily: "'Sarabun', 'TH Sarabun New', sans-serif" }}
                >
                    {/* หัวเอกสาร */}
                    <div className="relative px-6 pt-4 pb-3 text-center border-b border-gray-300">
                        <div className="absolute top-4 right-4 border border-gray-400 px-3 py-1 text-sm font-medium">
                            เอกสารหมายเลข 6
                        </div>
                        <p className="text-xl font-bold">วิทยาลัยเทคนิคแพร่</p>
                        <p className="text-base mt-1">
                            ตารางสอนชั้นเรียน&nbsp;
                            ระดับชั้น......{classInfo?.sublevel ?? ""}............
                            แผนกวิชา......ช่างเทคนิคคอมพิวเตอร์.......
                            กลุ่ม......{classInfo?.class_group ?? ""}......
                            จำนวนนักเรียน.............คน
                        </p>
                        <p className="text-base mt-0.5">
                            ภาคเรียนที่..........{filterTerm}...............&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            ปีการศึกษา..........{filterYear}...............
                        </p>
                    </div>

                    {/* ตาราง */}
                    {loading ? (
                        <div className="py-20 text-center text-gray-400 text-base">
                            <span className="inline-flex items-center gap-2">
                                <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block" />
                                กำลังโหลด...
                            </span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table
                                className="border-collapse"
                                style={{ width: "100%", minWidth: 1050 }}
                            >
                                <thead>
                                    {/* แถวเวลา */}
                                    <tr className="bg-gray-50">
                                        <th
                                            className="border border-gray-400 p-2 text-center font-bold"
                                            style={{ width: 68, fontSize: 18 }}
                                        >
                                            เวลา
                                        </th>
                                        {PERIODS.map((p, i) => (
                                            <th
                                                key={i}
                                                colSpan={1}
                                                rowSpan={p.isSpecial ? 2 : 1}
                                                className={`border border-gray-400 p-1 text-center font-normal whitespace-pre-line ${p.isSpecial ? "bg-gray-100" : ""}`}
                                                style={{
                                                    width: p.isSpecial ? 50 : 70,
                                                    minWidth: p.isSpecial ? 50 : 70,
                                                    fontSize: 18,
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {p.label}
                                            </th>
                                        ))}
                                    </tr>

                                    {/* แถววัน / คาบ */}
                                    <tr className="bg-gray-50">
                                        <th
                                            className="border border-gray-400 p-2 text-center font-bold"
                                            style={{ fontSize: 18 }}
                                        >
                                            วัน / คาบ
                                        </th>
                                        {PERIODS.map((p, i) => {
                                            if (p.isSpecial) return null;
                                            return (
                                                <th
                                                    key={i}
                                                    className={`border border-gray-400 p-1 text-center font-semibold ${p.isSpecial ? "bg-gray-100" : ""}`}
                                                    style={{ fontSize: 18 }}
                                                >
                                                    {p.sub}
                                                </th>
                                            );
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

export default Plans;
