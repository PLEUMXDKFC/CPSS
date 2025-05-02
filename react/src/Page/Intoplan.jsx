import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sidebar";
import { ArrowLeft} from "lucide-react"; 

const StudyPlans = () => {
    const [plans, setPlans] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const studentId = searchParams.get("student_id");
    const course = searchParams.get("course");
    const year = searchParams.get("year");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        axios.get(`${API_BASE_URL}/server/api/GET/Get_group_information.php`)
            .then(response => {
                const data = response.data;

                // กรองเฉพาะแผนของ student_id ที่ต้องการ
                const filtered = data.filter(plan => plan.student_id === studentId);

                const normal = filtered.filter(p => p.summer === null);
                const summer = filtered.filter(p => p.summer !== null);

                summer.forEach(summerPlan => {
                    const matchedNormal = normal.find(n => n.year === summerPlan.summer);
                    if (matchedNormal) {
                        summerPlan.sublevel = matchedNormal.sublevel;
                    }
                });

                const sortedPlans = [...normal, ...summer];
                setPlans(sortedPlans);
            })
            .catch(error => {
                console.error("Error fetching study plans:", error);
            });
    }, [studentId]);

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
                <h2 className="text-center text-3xl font-bold mb-6">สร้างแผนการเรียน</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {plans.map(plan => (
                        <div key={plan.infoid}
                            className="bg-white shadow-lg p-6 rounded-xl cursor-pointer hover:bg-blue-200 transition-all"
                            onClick={() => navigate(`/plan/${plan.infoid}`, { state: plan })}
                        >
                            {plan.summer === null ? (
                                <div>
                                    <h3 className="text-xl font-semibold text-blue-600 mb-2">
                                        ระดับชั้น: {plan.sublevel}  ก.{plan.group_name}
                                    </h3>
                                    <p className="text-gray-700">
                                        ปีการศึกษา: {plan.year} จำนวนภาคเรียนปกติ: {plan.term} เทอม
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-xl font-semibold text-blue-600 mb-2">
                                        ระดับชั้น: {plan.sublevel} ก.{plan.group_name} ภาคเรียนฤดูร้อน
                                    </h3>
                                    <p className="text-gray-700">
                                        ปีการศึกษา {plan.summer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudyPlans;
