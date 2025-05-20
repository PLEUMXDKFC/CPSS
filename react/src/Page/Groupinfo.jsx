import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Group, Trash2 } from "lucide-react"; 
import Sidebar from "../components/sidebar";
import axios from "axios";
import Groupinfoform from "../components/Groupinfoform";
import Swal from "sweetalert2";

const StudyPlan = () => {
    const { planid } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [planDetails, setPlanDetails] = useState(location.state || null);
    const [groupData, setGroupData] = useState([]); 
    
    // โหลดข้อมูลแผนการเรียน
    if (!planDetails) {
        axios.get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php?planid=${planid}`)
            .then(response => setPlanDetails(response.data))
            .catch(error => console.error("Error fetching plan details:", error));
    }
    useEffect(() => {
        fetchData();
    }, [planid]);


    const fetchData = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/server/api/GET/Getgroupforgroup.php?planid=${planid}`
            );
            setGroupData(response.data);
        } catch (error) {
            console.error("Error fetching group information:", error);
        }
    };
    
            
        const sublevelGroups = groupData.filter(group => group.sublevel !== null);
        const summerGroups = groupData.filter(group => group.sublevel === null && group.summer !== null);

        // รวมค่า summer จาก summerGroups เป็น string ด้วย " / "
        const summerString = summerGroups.map(item => item.summer).join(" / ");

        const handleEdit = (planid) => {
            Swal.fire({
                title: 'แก้ไขข้อมูล',
                html: `
                    <input id="summer" class="swal2-input" value="${summerString}" placeholder="กรุณากรอก Summer" />
                `,
                focusConfirm: false,
                preConfirm: () => {
                    const summer = document.getElementById('summer').value;
                    // เรียกฟังก์ชันที่ใช้บันทึกค่า summer ที่แก้ไขแล้ว
                    handleSaveSummer(planid, summer);
                },
            });
        };

        const handleSaveSummer = (planid, summer) => {
            // ฟังก์ชันบันทึกค่า summer ที่แก้ไขแล้ว
            // ส่งข้อมูลไปยัง server หรือทำอะไรก็ได้
            axios.post(`${API_BASE_URL}/server/api/UPDATE/updateSummer.php`, { planid, summer })
                .then(response => {
                    if (response.data.status === "success") {
                        Swal.fire('บันทึกสำเร็จ!', 'ข้อมูลถูกแก้ไขเรียบร้อย', 'success');
                        fetchData();  // รีเฟรชข้อมูล
                    } else {
                        Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
                    }
                })
                .catch(error => {
                    Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์', 'error');
                });
        };


        const handleDelete = async (planid, groupName) => {
            const result = await Swal.fire({
                title: 'คุณแน่ใจหรือไม่?',
                text: "คุณต้องการลบแผนการเรียนนี้หรือไม่?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'ใช่',
                cancelButtonText: 'ยกเลิก'
            });
        
            if (result.isConfirmed) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/server/api/DELETE/Delete_group_information.php`, {
                        params: {
                            planid: planid,
                            group_name: groupName,
                        }
                    });
                    console.log(response.data);
                    fetchData(); // โหลดข้อมูลใหม่หลังลบ
        
                    Swal.fire({
                        icon: "success",
                        title: "ลบข้อมูลสำเร็จ!",
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true
                    });
                } catch (error) {
                    console.error("Error deleting group information:", error);
                }
            }
        };
        
        
        

        const fetchSummerData = async (planid) => {
            try {
                const response = await axios.get(`${API_BASE_URL}/server/api/GET/Get_group_information.php?planid=${planid}`);
                const groupData = response.data;
               
                console.log("Data fetched from API:", groupData);
               
                // กรองข้อมูลที่มีค่า summer ที่ไม่เป็น null
                const filteredData = groupData.filter(group => group.summer !== null);
               
                console.log("Filtered data:", filteredData);
               
                // ถ้ามีข้อมูล summer ที่ไม่เป็น null ให้เรียก handleEditSummer เพื่อแสดง SweetAlert ให้แก้ไข
                if (filteredData.length > 0) {
                    handleEditSummer(filteredData);
                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'ไม่มีข้อมูลที่สามารถแก้ไขได้',
                        text: 'ไม่พบข้อมูล summer ที่สามารถแก้ไขได้',
                    });
                }
            } catch (error) {
                console.error('Error fetching summer data:', error);
            }
        };
       
        
        
        const handleEditSummer = (filteredData) => {
            const initialValues = filteredData.map(group => group.summer);
            
            Swal.fire({
                title: 'แก้ไขข้อมูล Summer',
                html: filteredData.map((group, index) => `
                    <div>
                        <label>ปีภาคเรียนฤดูร้อน ${index + 1}</label>
                        <input id="summer-${group.infoid}" type="text" value="${initialValues[index]}" class="swal2-input">
                    </div>
                `).join(''),
                focusConfirm: false,
                preConfirm: () => {
                    const updatedSummer = filteredData.map(group => {
                        const summerInput = document.getElementById(`summer-${group.infoid}`).value;
                        return {
                            infoid: group.infoid,
                            planid: group.planid,
                            summer: summerInput
                        };
                    });
                    return updatedSummer;
                },
                showCancelButton: true,
                confirmButtonText: 'บันทึก',
                cancelButtonText: 'ยกเลิก',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const updatedSummerData = result.value;
                    try {
                        const response = await axios.post(`${API_BASE_URL}/server/api/UPDATE/updateSummer.php`, {
                            summerData: updatedSummerData
                        });
                
                        if (response.data && response.data.status && response.data.status.trim() === 'success') {
                            Swal.fire({
                                icon: 'success',
                                title: 'แก้ไขข้อมูลสำเร็จ!',
                                timer: 2000,
                                showConfirmButton: false,
                                timerProgressBar: true
                            });
                            // รีเฟรชข้อมูลใน UI โดยเรียก fetchSummerData ใหม่ (ถ้าต้องการ)
                            // fetchSummerData(filteredData[0].planid);
                            fetchData();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'เกิดข้อผิดพลาด',
                                text: response.data.message,
                            });
                        }
                
                    } catch (error) {
                        console.error('Error updating summer data:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: 'ไม่สามารถบันทึกข้อมูลได้',
                        });
                    }
                }
            });
        };
        
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
            <div className="ml-65 container mx-auto p-6">
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

                <Groupinfoform fetchData={fetchData}/>

                {/* ตารางแสดงข้อมูลรายวิชา */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 p-2">รหัส</th>
                                <th className="border border-gray-300 p-2">ระดับชั้น</th>
                                <th className="border border-gray-300 p-2">กลุ่ม</th>
                                <th className="border border-gray-300 p-2">เทอม</th>
                                <th className="border border-gray-300 p-2">ปีภาคเรียนฤดูร้อน</th>
                                <th className="border border-gray-300 p-2">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                        {sublevelGroups.length > 0 ? (
                            sublevelGroups.map((group, index) => (
                                <tr key={index} className="text-center">
                                <td className="border border-gray-300 p-2">{planDetails.student_id}</td>
                                <td className="border border-gray-300 p-2">{group.sublevel}</td>
                                <td className="border border-gray-300 p-2">{group.group_name}</td>
                                <td className="border border-gray-300 p-2">{group.term}</td>
                                {/* ใช้ summerString ที่คำนวณไว้ */}
                                <td className="border border-gray-300 p-2">{summerString}</td>
                                <td className="border border-gray-300 p-2 text-center">
                                    <div className="flex space-x-1 justify-center">
                                    <button 
                                        onClick={() => fetchSummerData(group.planid)} // เรียกใช้ฟังก์ชันดึงข้อมูล
                                        className="bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600 cursor-pointer transition duration-300 ease-in-out flex items-center gap-x-2"
                                    >
                                        <Edit size={16} /> แก้ไข Summer
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(planid, group.group_name)}
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
                                <td colSpan="7" className="text-center p-4 text-gray-500">
                                ไม่มีข้อมูลกลุ่มการเรียน
                                </td>
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
