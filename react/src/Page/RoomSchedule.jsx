import React, { useState, useEffect, useCallback, useRef, } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const BASE_URL = "http://localhost/cpss/server/api/GET";

const api = {
    getSchedule: (params) => axios.get(`${BASE_URL}/get_schedule_by_room.php`, { params }).then((res) => res.data),
};

const DAYS = [
    { key: "monday",    label: "จันทร์"    },
    { key: "tuesday",   label: "อังคาร"    },
    { key: "wednesday", label: "พุธ"       },
    { key: "thursday",  label: "พฤหัสบดี" },
    { key: "friday",    label: "ศุกร์"    },
];

const PERIODS = [
    { period: null, label: "07.30\n08.00", sub: "",   isSpecial: true, specialLabel: "กิจกรรมหน้าเสาธงหัวหน้าแผนก" },
    { period: 1,   label: "08.00\n09.00", sub: "1"  },
    { period: 2,   label: "09.00\n10.00", sub: "2"  },
    { period: 3,   label: "10.00\n11.00", sub: "3"  },
    { period: 4,   label: "11.00\n12.00", sub: "4"  },
    { period: null, label: "12.00\n13.00", sub: "",   isSpecial: true, specialLabel: "พักรับประทานอาหารกลางวัน" },
    { period: 5,   label: "13.00\n14.00", sub: "5"  },
    { period: 6,   label: "14.00\n15.00", sub: "6"  },
    { period: 7,   label: "15.00\n16.00", sub: "7"  },
    { period: 8,   label: "16.00\n17.00", sub: "8"  },
    { period: 9,   label: "17.00\n18.00", sub: "9"  },
    { period: 10,  label: "18.00\n19.00", sub: "10" },
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
        <p className="text-gray-900 leading-tight truncate" style={{ fontSize: 14 }}>
            <span className="font-extrabold">{item.course_code}</span>{" "}
            <span className="text-gray-700">{item.course_name}</span>
        </p>

        {/* บรรทัด 2: กลุ่ม */}
        <p className="text-gray-600 leading-snug truncate text-center" style={{ fontSize: 14 }}>
            {groupLabel(item)}
        </p>

        {/* ลูกศร */}
        <ArrowLine />

        {/* บรรทัด 3: ห้อง + อาจารย์ */}
        <p className="text-gray-800 leading-snug truncate text-center font-semibold" style={{ fontSize: 14 }}>
            {[teacherLabel(item)].filter(Boolean).join(" ")}
        </p>
    </div>
);

