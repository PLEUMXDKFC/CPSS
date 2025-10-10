import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2 } from "lucide-react"; 
import Sidebar from "../components/sidebar";
import axios from "axios";

const StudyPlan = () => {
    const { planid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [planDetails, setPlanDetails] = useState(location.state || null);
    const [groupData, setGroupData] = useState([]); 

    useEffect(() => {
        // โหลดข้อมูลแผนการเรียน
        if (!planDetails) {
            axios.get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php?planid=${planid}`)
                .then(response => setPlanDetails(response.data))
                .catch(error => console.error("Error fetching plan details:", error));
        }

        // โหลดข้อมูลกลุ่มการเรียน
        axios.get(`${API_BASE_URL}/server/api/GET/group_information.php?planid=${planid}`)
            .then(response => setGroupData(response.data))
            .catch(error => console.error("Error fetching group information:", error));

    }, [planid]);

    if (!planDetails) {
        return <p className="text-center">Loading...</p>;
    }

    // ฟังก์ชันย้อนกลับ
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

                <h2 className="text-center text-3xl font-bold mb-6">
                    ข้อมูลกลุ่มการเรียน {planDetails.course} รหัส {planDetails.student_id}
                </h2>

                {/* ปุ่มเพิ่มข้อมูล */}
                <button 
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 
                    rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                    <span className="font-medium">เพิ่มข้อมูลกลุ่มการเรียนและปีการศึกษา</span>
                </button>

                {/* ตารางแสดงข้อมูลรายวิชา */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 p-2">รหัส</th>
                                <th className="border border-gray-300 p-2">ระดับชั้น</th>
                                <th className="border border-gray-300 p-2">กลุ่ม</th>
                                <th className="border border-gray-300 p-2">เทอม</th>
                                <th className="border border-gray-300 p-2">ภาคเรียนฤดูร้อน</th>
                                <th className="border border-gray-300 p-2">ปีภาคเรียนฤดูร้อน</th>
                                <th className="border border-gray-300 p-2">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupData.length > 0 ? (
                                groupData.map((group, index) => (
                                    <tr key={index} className="text-center">
                                        <td className="border border-gray-300 p-2">{group.infoid}</td>
                                        <td className="border border-gray-300 p-2">{group.sublevel}</td>
                                        <td className="border border-gray-300 p-2">{group.group_name}</td>
                                        <td className="border border-gray-300 p-2">{group.term}</td>
                                        <td className="border border-gray-300 p-2">{group.summer}</td>
                                        <td className="border border-gray-300 p-2">{group.start_year}/{group.end_year}</td>
                                        <td className="border border-gray-300 p-2 text-center">
                                            <div className="flex space-x-1 justify-center">
                                                <button 
                                                    onClick={() => navigate(`/edit-group/${group.infoid}`)}
                                                    className="bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2"
                                                >
                                                    <Edit size={16} /> แก้ไข
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(group.infoid)}
                                                    className="bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2"
                                                >
                                                    <Trash2 size={16} /> ลบ
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center p-4 text-gray-500">ไม่มีข้อมูลกลุ่มการเรียน</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudyPlan;
