import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sidebar";

const StudyPlans = () => {
    const [plans, setPlans] = useState([]);
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        axios.get(`${API_BASE_URL}/server/api/GET/Get_group_information.php`)
            .then(response => {
                const data = response.data;
    
                // จัดกลุ่ม plan ตาม planid
                const groupedPlans = data.reduce((acc, plan) => {
                    const key = plan.planid;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(plan);
                    return acc;
                }, {});
    
                const sortedPlans = [];
    
                Object.values(groupedPlans).forEach(group => {
                    // แยกปกติและฤดูร้อนใน group เดียวกัน
                    const normal = group.filter(p => p.summer === null);
                    const summer = group.filter(p => p.summer !== null);
    
                    // เติม sublevel ให้ภาคฤดูร้อน
                    summer.forEach(summerPlan => {
                        const matchedNormal = normal.find(n => n.year === summerPlan.summer);
                        if (matchedNormal) {
                            summerPlan.sublevel = matchedNormal.sublevel;
                        }
                    });
    
                    // เพิ่มภาคปกติก่อน ตามด้วยฤดูร้อน
                    sortedPlans.push(...normal, ...summer);
                });
    
                setPlans(sortedPlans);
            })
            .catch(error => {
                console.error("Error fetching study plans:", error);
            });
    }, []);
    

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="ml-65 container mx-auto p-6">
                <h2 className="text-center text-3xl font-bold mb-6">สร้างแผนการเรียน</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map(plan => (
                        <div key={plan.infoid} 
                            className="bg-white shadow-lg p-6 rounded-xl cursor-pointer hover:bg-blue-200 transition-all"
                            onClick={() => navigate(`/plan/${plan.infoid}`, { state: plan })}>
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