// ── ครึ่งหนึ่งของ Split cell (compact, 1-2 บรรทัด) ──────────────────────
// Layout: รหัสวิชา ชื่อวิชา  /  ก.กลุ่ม ห้อง อาจารย์
const SplitHalf = ({ item }) => (
    <div className="px-1.5 py-0.5" style={{ overflow: "hidden" }}>
        {/* รหัสวิชา + ชื่อวิชา */}
        <p className="text-gray-900 leading-tight truncate" style={{ fontSize: 14 }}>
            <span className="font-extrabold">{item.course_code}</span>{" "}
            <span className="text-gray-700">{item.course_name}</span>
        </p>
        {/* กลุ่ม + ห้อง + อาจารย์ */}
        <p className="text-gray-600 leading-snug truncate" style={{ fontSize: 14 }}>
            {[groupLabel(item), teacherLabel(item)].filter(Boolean).join(" ")}
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

const RoomSchedule = () => {
    const { room_id } = useParams();
    const location = useLocation(); // Add this to be sure
    const navigate = useNavigate();
    const printRef = useRef(null);
    
    // Default values or from navigation state
    const [data, setData]             = useState([]);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState(null);

    const [filterRoom, setFilterRoom] = useState(location.state?.room_id || room_id || "");
    const [filterTerm, setFilterTerm] = useState(location.state?.term || "1");
    const [filterYear, setFilterYear] = useState(location.state?.year || "2568");
    const [filterPlanId, setFilterPlanId] = useState(location.state?.planid || "");
    const [filterInfoId, setFilterInfoId] = useState(location.state?.infoid || "");
    const [filterGroupName, setFilterGroupName] = useState(location.state?.group_name || "");

    useEffect(() => {
        if (location.state) {
            setFilterRoom(location.state.room_id);
            setFilterTerm(location.state.term);
            setFilterYear(location.state.year);
            if (location.state.planid) setFilterPlanId(location.state.planid);
            if (location.state.infoid) setFilterInfoId(location.state.infoid);
            if (location.state.group_name) setFilterGroupName(location.state.group_name);
        } else if (room_id) {
             setFilterRoom(room_id);
        }
    }, [location.state, room_id]);

    const handleBack = () => {
        navigate(-1);
    };

    // ✅ ฟังก์ชันพิมพ์เฉพาะส่วนของตารางสอน (อ้างอิงจาก printplan)
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

    const targetRoomId = Number(filterRoom);
    const roomInfo     = data.length > 0 ? data[0] : null;

    const fetchData = useCallback(async () => {
        const roomIdNum = Number(filterRoom);

        if (!roomIdNum) {
            setError("กรุณาระบุ room_id");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const rows = await api.getSchedule({
                room_id: roomIdNum,
                term:   filterTerm,
                year:   filterYear,
                ...(filterPlanId ? { planid: Number(filterPlanId) } : {}),
                ...(filterInfoId ? { infoid: Number(filterInfoId) } : {}),
                ...(filterGroupName ? { group_name: filterGroupName } : {}),
            });

            const normalized = (Array.isArray(rows) ? rows : []).map((r) => ({
                ...r,
                date:                (r.date || "").toLowerCase(),
                start_time:          Number(r.start_time),
                end_time:            Number(r.end_time),
                courseid:            Number(r.courseid),
                planid:              Number(r.planid),
                infoid:              Number(r.infoid),
                teacher_id:          Number(r.teacher_id),
                room_id:             Number(r.room_id),
                split_status:        Number(r.split_status),
                table_split_status:  r.table_split_status ?? "false",
            }));

            const filtered = normalized.filter(
                (r) => r.room_id == roomIdNum
            );

            setData(filtered);
        } catch (e) {
            setError(e.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [filterRoom, filterTerm, filterYear, filterPlanId, filterInfoId, filterGroupName]);

    useEffect(() => { fetchData(); }, []); // eslint-disable-line

    // ── render แต่ละแถววัน ────────────────────────────────────────────────
    const renderRow = (dayKey, dayLabel) => {
        const covered = new Set();

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

                    // ── ล็อกคาบครูที่ปรึกษา: วันพุธ คาบ 5 ──
                    if (dayKey === "wednesday" && p.period === 5) {
                        return (
                            <td
                                key={idx}
                                className="border border-gray-400 bg-white align-middle text-center"
                                style={{ minWidth: 90, height: ROW_H }}
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
                                s.room_id === targetRoomId &&
                                s.date    === dayKey &&
                                s.start_time <= p.period &&
                                s.end_time   >  p.period
                        )
                        .sort((a, b) => a.split_status - b.split_status); // 1=top, 2=bottom

                    if (items.length > 0) {
                        const mainItem = items[0];
                        const span = mainItem.end_time - mainItem.start_time + 1;

                        // ตรวจสอบว่าเป็น split cell หรือไม่
                        const isSplit = items.some(i => i.table_split_status === "true");

                        if (isSplit) {
                            const topItem = items.find(i => i.split_status === 1);
                            const bottomItem = items.find(i => i.split_status === 2);

                            if (topItem && bottomItem) {
                                // ทั้งคู่อยู่ในช่องเดียวกัน → แสดง 2 ชั้นพร้อม arrow คั่น
                                for (let pp = mainItem.start_time + 1; pp <= mainItem.end_time; pp++)
                                    covered.add(pp);
                                return (
                                    <td
                                        key={idx}
                                        colSpan={span}
                                        className="border border-gray-400 align-top bg-white p-0"
                                        style={{ minWidth: 90, height: ROW_H, overflow: "hidden" }}
                                    >
                                        <SplitCell topItem={topItem} bottomItem={bottomItem} />
                                    </td>
                                );
                            }

                            // มีแค่ตัวเดียว (split_status=1) → แสดงตัวเดียว ไม่ merge
                            if (topItem) {
                                return (
                                    <td
                                        key={idx}
                                        className="border border-gray-400 align-top bg-white p-0"
                                        style={{ minWidth: 90, height: ROW_H, overflow: "hidden" }}
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
                                colSpan={span}
                                className="border border-gray-400 align-top bg-white p-0"
                                style={{ minWidth: 90, height: ROW_H, overflow: "hidden" }}
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
                            style={{ minWidth: 90, height: ROW_H }}
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

                {/* ── ปุ่มย้อนกลับ + พิมพ์ ── */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-500 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">ย้อนกลับ</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                        <Printer size={20} />
                        <span className="font-medium">พิมพ์ตาราง</span>
                    </button>
                </div>

                {/* badge สรุป */}
                {!loading && data.length > 0 && (
                    <p className="text-lg text-gray-600 px-1 font-semibold">
                        ตารางการใช้ห้อง: <strong className="text-gray-800">{roomInfo?.room_name || targetRoomId}</strong>
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
                            ตารางการใช้ห้อง.....{roomInfo?.room_name || ""}.......
                            แผนกวิชา......ช่างเทคนิคคอมพิวเตอร์.......
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
                                                className={`border border-gray-400 p-1 text-center font-normal whitespace-pre-line ${p.isSpecial ? "bg-gray-100" : ""}`}
                                                style={{
                                                    width: p.isSpecial ? 50 : 90,
                                                    minWidth: p.isSpecial ? 50 : 90,
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
                                        {PERIODS.map((p, i) => (
                                            <th
                                                key={i}
                                                className={`border border-gray-400 p-1 text-center font-semibold ${p.isSpecial ? "bg-gray-100" : ""}`}
                                                style={{ fontSize: 18 }}
                                            >
                                                {p.sub}
                                            </th>
                                        ))}
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

export default RoomSchedule;
