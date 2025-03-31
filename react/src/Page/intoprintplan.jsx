import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sidebar";
import { Group } from "lucide-react";

const intoprintplan = () => {
    const [plans, setPlans] = useState([]);
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        axios.get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php`)
            .then(response => {
                // เรียงลำดับข้อมูลก่อนแสดงผล
                const sortedPlans = response.data.sort((a, b) => {
                    // เรียงปีการศึกษาจากมากไปน้อย
                    if (b.year !== a.year) {
                        return b.year - a.year;
                    }
                    // เรียงกลุ่มจากน้อยไปมาก
                    return a.group - b.group;
                });

                setPlans(sortedPlans);
            })
            .catch(error => {
                console.error("Error fetching study plans:", error);
            });
    }, []);

    return (
        <div className="flex min-h-screen ">
            <Sidebar />
            <div className="ml-65 container mx-auto p-6">
                <h2 className="text-center text-3xl font-bold mb-6">พิมพ์แผนการเรียน</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map(plan => (
                        <div key={plan.planid} 
                            className="bg-white shadow-lg p-6 rounded-xl cursor-pointer hover:bg-blue-200 transition-all"
                            onClick={() => navigate(
                                `/printplan?planid=${plan.planid}&course=${encodeURIComponent(plan.course)}&year=${plan.year}&student_id=${plan.student_id}`
                              )}>
                            <h3 className="text-xl font-semibold text-blue-600 mb-2">{plan.course}</h3>
                            <p className="text-gray-700">ปีการศึกษา: {plan.year} รหัส: {plan.student_id} </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default intoprintplan;
