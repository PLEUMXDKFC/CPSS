import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/sidebar";

const BASE_URL = "http://localhost/cpss/server/api/GET";

const api = {
    getSchedule: async ({ planid, infoid, term, year }) => {
        if (!planid) throw new Error("กรุณาระบุ planid");
        if (!infoid) throw new Error("กรุณาระบุ infoid");

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
    { key: "monday",    label: "จันทร์"    },
    { key: "tuesday",   label: "อังคาร"    },
    { key: "wednesday", label: "พุธ"       },
    { key: "thursday",  label: "พฤหัสบดี" },
    { key: "friday",    label: "ศุกร์"    },
];

const PERIODS = [
    { period: null, label: "07.30\n08.00", sub: "",   isSpecial: true, specialLabel: "กิจกรรม\nหน้าเสาธง\n/\nหัวหน้าแผนก" },
    { period: 1,   label: "08.00\n09.00", sub: "1"  },
    { period: 2,   label: "09.00\n10.00", sub: "2"  },
    { period: 3,   label: "10.00\n11.00", sub: "3"  },
    { period: 4,   label: "11.00\n12.00", sub: "4"  },
    { period: null, label: "12.00\n13.00", sub: "",   isSpecial: true, specialLabel: "พักรับ\nประทาน\nอาหาร\nกลางวัน" },
    { period: 5,   label: "13.00\n14.00", sub: "5"  },
    { period: 6,   label: "14.00\n15.00", sub: "6"  },
    { period: 7,   label: "15.00\n16.00", sub: "7"  },
    { period: 8,   label: "16.00\n17.00", sub: "8"  },
    { period: 9,   label: "17.00\n18.00", sub: "9"  },
    { period: 10,  label: "18.00\n19.00", sub: "10" },
];

const ROW_H = 140; // ความสูงแต่ละแถว px

// ── component แสดงข้อมูล 1 วิชาในช่อง ─────────────────────────────────────
const CourseCell = ({ item, half }) => {
    // half: undefined = ทั้งช่อง, "top" = ครึ่งบน, "bottom" = ครึ่งล่าง
    const h = half ? ROW_H / 2 : ROW_H;
    const borderBottom = half === "top" ? "1px solid #9ca3af" : undefined;

    return (
        <div
            className="flex flex-col px-1.5 pt-1 pb-0.5"
            style={{ height: h, overflow: "hidden", borderBottom }}
        >
            {/* รหัสวิชา */}
            <p
                className="font-extrabold text-gray-900 leading-tight truncate"
                style={{ fontSize: 14 }}
            >
                {item.course_code}
            </p>

            {/* ชื่อวิชา */}
            <p
                className="text-gray-700 leading-snug"
                style={{
                    fontSize: 13,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: half ? 1 : 2,
                    WebkitBoxOrient: "vertical",
                }}
            >
                {item.course_name}
            </p>

            {/* กลุ่มนักเรียน (group_name) */}
            {item.group_name && (
                <p
                    className="text-gray-600 leading-snug truncate"
                    style={{ fontSize: 13 }}
                >
                    {item.group_name}
                </p>
            )}

            {/* เส้นลูกศร */}
            <div className="flex-1 flex items-center px-1" style={{ minHeight: 14 }}>
                <div className="flex-1 border-t border-gray-400 relative">
                    <span
                        className="absolute text-gray-400"
                        style={{ left: -7, top: -9, fontSize: 13 }}
                    >◄</span>
                    <span
                        className="absolute text-gray-400"
                        style={{ right: -7, top: -9, fontSize: 13 }}
                    >►</span>
                </div>
            </div>

            {/* prefix + ชื่ออาจารย์ */}
            <p
                className="text-gray-800 leading-snug truncate font-semibold"
                style={{ fontSize: 13 }}
            >
                {item.prefix ? `${item.prefix}${item.fname}` : `${item.fname ?? ""} ${item.lname ?? ""}`}
            </p>
        </div>
    );
};

const Plans = () => {
    const [data, setData]             = useState([]);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState(null);
    const [filterPlan, setFilterPlan] = useState("56");
    const [filterInfo, setFilterInfo] = useState("162");
    const [filterTerm, setFilterTerm] = useState("2");
    const [filterYear, setFilterYear] = useState("2568");

    const targetPlanId = Number(filterPlan);
    const targetInfoId = Number(filterInfo);
    const classInfo    = data.length > 0 ? data[0] : null;

    const fetchData = useCallback(async () => {
        const planIdNum = Number(filterPlan);
        const infoIdNum = Number(filterInfo);

        if (!planIdNum || !infoIdNum) {
            setError("กรุณาระบุ planid และ infoid ให้ครบถ้วน");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const rows = await api.getSchedule({
                planid: planIdNum,
                infoid: infoIdNum,
                term:   filterTerm,
                year:   filterYear,
            });

            const normalized = (Array.isArray(rows) ? rows : []).map((r) => ({
                ...r,
                start_time:          Number(r.start_time),
                end_time:            Number(r.end_time),
                courseid:            Number(r.courseid),
                planid:              Number(r.planid),
                infoid:              Number(r.infoid),
                split_status:        Number(r.split_status),
                table_split_status:  r.table_split_status ?? "false",
            }));

            const filtered = normalized.filter(
                (r) => r.planid === planIdNum && r.infoid === infoIdNum
            );

            setData(filtered);
        } catch (e) {
            setError(e.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [filterPlan, filterInfo, filterTerm, filterYear]);

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
                        return (
                            <td
                                key={idx}
                                rowSpan={5}
                                className="border border-gray-400 bg-gray-50 align-middle text-center"
                                style={{
                                    width: 50,
                                    minWidth: 50,
                                    display: dayKey === "monday" ? "table-cell" : "none",
                                }}
                            >
                                <span
                                    className="text-gray-500 font-medium"
                                    style={{
                                        writingMode: "vertical-rl",
                                        textOrientation: "mixed",
                                        whiteSpace: "pre-line",
                                        fontSize: 13,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {p.specialLabel}
                                </span>
                            </td>
                        );
                    }

                    /* ── ช่องพิเศษ: พักกลางวัน ── */
                    if (p.isSpecial && idx === 5) {
                        return (
                            <td
                                key={idx}
                                rowSpan={5}
                                className="border border-gray-400 bg-gray-50 align-middle text-center"
                                style={{
                                    width: 50,
                                    minWidth: 50,
                                    display: dayKey === "monday" ? "table-cell" : "none",
                                }}
                            >
                                <span
                                    className="text-gray-500 font-medium"
                                    style={{
                                        writingMode: "vertical-rl",
                                        textOrientation: "mixed",
                                        whiteSpace: "pre-line",
                                        fontSize: 13,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {p.specialLabel}
                                </span>
                            </td>
                        );
                    }

                    if (covered.has(p.period)) return null;

                    // หา items ทั้งหมดที่ตรงกับช่องนี้ (รองรับ split)
                    const items = data.filter(
                        (s) =>
                            s.planid     === targetPlanId &&
                            s.infoid     === targetInfoId &&
                            s.date       === dayKey &&
                            s.start_time === p.period
                    );

                    if (items.length > 0) {
                        // ใช้ item แรกเป็น reference สำหรับ colSpan
                        const mainItem = items[0];
                        const span = mainItem.end_time - mainItem.start_time + 1;
                        for (let pp = mainItem.start_time + 1; pp <= mainItem.end_time; pp++)
                            covered.add(pp);

                        // ตรวจสอบว่าเป็น split cell หรือไม่
                        const isSplit = items.length >= 2 ||
                            items.some(i => i.table_split_status === "true");

                        if (isSplit && items.length >= 2) {
                            // แสดง 2 วิชาซ้อนกัน (ครึ่งบน / ครึ่งล่าง)
                            return (
                                <td
                                    key={idx}
                                    colSpan={span}
                                    className="border border-gray-400 align-top bg-white p-0"
                                    style={{ minWidth: 90, height: ROW_H, overflow: "hidden" }}
                                >
                                    <CourseCell item={items[0]} half="top" />
                                    <CourseCell item={items[1]} half="bottom" />
                                </td>
                            );
                        }

                        // แสดง 1 วิชาปกติ
                        return (
                            <td
                                key={idx}
                                colSpan={span}
                                className="border border-gray-400 align-top bg-white p-0"
                                style={{ minWidth: 90, height: ROW_H, overflow: "hidden" }}
                            >
                                <CourseCell item={mainItem} />
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

                {/* ── Filter bar ── */}
                <div className="bg-white rounded shadow-sm p-4 flex flex-wrap gap-4 items-end border border-gray-200">
                    {[
                        { label: "planid",      val: filterPlan, set: setFilterPlan, w: "w-24" },
                        { label: "infoid",      val: filterInfo, set: setFilterInfo, w: "w-24" },
                        { label: "ภาคเรียน",   val: filterTerm, set: setFilterTerm, w: "w-24" },
                        { label: "ปีการศึกษา", val: filterYear, set: setFilterYear, w: "w-28" },
                    ].map(({ label, val, set, w }) => (
                        <div key={label}>
                            <label className="block text-xs text-gray-500 mb-1 font-semibold">{label}</label>
                            <input
                                type="number"
                                value={val}
                                onChange={(e) => set(e.target.value)}
                                className={`border border-gray-300 rounded px-2 py-1.5 text-sm ${w} focus:outline-none focus:ring-2 focus:ring-gray-400`}
                            />
                        </div>
                    ))}
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="px-5 py-2 rounded text-sm font-semibold bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 transition"
                    >
                        {loading ? "กำลังโหลด..." : "ค้นหา"}
                    </button>
                </div>

                {/* badge สรุป */}
                {!loading && data.length > 0 && (
                    <p className="text-xs text-gray-400 px-1">
                        แสดงข้อมูลสำหรับ planid = <strong className="text-gray-600">{targetPlanId}</strong>
                        {" "}/ infoid = <strong className="text-gray-600">{targetInfoId}</strong>
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
                                style={{ width: "100%", minWidth: 1050, tableLayout: "fixed" }}
                            >
                                <thead>
                                    {/* แถวเวลา */}
                                    <tr className="bg-gray-50">
                                        <th
                                            className="border border-gray-400 p-2 text-center font-bold"
                                            style={{ width: 68, fontSize: 15 }}
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
                                                    fontSize: 13,
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
                                            style={{ fontSize: 14 }}
                                        >
                                            วัน / คาบ
                                        </th>
                                        {PERIODS.map((p, i) => (
                                            <th
                                                key={i}
                                                className={`border border-gray-400 p-1 text-center font-semibold ${p.isSpecial ? "bg-gray-100" : ""}`}
                                                style={{ fontSize: 15 }}
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

export default Plans;
