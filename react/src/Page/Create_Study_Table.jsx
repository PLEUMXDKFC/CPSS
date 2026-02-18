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
    const [availableTerms, setAvailableTerms] = useState(["1", "2"]); // Default to 1, 2 until loaded
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

    const [day, setDay] = useState("Monday");

    // Day mapping: English (saved to DB) -> Thai (display)
    const dayMap = {
        "Monday": "จันทร์",
        "Tuesday": "อังคาร",
        "Wednesday": "พุธ",
        "Thursday": "พฤหัสบดี",
        "Friday": "ศุกร์"
    };
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

    // Split Mode - Group 2 fields
    const [courseCode2, setCourseCode2] = useState("");
    const [courseName2, setCourseName2] = useState("");
    const [courseId2, setCourseId2] = useState(null);
    const [planId2, setPlanId2] = useState(null);
    const [theory2, setTheory2] = useState(0);
    const [comply2, setComply2] = useState(0);
    const [instructorName2, setInstructorName2] = useState("");
    const [teacherId2, setTeacherId2] = useState(null);
    const [roomName2, setRoomName2] = useState("");
    const [roomId2, setRoomId2] = useState(null);
    const [day2, setDay2] = useState("Monday");
    const [startPeriod2, setStartPeriod2] = useState("");
    const [endPeriod2, setEndPeriod2] = useState("");
    const [selectingForGroup, setSelectingForGroup] = useState(null);

    // Saved Schedules
    const [savedSchedules, setSavedSchedules] = useState([]);
    const [editingId, setEditingId] = useState(null); // Track which row is being edited
    const [editingData, setEditingData] = useState({}); // Temp data for inline edit

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

                // Check default term from subterm
                if (firstPlan.subterm) {
                    const terms = firstPlan.subterm.split("-").map(t => t.trim());
                    if (terms.length > 0) {
                        setAvailableTerms(terms);
                        if (!terms.includes(selectedTerm)) {
                            setSelectedTerm(terms[0]);
                        }
                    }
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
        if (isSplitMode) {
            // Split mode: fill based on selectingForGroup
            if (selectingForGroup === 1) {
                setCourseCode(subject.course_code);
                setCourseName(subject.course_name);
                setCourseId(subject.courseid);
                setPlanId(subject.planid);
                setTheory(parseInt(subject.theory) || 0);
                setComply(parseInt(subject.comply) || 0);
                setInstructorName("");
                setRoomName("");
                setSelectingForGroup(null);
            } else if (selectingForGroup === 2) {
                if (subject.courseid === courseId) {
                    Swal.fire("ไม่สามารถเลือกวิชาเดียวกันได้", "กรุณาเลือกวิชาอื่นสำหรับกลุ่ม " + group2Name, "warning");
                    return;
                }
                setCourseCode2(subject.course_code);
                setCourseName2(subject.course_name);
                setCourseId2(subject.courseid);
                setPlanId2(subject.planid);
                setTheory2(parseInt(subject.theory) || 0);
                setComply2(parseInt(subject.comply) || 0);
                setInstructorName2("");
                setRoomName2("");
                setSelectingForGroup(null);
            }
        } else {
            // Combined mode
            if (!isSelectionMode) return;
            setCourseCode(subject.course_code);
            setCourseName(subject.course_name);
            setCourseId(subject.courseid);
            setPlanId(subject.planid);
            setTheory(parseInt(subject.theory) || 0);
            setComply(parseInt(subject.comply) || 0);
            setInstructorName("");
            setRoomName("");
        }
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
        setRoomId(null);
        setDay("Monday");
        setStartPeriod("");
        setEndPeriod("");
        // Reset group 2
        setCourseCode2("");
        setCourseName2("");
        setCourseId2(null);
        setPlanId2(null);
        setTheory2(0);
        setComply2(0);
        setInstructorName2("");
        setTeacherId2(null);
        setRoomName2("");
        setRoomId2(null);
        setDay2("Monday");
        setStartPeriod2("");
        setEndPeriod2("");
        setSelectingForGroup(null);
    };

    const handleCancelGroup1 = () => {
        setCourseCode("");
        setCourseName("");
        setCourseId(null);
        setPlanId(null);
        setTheory(0);
        setComply(0);
        setInstructorName("");
        setTeacherId(null);
        setRoomName("");
        setRoomId(null);
        setDay("Monday");
        setStartPeriod("");
        setEndPeriod("");
        setSelectingForGroup(null);
    };

    const handleCancelGroup2 = () => {
        setCourseCode2("");
        setCourseName2("");
        setCourseId2(null);
        setPlanId2(null);
        setTheory2(0);
        setComply2(0);
        setInstructorName2("");
        setTeacherId2(null);
        setRoomName2("");
        setRoomId2(null);
        setDay2("Monday");
        setStartPeriod2("");
        setEndPeriod2("");
        setSelectingForGroup(null);
    };

    const handleTeacherSelect = (teacher) => {
        const fullName = `${teacher.prefix}${teacher.fname} ${teacher.lname}`;
        if (editingId) {
            setEditingData({
                ...editingData,
                teacher_id: teacher.teacher_id,
                teacher_name: fullName
            });
        } else if (selectingForGroup === 2) {
            setInstructorName2(fullName);
            setTeacherId2(teacher.teacher_id);
        } else {
            setInstructorName(fullName);
            setTeacherId(teacher.teacher_id);
        }
        setShowTeacherModal(false);
        setSelectingForGroup(null);
    };

    const handleRoomSelect = (room) => {
        if (editingId) {
            setEditingData({
                ...editingData,
                room_id: room.room_id,
                room_name: room.room_name
            });
        } else if (selectingForGroup === 2) {
            setRoomName2(room.room_name);
            setRoomId2(room.room_id);
        } else {
            setRoomName(room.room_name);
            setRoomId(room.room_id);
        }
        setShowRoomModal(false);
        setSelectingForGroup(null);
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

    const checkConflict = async (checkData) => {
        console.log("🔍 [CheckConflict] Checking payload:", checkData);
        try {
            const res = await axios.get(`${API_BASE_URL}/server/api/GET/CheckConflict.php`, { params: checkData });
            console.log("🔍 [CheckConflict] Response:", res.data);

            if (res.data.status === 'conflict') {
                console.warn("❌ [CheckConflict] Conflict detected:", res.data.message);
                Swal.fire({
                    icon: 'error',
                    title: 'ข้อมูลซ้อนทับ',
                    html: res.data.message,
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'ตกลง'
                });
                return false;
            }
            console.log("✅ [CheckConflict] No conflict found.");
            return true;
        } catch (err) {
            console.error("❌ [CheckConflict] Error:", err);
            const msg = err.response?.data?.message || err.message || "Unknown error";
            Swal.fire("ข้อผิดพลาด", "ระบบตรวจสอบขัดข้อง: " + msg, "error");
            return false;
        }
    };

    const handleSaveSchedule = async () => {
        console.log("💾 [handleSaveSchedule] Starting save process...");

        // Validation with specific message
        if (!courseId) { console.warn("⚠️ Validation failed: No courseId"); Swal.fire("กรุณาเลือกวิชา", "", "warning"); return; }
        if (!teacherId) { console.warn("⚠️ Validation failed: No teacherId"); Swal.fire("กรุณาเลือกครูผู้สอน", "", "warning"); return; }
        if (!roomName) { console.warn("⚠️ Validation failed: No roomName"); Swal.fire("กรุณาเลือกห้องเรียน", "", "warning"); return; }
        if (!day) { console.warn("⚠️ Validation failed: No day"); Swal.fire("กรุณาเลือกวัน", "", "warning"); return; }
        if (!startPeriod || !endPeriod) { console.warn("⚠️ Validation failed: No time period"); Swal.fire("กรุณาเลือกเวลาเรียน", "", "warning"); return; }

        if (isEndPeriodInvalid()) {
            console.warn("⚠️ Validation failed: Invalid period duration");
            Swal.fire("ช่วงเวลาไม่ถูกต้อง", "จำนวนคาบเกินกว่าที่กำหนดในรายวิชา", "error");
            return;
        }

        // Check Conflict
        const conflictPayload = {
            teacher_id: teacherId,
            room_id: roomId || 0,
            planid: planId,
            group_name: currentGroupName,
            date: day,
            start_time: parseInt(startPeriod),
            end_time: parseInt(endPeriod),
            term: selectedTerm
        };
        const isSafe = await checkConflict(conflictPayload);
        if (!isSafe) return;

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

        console.log("📤 handleSaveSchedule payload:", payload);
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
                console.error("Save error:", err);
                const msg = err.response?.data?.message || err.message || "Unknown error";
                Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์: " + msg, "error");
            });
    };

    const handleSaveSplitSchedule = async () => {
        console.log("💾 [handleSaveSplitSchedule] Starting split save process...");

        // Validate group 1
        if (!courseId) { console.warn("⚠️ Validation failed: Group 1 missing course"); Swal.fire("กรุณาเลือกวิชา (กลุ่ม " + group1Name + ")", "", "warning"); return; }
        if (!teacherId) { console.warn("⚠️ Validation failed: Group 1 missing teacher"); Swal.fire("กรุณาเลือกครู (กลุ่ม " + group1Name + ")", "", "warning"); return; }
        if (!roomName) { console.warn("⚠️ Validation failed: Group 1 missing room"); Swal.fire("กรุณาเลือกห้อง (กลุ่ม " + group1Name + ")", "", "warning"); return; }
        if (!day || !startPeriod || !endPeriod) { console.warn("⚠️ Validation failed: Group 1 missing time"); Swal.fire("กรุณาเลือกเวลา (กลุ่ม " + group1Name + ")", "", "warning"); return; }

        // Validate group 2
        if (!courseId2) { console.warn("⚠️ Validation failed: Group 2 missing course"); Swal.fire("กรุณาเลือกวิชา (กลุ่ม " + group2Name + ")", "", "warning"); return; }
        if (!teacherId2) { console.warn("⚠️ Validation failed: Group 2 missing teacher"); Swal.fire("กรุณาเลือกครู (กลุ่ม " + group2Name + ")", "", "warning"); return; }
        if (!roomName2) { console.warn("⚠️ Validation failed: Group 2 missing room"); Swal.fire("กรุณาเลือกห้อง (กลุ่ม " + group2Name + ")", "", "warning"); return; }
        if (!day2 || !startPeriod2 || !endPeriod2) { console.warn("⚠️ Validation failed: Group 2 missing time"); Swal.fire("กรุณาเลือกเวลา (กลุ่ม " + group2Name + ")", "", "warning"); return; }

        // Check Conflict Group 1
        const conflict1 = {
            teacher_id: teacherId,
            room_id: roomId || 0,
            planid: planId,
            group_name: group1Name,
            date: day,
            start_time: parseInt(startPeriod),
            end_time: parseInt(endPeriod),
            term: selectedTerm
        };
        const safe1 = await checkConflict(conflict1);
        if (!safe1) return;

        // Check Conflict Group 2
        const conflict2 = {
            teacher_id: teacherId2,
            room_id: roomId2 || 0,
            planid: planId2,
            group_name: group2Name,
            date: day2,
            start_time: parseInt(startPeriod2),
            end_time: parseInt(endPeriod2),
            term: selectedTerm
        };
        const safe2 = await checkConflict(conflict2);
        if (!safe2) return;

        const payload1 = {
            teacher_id: teacherId,
            courseid: courseId,
            room_id: roomId || 0,
            planid: planId,
            date: day,
            start_time: parseInt(startPeriod),
            end_time: parseInt(endPeriod),
            group_name: group1Name,
            term: selectedTerm,
            table_split_status: true,
            split_status: 1
        };

        const payload2 = {
            teacher_id: teacherId2,
            courseid: courseId2,
            room_id: roomId2 || 0,
            planid: planId2,
            date: day,
            start_time: parseInt(startPeriod2),
            end_time: parseInt(endPeriod2),
            group_name: group2Name,
            term: selectedTerm,
            table_split_status: true,
            split_status: 2
        };

        console.log("📤 handleSaveSplitSchedule payload1:", payload1);
        console.log("📤 handleSaveSplitSchedule payload2:", payload2);

        // Save both groups
        Promise.all([
            axios.post(`${API_BASE_URL}/server/api/POST/InsertSchedule.php`, payload1),
            axios.post(`${API_BASE_URL}/server/api/POST/InsertSchedule.php`, payload2)
        ])
            .then(([res1, res2]) => {
                if (res1.data.status === 'success' && res2.data.status === 'success') {
                    Swal.fire("บันทึกสำเร็จ", "บันทึกทั้ง 2 กลุ่มเรียบร้อยแล้ว", "success");
                    handleCancel();
                    fetchSavedSchedules();
                } else {
                    Swal.fire("เกิดข้อผิดพลาด", res1.data.message || res2.data.message, "error");
                }
            })
            .catch(err => {
                console.error("Save Split error:", err);
                const msg = err.response?.data?.message || err.message || "Unknown error";
                Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์: " + msg, "error");
            });
    };

    const handleEdit = (schedule) => {
        setEditingId(schedule.field_id);
        setEditingData({
            field_id: schedule.field_id,
            teacher_id: schedule.teacher_id,
            teacher_name: schedule.teacher_name,
            room_id: schedule.room_id,
            room_name: schedule.room_name,
            date: schedule.date,
            start_time: schedule.start_time,
            end_time: schedule.end_time
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingData({});
    };

    const handleSaveEdit = () => {
        const payload = {
            field_id: editingData.field_id,
            teacher_id: editingData.teacher_id,
            room_id: editingData.room_id,
            date: editingData.date,
            start_time: parseInt(editingData.start_time),
            end_time: parseInt(editingData.end_time)
        };

        console.log("📤 handleSaveEdit payload:", payload);
        axios.post(`${API_BASE_URL}/server/api/POST/UpdateSchedule.php`, payload)
            .then(res => {
                if (res.data.status === 'success') {
                    Swal.fire("อัปเดตสำเร็จ", "", "success");
                    setEditingId(null);
                    setEditingData({});
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
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white 
                    rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">ย้อนกลับ</span>
                </button>

                <h2 className="text-center text-3xl font-bold mb-6">รายวิชาจากแผนการเรียน</h2>

                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                        <div className="flex gap-2">
                            {availableTerms.map(term => (
                                <button
                                    key={term}
                                    onClick={() => setSelectedTerm(term)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${selectedTerm === term
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                >
                                    ภาคเรียนที่ {term}
                                </button>
                            ))}
                        </div>

                        {/* Split/Combine Toggle for Paired Groups */}
                        {isPairedGroup && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsSplitMode(false)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${!isSplitMode
                                        ? "bg-purple-600 text-white shadow-md"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                >
                                    จัดรวม
                                </button>
                                <button
                                    onClick={() => setIsSplitMode(true)}
                                    className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${isSplitMode
                                        ? "bg-purple-600 text-white shadow-md"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                        }`}
                                >
                                    จัดแยก
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {!isSplitMode && (
                                <>
                                    {!isSelectionMode ? (
                                        <button
                                            onClick={handleArrangeClick}
                                            className="px-6 py-2 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white shadow-md transition-all font-medium whitespace-nowrap"
                                        >
                                            จัดตารางเรียน
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSaveSchedule}
                                                className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white shadow-md transition-all font-medium whitespace-nowrap"
                                            >
                                                บันทึก
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="px-6 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white shadow-md transition-all font-medium whitespace-nowrap"
                                            >
                                                ยกเลิก
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Combined Mode Alerts */}
                    {!isSplitMode && isSelectionMode && !courseCode && (
                        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-sm animate-pulse">
                            <p className="font-bold">กรุณาเลือกรายวิชา</p>
                            <p>โปรดเลือกวิชาจากตารางด้านล่างเพื่อดำเนินการจัดตาราง</p>
                        </div>
                    )}

                    {/* === SPLIT MODE: Group 1 with blue wrapper === */}
                    {isSplitMode && (
                        <div className="mb-4 p-4 border-2 border-blue-300 rounded-xl bg-blue-50">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-lg font-bold text-blue-700">กลุ่ม {group1Name}</h4>
                                <div className="flex gap-2">
                                    {!courseCode && selectingForGroup !== 1 && (
                                        <button
                                            onClick={() => setSelectingForGroup(1)}
                                            className="px-4 py-1.5 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white shadow-md transition-all font-medium text-sm"
                                        >
                                            จัดตารางเรียนกลุ่ม {group1Name}
                                        </button>
                                    )}
                                    {selectingForGroup === 1 && !courseCode && (
                                        <span className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg font-medium text-sm animate-pulse">
                                            กำลังเลือกวิชา...
                                        </span>
                                    )}
                                    {courseCode && (
                                        <button
                                            onClick={handleCancelGroup1}
                                            className="px-4 py-1.5 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white shadow-md transition-all font-medium text-sm"
                                        >
                                            ยกเลิกกลุ่ม {group1Name}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสวิชา</label>
                                    <input type="text" value={courseCode} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อวิชา</label>
                                    <input type="text" value={courseName} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">อาจารย์ผู้สอน</label>
                                    <div
                                        onClick={() => {
                                            if (!courseCode) return;
                                            setSelectingForGroup(1);
                                            setShowTeacherModal(true);
                                        }}
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center min-h-[42px] ${courseCode
                                            ? "cursor-pointer hover:bg-gray-50 bg-white text-gray-800"
                                            : "cursor-not-allowed bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {instructorName || "เลือกอาจารย์"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">ห้องเรียน</label>
                                    <div
                                        onClick={() => {
                                            if (!courseCode) return;
                                            setSelectingForGroup(1);
                                            setShowRoomModal(true);
                                        }}
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center min-h-[42px] ${courseCode
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
                                        disabled={!courseCode}
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${courseCode ? "bg-white text-gray-800" : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        <option value="Monday">จันทร์</option>
                                        <option value="Tuesday">อังคาร</option>
                                        <option value="Wednesday">พุธ</option>
                                        <option value="Thursday">พฤหัสบดี</option>
                                        <option value="Friday">ศุกร์</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">คาบที่เริ่ม</label>
                                    <input
                                        type="number"
                                        value={startPeriod}
                                        onChange={(e) => setStartPeriod(e.target.value)}
                                        disabled={!courseCode}
                                        placeholder="เช่น 1"
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${courseCode ? "text-gray-800" : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">คาบที่จบ</label>
                                    <input
                                        type="number"
                                        value={endPeriod}
                                        onChange={(e) => setEndPeriod(e.target.value)}
                                        disabled={!courseCode}
                                        placeholder="เช่น 4"
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${courseCode ? "text-gray-800" : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === COMBINED MODE: Form fields without wrapper === */}
                    {!isSplitMode && (
                        <>
                            {/* Row 2: Subject Details (Combined Mode) */}
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
                                    <div
                                        onClick={handleOpenTeacherModal}
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center min-h-[42px] ${isSelectionMode && courseCode
                                            ? "cursor-pointer hover:bg-gray-50 bg-white text-gray-800"
                                            : "cursor-not-allowed bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {instructorName || "เลือกอาจารย์"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">ห้องเรียน</label>
                                    <div
                                        onClick={handleOpenRoomModal}
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center min-h-[42px] ${isSelectionMode && courseCode
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
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${isSelectionMode && courseCode
                                            ? "bg-white text-gray-800"
                                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            }`}
                                    >
                                        <option value="Monday">จันทร์</option>
                                        <option value="Tuesday">อังคาร</option>
                                        <option value="Wednesday">พุธ</option>
                                        <option value="Thursday">พฤหัสบดี</option>
                                        <option value="Friday">ศุกร์</option>
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
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${isSelectionMode && courseCode
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
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${isSelectionMode && courseCode
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
                        </>
                    )}

                    {/* Group 2 Form - Split Mode */}
                    {isSplitMode && (
                        <div className="mt-6 p-4 border-2 border-purple-300 rounded-xl bg-purple-50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-purple-700">กลุ่ม {group2Name}</h4>
                                <div className="flex gap-2">
                                    {!courseCode2 && selectingForGroup !== 2 && (
                                        <button
                                            onClick={() => setSelectingForGroup(2)}
                                            className="px-4 py-1.5 bg-white text-green-600 border border-green-600 rounded-lg hover:bg-green-600 hover:text-white shadow-md transition-all font-medium text-sm"
                                        >
                                            จัดตารางเรียนกลุ่ม {group2Name}
                                        </button>
                                    )}
                                    {selectingForGroup === 2 && !courseCode2 && (
                                        <span className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg font-medium text-sm animate-pulse">
                                            กำลังเลือกวิชา...
                                        </span>
                                    )}
                                    {courseCode2 && (
                                        <button
                                            onClick={handleCancelGroup2}
                                            className="px-4 py-1.5 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white shadow-md transition-all font-medium text-sm"
                                        >
                                            ยกเลิกกลุ่ม {group2Name}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">รหัสวิชา</label>
                                    <input type="text" value={courseCode2} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">ชื่อวิชา</label>
                                    <input type="text" value={courseName2} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">อาจารย์ผู้สอน</label>
                                    <div
                                        onClick={() => {
                                            if (!courseCode2) return;
                                            setSelectingForGroup(2);
                                            setShowTeacherModal(true);
                                        }}
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center min-h-[42px] ${courseCode2
                                            ? "cursor-pointer hover:bg-gray-50 bg-white text-gray-800"
                                            : "cursor-not-allowed bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {instructorName2 || "เลือกอาจารย์"}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">ห้องเรียน</label>
                                    <div
                                        onClick={() => {
                                            if (!courseCode2) return;
                                            setSelectingForGroup(2);
                                            setShowRoomModal(true);
                                        }}
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 flex items-center min-h-[42px] ${courseCode2
                                            ? "cursor-pointer hover:bg-gray-50 bg-white text-gray-800"
                                            : "cursor-not-allowed bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {roomName2 || "เลือกห้องเรียน"}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">วัน <span className="text-xs text-purple-500">(ล็อกตามกลุ่ม {group1Name})</span></label>
                                    <select
                                        value={day}
                                        disabled={true}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    >
                                        <option value="Monday">จันทร์</option>
                                        <option value="Tuesday">อังคาร</option>
                                        <option value="Wednesday">พุธ</option>
                                        <option value="Thursday">พฤหัสบดี</option>
                                        <option value="Friday">ศุกร์</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">คาบที่เริ่ม</label>
                                    <input
                                        type="number"
                                        value={startPeriod2}
                                        onChange={(e) => setStartPeriod2(e.target.value)}
                                        disabled={!courseCode2}
                                        placeholder="เช่น 1"
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${courseCode2 ? "text-gray-800" : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">คาบที่จบ</label>
                                    <input
                                        type="number"
                                        value={endPeriod2}
                                        onChange={(e) => setEndPeriod2(e.target.value)}
                                        disabled={!courseCode2}
                                        placeholder="เช่น 4"
                                        className={`w-full border border-gray-300 rounded-lg px-3 py-2 ${courseCode2 ? "text-gray-800" : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save button for Split Mode */}
                    {isSplitMode && courseCode && courseCode2 && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={handleSaveSplitSchedule}
                                className="px-8 py-2.5 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white shadow-md transition-all font-medium text-lg"
                            >
                                บันทึกทั้ง 2 กลุ่ม
                            </button>
                        </div>
                    )}
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

                                        console.log("Rendering plan:", plan);
                                        // Force render for the selected term
                                        const terms = [selectedTerm];

                                        if (!selectedTerm) return null;

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
                                                                            .filter(subject => {
                                                                                const relatedSchedules = savedSchedules.filter(s => String(s.courseid) === String(subject.courseid) && String(s.term) === String(selectedTerm));

                                                                                if (isSplitMode) {
                                                                                    // STRICT FILTER v3
                                                                                    // 1. Check Combined
                                                                                    const isCombined = relatedSchedules.some(s => {
                                                                                        const st = String(s.split_status);
                                                                                        return st === '0' || st === 'null' || st === 'undefined' || st === '' || st === 'false';
                                                                                    });
                                                                                    if (isCombined) return false;

                                                                                    // 2. Check Status Per Group
                                                                                    const g1 = relatedSchedules.some(s => String(s.split_status) === '1');
                                                                                    const g2 = relatedSchedules.some(s => String(s.split_status) === '2');

                                                                                    // 3. Selection Mode Logic
                                                                                    if (selectingForGroup) {
                                                                                        if (String(selectingForGroup) === '1' && g1) return false;
                                                                                        if (String(selectingForGroup) === '2' && g2) return false;
                                                                                    } else {
                                                                                        // 4. View Mode: Hide if ANY group is done
                                                                                        if (g1 || g2) return false;
                                                                                    }

                                                                                    return true;
                                                                                } else {
                                                                                    // Combined Mode: Hide if ANY schedule exists
                                                                                    return relatedSchedules.length === 0;
                                                                                }
                                                                            })
                                                                            .map((subject) => {
                                                                                // Check saved status per group
                                                                                const savedForGroup1 = savedSchedules.some(s => String(s.courseid) === String(subject.courseid) && String(s.split_status) === '1' && String(s.term) === String(selectedTerm));
                                                                                const savedForGroup2 = savedSchedules.some(s => String(s.courseid) === String(subject.courseid) && String(s.split_status) === '2' && String(s.term) === String(selectedTerm));

                                                                                // Determine if button should be disabled
                                                                                const isDisabledInSplit = !selectingForGroup
                                                                                    || (selectingForGroup === 1 && courseCode)
                                                                                    || (selectingForGroup === 2 && courseCode2)
                                                                                    || (selectingForGroup === 1 && savedForGroup1)
                                                                                    || (selectingForGroup === 2 && savedForGroup2)
                                                                                    || (selectingForGroup === 2 && String(subject.courseid) === String(courseId));

                                                                                const isDisabled = isSplitMode
                                                                                    ? isDisabledInSplit
                                                                                    : (!isSelectionMode || (isSelectionMode && courseId && String(subject.courseid) === String(courseId)));

                                                                                // Button label
                                                                                let buttonLabel = "เลือก";
                                                                                if (isSplitMode) {
                                                                                    if (courseId && String(subject.courseid) === String(courseId)) {
                                                                                        buttonLabel = "เลือกแล้ว (กลุ่ม " + group1Name + ")";
                                                                                    } else if (courseId2 && String(subject.courseid) === String(courseId2)) {
                                                                                        buttonLabel = "เลือกแล้ว (กลุ่ม " + group2Name + ")";
                                                                                    } else if (savedForGroup1 && !savedForGroup2) {
                                                                                        buttonLabel = "กลุ่ม " + group1Name + " จัดแล้ว";
                                                                                    } else if (savedForGroup2 && !savedForGroup1) {
                                                                                        buttonLabel = "กลุ่ม " + group2Name + " จัดแล้ว";
                                                                                    }
                                                                                } else {
                                                                                    // Combined mode label
                                                                                    if (isSelectionMode && courseId && String(subject.courseid) === String(courseId)) {
                                                                                        buttonLabel = "เลือกแล้ว";
                                                                                    }
                                                                                }

                                                                                return (
                                                                                    <tr key={subject.courseid} className="text-center">
                                                                                        <td className="border border-gray-300 p-2 w-[150px]">{subject.course_code}</td>
                                                                                        <td className="border border-gray-300 p-2 w-[300px]">
                                                                                            {subject.course_name}
                                                                                            {isSplitMode && savedForGroup1 && !savedForGroup2 && (
                                                                                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">กลุ่ม {group1Name} จัดแล้ว</span>
                                                                                            )}
                                                                                            {isSplitMode && savedForGroup2 && !savedForGroup1 && (
                                                                                                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">กลุ่ม {group2Name} จัดแล้ว</span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="border border-gray-300 p-2 w-[150px]">{subject.theory}-{subject.comply}-{subject.credit}</td>
                                                                                        <td className="border border-gray-300 p-2">
                                                                                            <button
                                                                                                onClick={() => handleSubjectSelect(subject)}
                                                                                                disabled={isDisabled}
                                                                                                className={`px-3 py-1 rounded text-sm transition-all ${isDisabled
                                                                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                                                    : "bg-blue-500 text-white hover:bg-blue-600 shadow cursor-pointer"
                                                                                                    }`}
                                                                                            >
                                                                                                {buttonLabel}
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })
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
                                    {savedSchedules
                                        .filter(schedule => String(schedule.term) === String(selectedTerm))
                                        .map((schedule) => (
                                            <tr key={schedule.field_id} className="text-center hover:bg-gray-50">
                                                <td className="border border-gray-300 p-2">{schedule.course_code}</td>
                                                <td className="border border-gray-300 p-2 text-left">{schedule.course_name}</td>

                                                {/* Teacher - Inline Edit */}
                                                <td className="border border-gray-300 p-2">
                                                    {editingId === schedule.field_id ? (
                                                        <div
                                                            onClick={() => setShowTeacherModal(true)}
                                                            className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded border border-blue-300 bg-blue-50 text-gray-800 min-h-[32px] flex items-center justify-center"
                                                        >
                                                            {editingData.teacher_name || "เลือกอาจารย์"}
                                                        </div>
                                                    ) : (
                                                        schedule.teacher_name || "-"
                                                    )}
                                                </td>

                                                {/* Room - Inline Edit */}
                                                <td className="border border-gray-300 p-2">
                                                    {editingId === schedule.field_id ? (
                                                        <div
                                                            onClick={() => setShowRoomModal(true)}
                                                            className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded border border-blue-300 bg-blue-50 text-gray-800 min-h-[32px] flex items-center justify-center"
                                                        >
                                                            {editingData.room_name || "เลือกห้อง"}
                                                        </div>
                                                    ) : (
                                                        schedule.room_name || "-"
                                                    )}
                                                </td>

                                                {/* Day - Inline Edit */}
                                                <td className="border border-gray-300 p-2">
                                                    {editingId === schedule.field_id ? (
                                                        <select
                                                            value={editingData.date}
                                                            onChange={(e) => setEditingData({ ...editingData, date: e.target.value })}
                                                            className="w-full border border-gray-300 rounded px-2 py-1 bg-white text-gray-800"
                                                        >
                                                            <option value="Monday">จันทร์</option>
                                                            <option value="Tuesday">อังคาร</option>
                                                            <option value="Wednesday">พุธ</option>
                                                            <option value="Thursday">พฤหัสบดี</option>
                                                            <option value="Friday">ศุกร์</option>
                                                        </select>
                                                    ) : (
                                                        dayMap[schedule.date] || schedule.date
                                                    )}
                                                </td>

                                                {/* Period - Inline Edit */}
                                                <td className="border border-gray-300 p-2">
                                                    {editingId === schedule.field_id ? (
                                                        <div className="flex gap-1 items-center justify-center">
                                                            <input
                                                                type="number"
                                                                value={editingData.start_time}
                                                                onChange={(e) => setEditingData({ ...editingData, start_time: e.target.value })}
                                                                className="w-14 border border-gray-300 rounded px-2 py-1 text-center"
                                                            />
                                                            <span>-</span>
                                                            <input
                                                                type="number"
                                                                value={editingData.end_time}
                                                                onChange={(e) => setEditingData({ ...editingData, end_time: e.target.value })}
                                                                className="w-14 border border-gray-300 rounded px-2 py-1 text-center"
                                                            />
                                                        </div>
                                                    ) : (
                                                        `${schedule.start_time}-${schedule.end_time}`
                                                    )}
                                                </td>

                                                <td className="border border-gray-300 p-2">กลุ่ม {schedule.group_name}</td>

                                                {/* Actions */}
                                                <td className="border border-gray-300 p-2">
                                                    <div className="flex gap-2 justify-center">
                                                        {editingId === schedule.field_id ? (
                                                            <>
                                                                <button
                                                                    onClick={handleSaveEdit}
                                                                    className="px-3 py-1 bg-white text-green-600 border border-green-600 rounded hover:bg-green-600 hover:text-white text-sm transition-all"
                                                                >
                                                                    บันทึก
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="px-3 py-1 bg-white text-gray-600 border border-gray-500 rounded hover:bg-gray-600 hover:text-white text-sm transition-all"
                                                                >
                                                                    ยกเลิก
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(schedule)}
                                                                    className="px-3 py-1 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white text-sm transition-all"
                                                                >
                                                                    แก้ไข
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(schedule.field_id)}
                                                                    className="px-3 py-1 bg-white text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white text-sm transition-all"
                                                                >
                                                                    ลบ
                                                                </button>
                                                            </>
                                                        )}
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
        </div>
    );
}

export default Create_Study_Table;