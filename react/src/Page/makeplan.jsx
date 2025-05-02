import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sidebar";

const makeplan = () => {
    const [plans, setPlans] = useState([]);
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        axios.get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php`)
            .then(response => {
                const sortedPlans = response.data.sort((a, b) => {
                    if (b.year !== a.year) {
                        return b.year - a.year;
                    }
                    return a.group - b.group;
                });
    
                // กรองให้แสดงเฉพาะรหัสที่ไม่ซ้ำกัน
                const uniquePlans = [];
                const seenStudentIds = new Set();
    
                for (const plan of sortedPlans) {
                    if (!seenStudentIds.has(plan.student_id)) {
                        seenStudentIds.add(plan.student_id);
                        uniquePlans.push(plan);
                    }
                }
    
                setPlans(uniquePlans);
            })
            .catch(error => {
                console.error("Error fetching study plans:", error);
            });
    }, []);
    

    return (
        <div className="flex min-h-screen ">
            <Sidebar />
            <div className="ml-65 container mx-auto p-6">
                <h2 className="text-center text-3xl font-bold mb-6">แผนการเรียน </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map(plan => (
                        <div key={plan.planid} 
                            className="bg-white shadow-lg p-6 rounded-xl cursor-pointer hover:bg-blue-200 transition-all"
                            onClick={() =>
                                navigate(`/intoplan?planid=${plan.planid}&course=${plan.course}&year=${plan.year}&student_id=${plan.student_id}`)
                              }                              
                            >
                            <h3 className="text-xl font-semibold text-blue-600 mb-2">แผนการเรียน รหัส: {plan.student_id}</h3>
                            <p className="text-gray-700">พุทธศักราช: {plan.year}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default makeplan;
