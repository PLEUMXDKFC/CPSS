import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/sidebar";
import { useNavigate, useParams } from "react-router-dom"; // ✅ เพิ่ม useParams
import { Trash2, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

const Plans = () => {
    const { infoid } = useParams(); // ดึง infoid จาก URL
    const [plans, setPlans] = useState({});
    const [subjects, setSubjects] = useState({});
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    useEffect(() => {
        if (!infoid) return; // ถ้าไม่มี infoid ให้หยุดโหลดข้อมูล
    
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
                console.log("ข้อมูลรายวิชาที่ได้รับ:", response.data);  // ตรวจสอบข้อมูลที่ได้รับ
    
                // แก้ไขการจัดกลุ่มข้อมูลให้ถูกต้อง
                const groupedSubjects = response.data.reduce((acc, subject) => {
                    const term = subject.term || "summer";  // กำหนด default เป็น 'summer' หากไม่มี term
                    if (!acc[subject.infoid]) acc[subject.infoid] = {};  // ตรวจสอบ infoid
                    if (!acc[subject.infoid][term]) acc[subject.infoid][term] = [];
                    acc[subject.infoid][term].push(subject);
                    return acc;
                }, {});
    
                console.log("ข้อมูลรายวิชาที่จัดกลุ่มแล้ว:", groupedSubjects); // ตรวจสอบข้อมูลที่จัดกลุ่ม
                setSubjects(groupedSubjects);
            })
            .catch(error => console.error("❌ Error fetching subjects:", error));
            
    }, [infoid]); // ✅ ใช้ infoid แทน planid
    
    const handleAddSubject = (infoid, planid, term, year) => {
        navigate(`/add-subject?infoid=${infoid}&planid=${planid}&term=${term}&year=${year}`);
    };

    const handleDeleteSubject = (courseid, infoid, term) => {
        Swal.fire({
            title: "ยืนยันการลบ?",
            text: "คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชานี้?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ใช่, ลบเลย!",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(`${API_BASE_URL}/server/api/DELETE/Delete_subject.php`, {
                    courseid: courseid,
                })
                .then(response => {
                    if (response.data.success) {
                        Swal.fire("ลบสำเร็จ!", "รายวิชาถูกลบออกแล้ว", "success");
                        // รีเฟรชข้อมูลรายวิชาโดยกรองออกจาก subjects state
                        setSubjects(prevSubjects => {
                            const updatedSubjects = { ...prevSubjects };
                            if (updatedSubjects[infoid] && updatedSubjects[infoid][term]) {
                                updatedSubjects[infoid][term] = updatedSubjects[infoid][term].filter(subject => subject.courseid !== courseid);
                            }
                            return updatedSubjects;
                        });
                    } else {
                        Swal.fire("ผิดพลาด!", "ไม่สามารถลบรายวิชาได้", "error");
                    }
                })
                .catch(error => {
                    console.error("❌ Error deleting subject:", error);
                    Swal.fire("ผิดพลาด!", "เกิดข้อผิดพลาดในการลบรายวิชา", "error");
                });
            }
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="ml-64 container mx-auto p-6">
                {/* ปุ่มย้อนกลับ */}
                <button 
                    onClick={handleBack} 
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 
                    rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">ย้อนกลับ</span>
                </button>
                <h2 className="text-center text-3xl font-bold mb-6">สร้างแผนการเรียน</h2>
    
                {Object.keys(plans).length > 0 ? (
                    <div className="space-y-8">
                        {Object.keys(plans).map((groupKey) => {
                            const [sublevel, groupName] = groupKey.split("-");
                            return (
                                <div key={groupKey}>
                                    <h3 className="text-2xl font-bold text-blue-600 text-center mb-4">
                                        สร้างแผนการเรียน {sublevel} ก.{plans[groupKey][0]?.group_name || ""}
                                        {plans[groupKey][0]?.sublevel && (
                                            <>
                                                {" "}จำนวนภาคเรียนปกติ {plans[groupKey][0]?.term || 0}
                                            </>
                                        )}
                                    </h3>
    
                                    {plans[groupKey].map((plan) => {
                                        if (!plan.sublevel) {
                                            // กรณีเป็นภาคเรียนฤดูร้อน: แสดงปุ่มและตารางเพียงตารางเดียว
                                            return (
                                                <div key={plan.infoid} className="mb-6">
                                                    <div className="flex flex-col items-center justify-between">
                                                        <div className="flex w-full justify-between">
                                                            <p className="text-lg font-semibold text-gray-700">
                                                                ปีการศึกษา {plan.summer} กลุ่ม {plan.group_name}
                                                            </p>
                                                            <button
                                                                onClick={() => handleAddSubject(plan.infoid, plan.planid, "summer", plan.summer)}
                                                                className="flex items-center gap-6 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                                                            >
                                                                <span className="font-medium">+ เพิ่มรายวิชาภาคเรียนฤดูร้อน</span>
                                                            </button>
                                                        </div>
                                                        <div className="w-full overflow-x-auto mt-2">
                                                            <table className="w-full border-collapse border border-gray-300">
                                                                <thead>
                                                                    <tr className="bg-gray-200">
                                                                        <th className="border border-gray-300 p-2 w-[150px]">รหัสวิชา</th>
                                                                        <th className="border border-gray-300 p-2 w-[300px]">ชื่อวิชา</th>
                                                                        <th className="border border-gray-300 p-2 w-[150px]">ท-ป-น</th>
                                                                        <th className="border border-gray-300 p-2 w-[100px]">จัดการ</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                {subjects[plan.infoid] && subjects[plan.infoid]["summer"] && subjects[plan.infoid]["summer"].length > 0 ? (
                                                                    subjects[plan.infoid]["summer"].map((subject) => (
                                                                        <tr key={subject.subject_id} className="text-center">
                                                                            <td className="border border-gray-300 p-2 w-[150px]">{subject.course_code}</td>
                                                                            <td className="border border-gray-300 p-2 w-[300px]">{subject.course_name}</td>
                                                                            <td className="border border-gray-300 p-2 w-[150px]">{subject.theory}-{subject.comply}-{subject.credit}</td>
                                                                            <td className="border border-gray-300 p-2 w-[100px] text-center">
                                                                                <button
                                                                                    onClick={() => handleDeleteSubject(subject.courseid, plan.infoid, "summer")}
                                                                                    className="bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 cursor-pointer transition duration-300 ease-in-out justify-center"
                                                                                >
                                                                                    <Trash2 size={16}/>
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
                                                </div>
                                            );
                                        }
    
                                        // กรณีมี sublevel (ภาคเรียนปกติ)
                                        const terms = plan.subterm.split("-").map(term => term.trim());
                                        return (
                                            <div key={plan.infoid} className="mb-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-lg font-semibold text-gray-700">
                                                        - ภาคเรียนที่ {plan.subterm} ปีการศึกษา {plan.year}
                                                    </p>
                                                    <div className="flex gap-2 items-center">
                                                        <span className="text-lg font-semibold text-gray-700">เพิ่มรายวิชา:</span>
                                                        {terms.map(term => (
                                                            
                                                            <button
                                                                key={`${plan.infoid}-term-${term}`}
                                                                onClick={() => handleAddSubject(plan.infoid, plan.planid, term, plan.year,plan.sublevel)}
                                                                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                                                            >
                                                                <span className="font-medium">+ ภาคเรียนที่ {term}</span>
                                                            </button>
                                                        ))}
                                                    </div>
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
                                                                        <th className="border border-gray-300 p-2 w-[100px]">จัดการ</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                {subjects[plan.infoid] && subjects[plan.infoid][term] && subjects[plan.infoid][term].length > 0 ? (
                                                                    subjects[plan.infoid][term].map((subject) => (
                                                                        <tr key={subject.subject_id} className="text-center">
                                                                            <td className="border border-gray-300 p-2 w-[150px]">{subject.course_code}</td>
                                                                            <td className="border border-gray-300 p-2 w-[300px]">{subject.course_name}</td>
                                                                            <td className="border border-gray-300 p-2 w-[150px]">{subject.theory}-{subject.comply}-{subject.credit}</td>
                                                                            <td className="border border-gray-300 p-2 w-[100px] text-center">
                                                                                <button
                                                                                    onClick={() => handleDeleteSubject(subject.courseid, plan.infoid, term)}
                                                                                    className="bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 cursor-pointer transition duration-300 ease-in-out justify-center"
                                                                                >
                                                                                    <Trash2 size={16} />
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
                    <p>ไม่พบแผนการเรียนสำหรับข้อมูลนี้</p>
                )}
            </div>
        </div>
    );
};

export default Plans;
