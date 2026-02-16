import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/sidebar";
import { ArrowLeft, X } from "lucide-react";

function Create_Study_Table() {
  const { infoid } = useParams();
    const [plans, setPlans] = useState({});
    const [subjects, setSubjects] = useState({});
    
    const [selectedTerm, setSelectedTerm] = useState("1");
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    
    const [courseCode, setCourseCode] = useState("");
    const [courseName, setCourseName] = useState("");
    const [courseId, setCourseId] = useState(null);
    const [planId, setPlanId] = useState(null);
    const [theory, setTheory] = useState(0);
    const [comply, setComply] = useState(0);
    const [instructorName, setInstructorName] = useState("");
    const [teacherId, setTeacherId] = useState(null);
    const [roomName, setRoomName] = useState("");
    const [roomId, setRoomId] = useState(null);
    
    const [day, setDay] = useState("จันทร์");
    const [startPeriod, setStartPeriod] = useState("");
    const [endPeriod, setEndPeriod] = useState("");

    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showTeacherModal, setShowTeacherModal] = useState(false);
    const [showRoomModal, setShowRoomModal] = useState(false);

    // Split/Combine Mode State
    const [isSplitMode, setIsSplitMode] = useState(false);
    const [isPairedGroup, setIsPairedGroup] = useState(false);
    const [currentGroupName, setCurrentGroupName] = useState("");
    const [group1Name, setGroup1Name] = useState("");
    const [group2Name, setGroup2Name] = useState("");

    // Saved Schedules
    const [savedSchedules, setSavedSchedules] = useState([]);
    const [editingId, setEditingId] = useState(null); // Track which row is being edited
    const [editTempData, setEditTempData] = useState({}); // Temp data for inline edit
    
    // Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({
        field_id: null,
        teacher_id: null,
        teacher_name: "",
        room_id: null,
        room_name: "",
        date: "จันทร์",
        start_time: "",
        end_time: ""
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    useEffect(() => {
        if (!infoid) return;
    
        axios.get(`${API_BASE_URL}/server/api/GET/getgroupforplan.php?infoid=${infoid}`)
            .then(response => {
                if (!Array.isArray(response.data)) {
                    console.error("❌ ข้อมูลที่ได้รับไม่ใช่ Array:", response.data);
                    return;
                }
    
                const groupedPlans = response.data.reduce((acc, plan) => {
                    const sublevelDisplay = plan.sublevel ? plan.sublevel : `ภาคเรียนฤดูร้อน ปีการศึกษา ${plan.year}`;
                    const key = `${sublevelDisplay}-${plan.group_name}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(plan);
                    return acc;
                }, {});
    
                setPlans(groupedPlans);
            })
            .catch(error => console.error("❌ Error fetching study plans:", error));
    
        axios.get(`${API_BASE_URL}/server/api/GET/Getcourse.php?infoid=${infoid}`)
            .then(response => {
                if (!Array.isArray(response.data)) {
                    console.error("❌ ข้อมูลรายวิชาที่ได้รับไม่ใช่ Array:", response.data);
                    return;
                }
                console.log("ข้อมูลรายวิชาที่ได้รับ:", response.data);
    
                const groupedSubjects = response.data.reduce((acc, subject) => {
                    const term = subject.term || "summer";
                    if (!acc[subject.infoid]) acc[subject.infoid] = {};
                    if (!acc[subject.infoid][term]) acc[subject.infoid][term] = [];
                    acc[subject.infoid][term].push(subject);
                    return acc;
                }, {});
    
                console.log("ข้อมูลรายวิชาที่จัดกลุ่มแล้ว:", groupedSubjects);
                setSubjects(groupedSubjects);
            })
            .catch(error => console.error("❌ Error fetching subjects:", error));
            
        axios.get(`${API_BASE_URL}/server/api/GET/get_teachers.php`)
            .then(res => setTeachers(res.data))
            .catch(err => console.error("Error fetching teachers:", err));

        axios.get(`${API_BASE_URL}/server/api/GET/get_rooms.php`)
            .then(res => setRooms(res.data))
            .catch(err => console.error("Error fetching rooms:", err));

        // Fetch saved schedules
        fetchSavedSchedules();
            
    }, [infoid]);

    const fetchSavedSchedules = () => {
        if (!infoid) return;
        axios.get(`${API_BASE_URL}/server/api/GET/GetSchedules.php?infoid=${infoid}`)
            .then(res => setSavedSchedules(res.data))
            .catch(err => console.error("Error fetching schedules:", err));
    };

    // Detect if current is paired group
    useEffect(() => {
        // Get first plan to detect group structure
        const firstPlanKey = Object.keys(plans)[0];
        if (firstPlanKey) {
            const firstPlan = plans[firstPlanKey][0];
            if (firstPlan && firstPlan.group_name) {
                const groupName = firstPlan.group_name;
                setCurrentGroupName(groupName);
                
                // Check if paired (e.g., "1-2", "3-4", "5-6")
                if (groupName.includes("-")) {
                    setIsPairedGroup(true);
                    const parts = groupName.split("-");
                    setGroup1Name(parts[0]);
                    setGroup2Name(parts[1]);
                } else {
                    setIsPairedGroup(false);
                }
            }
        }
    }, [plans]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleArrangeClick = () => {
        setIsSelectionMode(true);
    };

    const handleSubjectSelect = (subject, plan) => {
        if (!isSelectionMode) return;
        setCourseCode(subject.course_code);
        setCourseName(subject.course_name);
        setCourseId(subject.courseid); // Store courseid
        setPlanId(subject.planid);     // Store planid from subject (update Getcourse.php to include it)
        setTheory(parseInt(subject.theory) || 0);
        setComply(parseInt(subject.comply) || 0);
        setInstructorName(""); 
        setRoomName("");
    };

    const handleCancel = () => {
        setIsSelectionMode(false);
        setCourseCode("");
        setCourseName("");
        setCourseId(null);
        setPlanId(null);
        setTheory(0);
        setComply(0);
        setInstructorName("");
        setTeacherId(null);
        setRoomName("");
        setDay("จันทร์");
        setStartPeriod("");
        setEndPeriod("");
    };

    const handleTeacherSelect = (teacher) => {
        setInstructorName(`${teacher.prefix}${teacher.fname} ${teacher.lname}`);
        setTeacherId(teacher.teacher_id); // Store teacher_id
        setShowTeacherModal(false);
    };

    const handleRoomSelect = (room) => {
        setRoomName(room.room_name);
        setRoomId(room.room_id); // Store room_id
        setShowRoomModal(false);
    };

    // ✅ เพิ่ม: ฟังก์ชันเปิด Modal
    const handleOpenTeacherModal = () => {
        if (!isSelectionMode || !courseCode) return; // ไม่แสดง Alert แค่ไม่ทำงาน
        setShowTeacherModal(true);
    };

    const handleOpenRoomModal = () => {
        if (!isSelectionMode || !courseCode) return; // ไม่แสดง Alert แค่ไม่ทำงาน
        setShowRoomModal(true);
    };

    const isEndPeriodInvalid = () => {
        if (!startPeriod || !endPeriod) return false;
        const start = parseInt(startPeriod);
        const end = parseInt(endPeriod);
        const maxDuration = theory + comply;
        return (end - start + 1) > maxDuration;
    };

    const handleSaveSchedule = () => {
        if (!courseId || !teacherId || !roomName || !day || !startPeriod || !endPeriod) {
            Swal.fire("กรุณากรอกข้อมูลให้ครบถ้วน", "", "warning");
            return;
        }

        if (isEndPeriodInvalid()) {
            Swal.fire("ช่วงเวลาไม่ถูกต้อง", "จำนวนคาบเกินกว่าที่กำหนดในรายวิชา", "error");
            return;
        }

        const payload = {
            teacher_id: teacherId,
            courseid: courseId,
            room_id: roomId || 0,
            planid: planId,
            date: day,
            start_time: parseInt(startPeriod),
            end_time: parseInt(endPeriod),
            group_name: currentGroupName,
            term: selectedTerm,
            table_split_status: false,
            split_status: 0
        };

        axios.post(`${API_BASE_URL}/server/api/POST/InsertSchedule.php`, payload)
            .then(res => {
                if (res.data.status === 'success') {
                    Swal.fire("บันทึกสำเร็จ", "", "success");
                    handleCancel();
                    fetchSavedSchedules();
                } else {
                    Swal.fire("เกิดข้อผิดพลาด", res.data.message, "error");
                }
            })
            .catch(err => {
                Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์", "error");
            });
    };

    const handleSaveSplitSchedule = () => {
        // Save logic for split mode - saves two separate records
        // Group 1 (split_status = 1)
        // Group 2 (split_status = 2)
        // Both with table_split_status = true
        // Implementation similar to handleSaveSchedule but called twice
    };

    const handleEdit = (schedule) => {
        setEditData({
            field_id: schedule.field_id,
            teacher_id: schedule.teacher_id,
            teacher_name: schedule.teacher_name,
            room_id: schedule.room_id,
            room_name: schedule.room_name,
            date: schedule.date,
            start_time: schedule.start_time,
            end_time: schedule.end_time
        });
        setShowEditModal(true);
    };

    const handleUpdateSchedule = () => {
        const payload = {
            field_id: editData.field_id,
            teacher_id: editData.teacher_id,
            room_id: editData.room_id,
            date: editData.date,
            start_time: parseInt(editData.start_time),
            end_time: parseInt(editData.end_time)
        };

        axios.post(`${API_BASE_URL}/server/api/POST/UpdateSchedule.php`, payload)
            .then(res => {
                if (res.data.status === 'success') {
                    Swal.fire("อัปเดตสำเร็จ", "", "success");
                    setShowEditModal(false);
                    fetchSavedSchedules();
                } else {
                    Swal.fire("เกิดข้อผิดพลาด", res.data.message, "error");
                }
            })
            .catch(err => {
                console.error(err);
                Swal.fire("เกิดข้อผิดพลาด", "", "error");
            });
    };

    const handleDelete = (field_id) => {
        Swal.fire({
            title: "ต้องการลบหรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#d33"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(`${API_BASE_URL}/server/api/POST/DeleteSchedule.php`, { field_id })
                    .then(res => {
                        if (res.data.status === 'success') {
                            Swal.fire("ลบสำเร็จ", "", "success");
                            fetchSavedSchedules();
                        } else {
                            Swal.fire("เกิดข้อผิดพลาด", res.data.message, "error");
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        Swal.fire("เกิดข้อผิดพลาด", "", "error");
                    });
            }
        });
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="ml-64 container mx-auto p-6">
                <button 
                    onClick={handleBack}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 
                    rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">ย้อนกลับ</span>
                </button>
                
                <h2 className="text-center text-3xl font-bold mb-6">รายวิชาจากแผนการเรียน</h2>

                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                        <div className="flex gap-2">
                             <button
                                onClick={() => setSelectedTerm("1")}
                                className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                                    selectedTerm === "1" 
                                    ? "bg-blue-600 text-white shadow-md" 
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                ภาคเรียนที่ 1
                            </button>
                            <button
                                onClick={() => setSelectedTerm("2")}
                                className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                                    selectedTerm === "2" 
                                    ? "bg-blue-600 text-white shadow-md" 
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                ภาคเรียนที่ 2
                            </button>
                        </div>

                        {/* Split/Combine Toggle for Paired Groups */}
                        {isPairedGroup && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsSplitMode(false)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                                        !isSplitMode
                                        ? "bg-purple-600 text-white shadow-md"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    จัดรวม
                                </button>
                                <button
                                    onClick={() => setIsSplitMode(true)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                                        isSplitMode
                                        ? "bg-purple-600 text-white shadow-md"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    จัดแยก
                                </button>
                            </div>
                        )}

                     <div className="flex gap-2">
                             {!isSelectionMode ? (
                                <button
                                    onClick={handleArrangeClick}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-all font-medium whitespace-nowrap"
                                >
                                    จัดตารางเรียน
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSaveSchedule}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all font-medium whitespace-nowrap"
                                    >
                                        บันทึก
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md transition-all font-medium whitespace-nowrap"
                                    >
                                        ยกเลิก
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Persistent Alert for Subject Selection */}
                    {isSelectionMode && !courseCode && (
                        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-sm animate-pulse">
                            <p className="font-bold">กรุณาเลือกรายวิชา</p>
                            <p>โปรดเลือกวิชาจากตารางด้านล่างเพื่อดำเนินการจัดตาราง</p>
                        </div>
                    )}

                    {/* Row 2: Subject Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสวิชา</label>
                            <input
                                type="text"
                                value={courseCode}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อวิชา</label>
                            <input
                                type="text"
                                value={courseName}
                                readOnly
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">อาจารย์ผู้สอน</label>
                            {/* ✅ แก้ไข: ใช้ div แทน input เพื่อให้คลิกได้ง่าย */}
                            <div
                                onClick={handleOpenTeacherModal}
                                className={`w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center min-h-[42px] ${
                                    isSelectionMode && courseCode
                                        ? "cursor-pointer hover:bg-gray-50 bg-white text-gray-800" 
                                        : "cursor-not-allowed bg-gray-100 text-gray-500"
                                }`}
                            >
                                {instructorName || "เลือกอาจารย์"}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">ห้องเรียน</label>
                            {/* ✅ แก้ไข: ใช้ div แทน input */}
                            <div
                                onClick={handleOpenRoomModal}
                                className={`w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center min-h-[42px] ${
                                    isSelectionMode && courseCode
                                        ? "cursor-pointer hover:bg-gray-50 bg-white text-gray-800" 
                                        : "cursor-not-allowed bg-gray-100 text-gray-500"
                                }`}
                            >
                                {roomName || "เลือกห้องเรียน"}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">วัน</label>
                            <select
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                disabled={!isSelectionMode || !courseCode}
                                className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${
                                    isSelectionMode && courseCode
                                        ? "bg-white text-gray-800"
                                        : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                <option value="จันทร์">จันทร์</option>
                                <option value="อังคาร">อังคาร</option>
                                <option value="พุธ">พุธ</option>
                                <option value="พฤหัสบดี">พฤหัสบดี</option>
                                <option value="ศุกร์">ศุกร์</option>
                                <option value="เสาร์">เสาร์</option>
                                <option value="อาทิตย์">อาทิตย์</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">คาบที่เริ่ม</label>
                            <input
                                type="number"
                                value={startPeriod}
                                onChange={(e) => setStartPeriod(e.target.value)}
                                disabled={!isSelectionMode || !courseCode}
                                placeholder="เช่น 1"
                                className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${
                                    isSelectionMode && courseCode
                                        ? "text-gray-800"
                                        : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                }`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">คาบที่จบ</label>
                            <input
                                type="number"
                                value={endPeriod}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || (/^[1-9]$/.test(val) && val.length === 1)) {
                                        setEndPeriod(val);
                                    }
                                }}
                                disabled={!isSelectionMode || !courseCode}
                                placeholder="เช่น 4"
                                className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${
                                    isSelectionMode && courseCode
                                        ? "text-gray-800"
                                        : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                } ${isEndPeriodInvalid() ? "text-red-600 font-bold border-red-500 ring-1 ring-red-500" : ""}`}
                            />
                            {isEndPeriodInvalid() && (
                                <p className="text-xs text-red-500 mt-1">
                                    เกินระยะเวลาที่กำหนด ({theory + comply} คาบ)
                                </p>
                            )}
                        </div>
                    </div>
                </div>
    
                {Object.keys(plans).length > 0 ? (
                    <div className="space-y-8">
                        {Object.keys(plans).map((groupKey) => {
                            const [sublevel, groupName] = groupKey.split("-");
                            return (
                                <div key={groupKey}>
                                    <h3 className="text-2xl font-bold text-blue-600 text-center mb-4">
                                        รายวิชาจากแผนการเรียน {sublevel} ก.{plans[groupKey][0]?.group_name || ""}
                                        {plans[groupKey][0]?.sublevel && (
                                            <>
                                                {" "}จำนวนภาคเรียนปกติ {plans[groupKey][0]?.term || 0}
                                            </>
                                        )}
                                    </h3>
    
                                    {plans[groupKey].map((plan) => {
                                        if (!plan.sublevel) {
                                            return (
                                                <div key={plan.infoid} className="mb-6">
                                                    <div className="flex flex-col items-center justify-between">
                                                        <div className="flex w-full justify-between">
                                                            <p className="text-lg font-semibold text-gray-700">
                                                                ปีการศึกษา {plan.summer} กลุ่ม {plan.group_name}
                                                            </p>
                                                        </div>
                                                        <div className="w-full overflow-x-auto mt-2">
                                                            <table className="w-full border-collapse border border-gray-300">
                                                                <thead>
                                                                    <tr className="bg-gray-200">
                                                                        <th className="border border-gray-300 p-2 w-[150px]">รหัสวิชา</th>
                                                                        <th className="border border-gray-300 p-2 w-[300px]">ชื่อวิชา</th>
                                                                        <th className="border border-gray-300 p-2 w-[150px]">ท-ป-น</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                {subjects[plan.infoid] && subjects[plan.infoid]["summer"] && subjects[plan.infoid]["summer"].length > 0 ? (
                                                                    subjects[plan.infoid]["summer"].map((subject) => (
                                                                        <tr key={subject.subject_id} className="text-center">
                                                                            <td className="border border-gray-300 p-2 w-[150px]">{subject.course_code}</td>
                                                                            <td className="border border-gray-300 p-2 w-[300px]">{subject.course_name}</td>
                                                                            <td className="border border-gray-300 p-2 w-[150px]">{subject.theory}-{subject.comply}-{subject.credit}</td>
                                                                        </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="4" className="text-center text-gray-500 border border-gray-300 px-4 py-2">
                                                                                ❌ ไม่พบข้อมูลรายวิชา
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
    
                                        const terms = plan.subterm.split("-").map(term => term.trim()).filter(t => t === selectedTerm);
                                        
                                        if (terms.length === 0) return null;

                                        return (
                                            <div key={plan.infoid} className="mb-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-lg font-semibold text-gray-700">
                                                        - ภาคเรียนที่ {plan.subterm} ปีการศึกษา {plan.year}
                                                    </p>
                                                </div>
    
                                                {terms.map(term => (
                                                    <div key={`${plan.infoid}-${term}`} className="mt-4">
                                                        <p className="text-lg font-semibold text-gray-700 text-left">ภาคเรียนที่ {term}</p>
    
                                                        <div className="w-full overflow-x-auto mt-2">
                                                            <table className="w-full border-collapse border border-gray-300">
                                                                <thead>
                                                                    <tr className="bg-gray-200">
                                                                        <th className="border border-gray-300 p-2 w-[150px]">รหัสวิชา</th>
                                                                        <th className="border border-gray-300 p-2 w-[300px]">ชื่อวิชา</th>
                                                                        <th className="border border-gray-300 p-2 w-[150px]">ท-ป-น</th>
                                                                        <th className="border border-gray-300 p-2 w-[100px]">เลือก</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                {subjects[plan.infoid] && subjects[plan.infoid][term] && subjects[plan.infoid][term].length > 0 ? (
                                                                    subjects[plan.infoid][term]
                                                                        .filter(subject => !savedSchedules.some(s => s.courseid === subject.courseid))
                                                                        .map((subject) => (
                                                                        <tr key={subject.subject_id} className="text-center">
                                                                            <td className="border border-gray-300 p-2 w-[150px]">{subject.course_code}</td>
                                                                            <td className="border border-gray-300 p-2 w-[300px]">{subject.course_name}</td>
                                                                            <td className="border border-gray-300 p-2 w-[150px]">{subject.theory}-{subject.comply}-{subject.credit}</td>
                                                                            <td className="border border-gray-300 p-2">
                                                                                <button
                                                                                    onClick={() => handleSubjectSelect(subject)}
                                                                                    disabled={!isSelectionMode}
                                                                                    className={`px-3 py-1 rounded text-sm transition-all ${
                                                                                        isSelectionMode
                                                                                        ? "bg-blue-500 text-white hover:bg-blue-600 shadow cursor-pointer"
                                                                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                                    }`}
                                                                                >
                                                                                    เลือก
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="4" className="text-center text-gray-500 border border-gray-300 px-4 py-2">
                                                                            ❌ ไม่พบข้อมูลรายวิชา
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>\u0e44\u0e21\u0e48\u0e1e\u0e1a\u0e41\u0e1c\u0e19\u0e01\u0e32\u0e23\u0e40\u0e23\u0e35\u0e22\u0e19\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e19\u0e35\u0e49</p>
                )}

                {/* Saved Schedules Table */}
                {savedSchedules.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-2xl font-bold text-green-600 text-center mb-4">ตารางที่บันทึกแล้ว</h3>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 p-2">รหัสวิชา</th>
                                        <th className="border border-gray-300 p-2">ชื่อวิชา</th>
                                        <th className="border border-gray-300 p-2">อาจารย์</th>
                                        <th className="border border-gray-300 p-2">ห้อง</th>
                                        <th className="border border-gray-300 p-2">วัน</th>
                                        <th className="border border-gray-300 p-2">คาบ</th>
                                        <th className="border border-gray-300 p-2">กลุ่ม</th>
                                        <th className="border border-gray-300 p-2 w-[150px]">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savedSchedules.map((schedule) => (
                                        <tr key={schedule.field_id} className="text-center hover:bg-gray-50">
                                            <td className="border border-gray-300 p-2">{schedule.course_code}</td>
                                            <td className="border border-gray-300 p-2 text-left">{schedule.course_name}</td>
                                            <td className="border border-gray-300 p-2">{schedule.teacher_name || "-"}</td>
                                            <td className="border border-gray-300 p-2">{schedule.room_name || "-"}</td>
                                            <td className="border border-gray-300 p-2">{schedule.date}</td>
                                            <td className="border border-gray-300 p-2">{schedule.start_time}-{schedule.end_time}</td>
                                            <td className="border border-gray-300 p-2">{schedule.group_name}</td>
                                            <td className="border border-gray-300 p-2">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => handleEdit(schedule)}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                                    >
                                                        แก้ไข
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(schedule.field_id)}
                                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                                    >
                                                        ลบ
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Teacher Modal */}
            <AnimatePresence>
                {showTeacherModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowTeacherModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-xl shadow-2xl w-11/12 md:w-1/2 lg:w-1/3 max-h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-5 border-b">
                                <h3 className="text-xl font-bold text-gray-800">เลือกอาจารย์ผู้สอน</h3>
                                <button onClick={() => setShowTeacherModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                                <ul className="space-y-2">
                                    {teachers.map((teacher) => (
                                        <li 
                                            key={teacher.teacher_id}
                                            onClick={() => handleTeacherSelect(teacher)}
                                            className="p-3 border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all flex justify-between items-center group"
                                        >
                                            <span className="font-medium text-gray-700 group-hover:text-blue-700">
                                                {teacher.prefix}{teacher.fname} {teacher.lname}
                                            </span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-600">
                                                {teacher.department}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Room Modal */}
            <AnimatePresence>
                {showRoomModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowRoomModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-xl shadow-2xl w-11/12 md:w-1/2 lg:w-1/3 max-h-[80vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-5 border-b">
                                <h3 className="text-xl font-bold text-gray-800">เลือกห้องเรียน</h3>
                                <button onClick={() => setShowRoomModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                                <ul className="space-y-2">
                                    {rooms.map((room) => (
                                        <li 
                                            key={room.room_id}
                                            onClick={() => handleRoomSelect(room)}
                                            className="p-3 border border-gray-100 rounded-lg hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all flex justify-between items-center group"
                                        >
                                            <span className="font-medium text-gray-700 group-hover:text-blue-700">
                                                {room.room_name}
                                            </span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-600">
                                                {room.room_type}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-xl shadow-2xl w-11/12 md:w-2/3 lg:w-1/2 max-h-[80vh] flex flex-col overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-5 border-b">
                                <h3 className="text-xl font-bold text-gray-800">แก้ไขตารางเรียน</h3>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Teacher */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">อาจารย์ผู้สอน</label>
                                        <div
                                            onClick={() => setShowTeacherModal(true)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 bg-white text-gray-800 min-h-[42px] flex items-center"
                                        >
                                            {editData.teacher_name || "เลือกอาจารย์"}
                                        </div>
                                    </div>
                                    {/* Room */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">ห้องเรียน</label>
                                        <div
                                            onClick={() => setShowRoomModal(true)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50 bg-white text-gray-800 min-h-[42px] flex items-center"
                                        >
                                            {editData.room_name || "เลือกห้อง"}
                                        </div>
                                    </div>
                                    {/* Day */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">วัน</label>
                                        <select
                                            value={editData.date}
                                            onChange={(e) => setEditData({...editData, date: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800"
                                        >
                                            <option value="จันทร์">จันทร์</option>
                                            <option value="อังคาร">อังคาร</option>
                                            <option value="พุธ">พุธ</option>
                                            <option value="พฤหัสบดี">พฤหัสบดี</option>
                                            <option value="ศุกร์">ศุกร์</option>
                                            <option value="เสาร์">เสาร์</option>
                                            <option value="อาทิตย์">อาทิตย์</option>
                                        </select>
                                    </div>
                                    {/* Start Period */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">คาบเริ่ม</label>
                                        <input
                                            type="number"
                                            value={editData.start_time}
                                            onChange={(e) => setEditData({...editData, start_time: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    {/* End Period */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">คาบสิ้นสุด</label>
                                        <input
                                            type="number"
                                            value={editData.end_time}
                                            onChange={(e) => setEditData({...editData, end_time: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-3 justify-end">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleUpdateSchedule}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        บันทึก
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Create_Study_Table;