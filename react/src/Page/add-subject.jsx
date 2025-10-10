import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/sidebar";
import { ArrowLeft } from "lucide-react";

const Plansubject = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const term = queryParams.get("term");
    const year = queryParams.get("year");
    const planid = queryParams.get("planid");
    const infoid = queryParams.get("infoid");

    const [subjects, setSubjects] = useState({});
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (planid && infoid) {
            const url = `${API_BASE_URL}/server/api/GET/subjectinfo.php?planid=${planid}&infoid=${infoid}`;

            axios.get(url)
                .then(response => {
                    setSubjects(response.data);
                    setError(null);
                })
                .catch(error => {
                    console.error("Error fetching subjects:", error);
                    setError("ไม่สามารถโหลดข้อมูลรายวิชาได้");
                });
        }
    }, [planid, infoid]);

    const handleCheckboxChange = (subject_id) => {
        setSelectedSubjects((prev) =>
            prev.includes(subject_id)
                ? prev.filter((id) => id !== subject_id)
                : [...prev, subject_id]
        );
    };

    const clearSelection = () => {
        Swal.fire({
            title: "แน่ใจหรือไม่?",
            text: "คุณต้องการล้างการเลือกทั้งหมดหรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "ใช่, ล้างเลย!",
            cancelButtonText: "ยกเลิก",
        }).then((result) => {
            if (result.isConfirmed) {
                setSelectedSubjects([]);
                Swal.fire("ล้างสำเร็จ!", "ล้างรายวิชาที่เลือกเรียบร้อยแล้ว", "success");
            }
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleConfirmSelection = async () => {
        if (selectedSubjects.length === 0) return;
    
        const infoid = parseInt(queryParams.get("infoid"), 10);
        const planid = queryParams.get("planid");
        const term = queryParams.get("term"); // ✅ เพิ่มค่า term
    
        if (!infoid || !planid || !year || !term) {
            Swal.fire("เกิดข้อผิดพลาด", "ข้อมูลไม่ครบถ้วน", "error");
            return;
        }
    
        const requestData = { planid, year, term, subjects: selectedSubjects };
    
        try {
            const response = await axios.post(
                `${API_BASE_URL}/server/api/POST/insertcourse.php?infoid=${infoid}`,
                requestData
            );
    
            if (response.data.error) {
                Swal.fire("เกิดข้อผิดพลาด", response.data.error, "error");
            } else {
                Swal.fire("บันทึกข้อมูลสำเร็จ!", `เพิ่ม ${selectedSubjects.length} วิชาเรียบร้อยแล้ว`, "success");
    
                setSubjects((prevSubjects) => {
                    const newSubjects = { ...prevSubjects };
    
                    for (const category in newSubjects) {
                        for (const group in newSubjects[category]) {
                            newSubjects[category][group] = newSubjects[category][group].filter(
                                (subject) => !selectedSubjects.includes(subject.subject_id)
                            );
                        }
                    }
    
                    return newSubjects;
                });
    
                setSelectedSubjects([]);
            }
        } catch (error) {
            console.error("❌ เกิดข้อผิดพลาด:", error.response ? error.response.data : error.message);
            Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่", "error");
        }
    };
    

    const categoryMap = {
        "1.หมวดวิชาสมรรถนะแกนกลาง": [
            "1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร",
            "1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา",
            "1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"
        ],
        "รายวิชาปรับพื้นฐาน": [], // ✅ เพิ่มหมวดนี้
        "2.หมวดวิชาสมรรถนะวิชาชีพ": [
            "2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน",
            "2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"
        ],
        "3.หมวดวิชาเลือกเสรี": [],
        "4.กิจกรรมเสริมหลักสูตร": []
    };
    

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="ml-64 container mx-auto p-4">
                <button onClick={handleBack} className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <ArrowLeft size={20} />
                    <span className="font-medium">ย้อนกลับ</span>
                </button>
                <h2 className="text-center text-3xl font-bold mb-6 ">
                    เพิ่มรายวิชาภาคเรียนที่ {term} ปีการศึกษา {year}
                </h2>

                {error && <p className="text-red-500">{error}</p>}
                {Object.keys(categoryMap).map((category) => (
    <div key={category}>
        <p className="text-left text-xl font-bold mt-4">{category}</p>

        {categoryMap[category].length > 0 ? (
            categoryMap[category].map((group) => (
                <div key={group}>
                    <p className="text-left text-lg mt-2">{group}</p>
                    {subjects[category] && subjects[category][group] ? (
                        <table className="w-260 table-fixed border-collapse border border-gray-300 mt-2">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border p-2">รหัสวิชา</th>
                                    <th className="border p-2">ชื่อวิชา</th>
                                    <th className="border p-2">ท-ป-น</th>
                                    <th className="border p-2">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects[category][group].map((subject) => (
                                    <tr key={subject.subject_id} className="border text-center">
                                        <td className="border p-2">{subject.course_code}</td>
                                        <td className="border p-2">{subject.course_name}</td>
                                        <td className="border p-2">{subject.theory}-{subject.comply}-{subject.credit}</td>
                                        <td className="border p-2 text-center">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 accent-blue-500 cursor-pointer" 
                                                checked={selectedSubjects.includes(subject.subject_id)} 
                                                onChange={() => handleCheckboxChange(subject.subject_id)} 
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="text-center text-gray-500 text-md mr-52">ไม่มีข้อมูลรายวิชาในกลุ่มนี้</p>}
                </div>
            ))
        ) : (
            subjects[category] && Object.keys(subjects[category]).length > 0 ? (
                <table className="w-260 table-fixed border-collapse border border-gray-300 mt-2">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border p-2">รหัสวิชา</th>
                            <th className="border p-2">ชื่อวิชา</th>
                            <th className="border p-2">ท-ป-น</th>
                            <th className="border p-2">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(subjects[category]).flat().map((subject) => (
                            <tr key={subject.subject_id} className="border text-center">
                                <td className="border p-2">{subject.course_code}</td>
                                <td className="border p-2">{subject.course_name}</td>
                                <td className="border p-2">{subject.theory}-{subject.comply}-{subject.credit}</td>
                                <td className="border p-2 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 accent-blue-500 cursor-pointer" 
                                        checked={selectedSubjects.includes(subject.subject_id)} 
                                        onChange={() => handleCheckboxChange(subject.subject_id)} 
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p className="text-center text-gray-500 text-md mr-52">ไม่มีรายวิชาข้อมูลในหมวดนี้</p>
        )}
    </div>
))}
                {selectedSubjects.length > 0 && (
                    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg p-4 rounded-lg border border-gray-300 flex gap-4">
                        
                        <button
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 cursor-pointer transition-all"
                            onClick={handleConfirmSelection}
                        >
                            ยืนยัน ({selectedSubjects.length} วิชา)
                        </button>
                        <button
                            className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 cursor-pointer transition-all"
                            onClick={clearSelection} // ✅ ใช้ SweetAlert ยืนยันก่อนล้าง
                        >
                            ล้างการเลือก
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Plansubject; 