import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { ArrowLeft } from "lucide-react";

const StudyPlans = () => {
    const [plans, setPlans] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const studentId = searchParams.get("student_id");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        console.log("Fetching plans for Student ID:", studentId);
        axios.get(`${API_BASE_URL}/server/api/GET/Get_group_information.php`)
            .then(response => {
                const data = Array.isArray(response.data) ? response.data : [];
                console.log("All Plans Data:", data);

                const filtered = data.filter(plan => String(plan.student_id) === String(studentId));
                console.log("Filtered Plans:", filtered);

                const groupedBySublevel = {};

                filtered.forEach(plan => {
                    const level = plan.sublevel;
                    const group = plan.group_name;
                    if (!groupedBySublevel[level]) {
                        groupedBySublevel[level] = {};
                    }
                    if (!groupedBySublevel[level][group]) {
                        groupedBySublevel[level][group] = [];
                    }
                    groupedBySublevel[level][group].push(plan);
                });

                const orderedLevels = [
                    "ปวช.1", "ปวช.2", "ปวช.3",
                    "ปวส.1", "ปวส.2",
                    "ปวส.1 ม.6", "ปวส.2 ม.6"
                ];

                const finalGrouped = orderedLevels
                    .filter(level => groupedBySublevel[level])
                    .map(level => ({
                        level,
                        groups: Object.entries(groupedBySublevel[level])
                            .sort(([a], [b]) => parseInt(a) - parseInt(b))
                            .map(([group, plans]) => {
                                // NO FILTERING - SHOW ALL LIKE TEACHER GROUP SCHEDULE
                                const filteredPlans = plans;

                                return {
                                    group,
                                    plans: filteredPlans.sort((a, b) => {
                                        const aIsSummer = a.summer !== null;
                                        const bIsSummer = b.summer !== null;

                                        if (a.year !== b.year) {
                                            return a.year - b.year;
                                        }

                                        if (aIsSummer !== bIsSummer) {
                                            return aIsSummer ? 1 : -1;
                                        }

                                        return a.term - b.term;
                                    })
                                };
                            })
                        // .filter(g => g.plans.length > 0) // Keep groups even if empty? No, filteredPlans is plans.
                    }))
                    .filter(l => l.groups.length > 0);

                console.log("Final Grouped:", finalGrouped);
                setPlans(finalGrouped);
            })
            .catch(error => {
                console.error("Error fetching study plans:", error);
            });
    }, [studentId]);

    const handleBack = () => {
        navigate(-1);
    };

    const getTerms = (plan) => {
        const level = plan.sublevel || "";
        if (level.includes("ปวช.1") || level.includes("ปวส.1")) return ["1", "2"];
        if (level.includes("ปวช.2") || level.includes("ปวส.2")) return ["3", "4"];
        if (level.includes("ปวช.3")) return ["5", "6"];
        return ["1", "2"];
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="ml-65 container mx-auto p-6">
                <button
                    onClick={handleBack}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 
                    rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">ย้อนกลับ</span>
                </button>

                <h2 className="text-center text-3xl font-bold mb-6">ตารางเรียนย้อนหลัง</h2>

                {plans.length === 0 ? (
                    <div className="text-center text-gray-600 mt-10">
                        <p className="text-lg">ยังไม่มีกลุ่มการเรียนในแผนการเรียนนี้</p>
                    </div>
                ) : (
                    plans.map(({ level, groups }) => (
                        <div key={level} className="mb-10">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-1">{level}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groups.map(({ group, plans }) => (
                                    <div key={group}>
                                        <h4 className="text-xl font-semibold text-gray-700 mb-2">กลุ่ม ก.{group}</h4>
                                        {plans.map(plan => (
                                            <div
                                                key={plan.infoid}
                                                className="bg-white shadow-md rounded-xl p-4 mb-4 hover:bg-blue-100 transition cursor-pointer"
                                                onClick={() => navigate(`/HistoryTable/${plan.planid}`, {
                                                    state: { ...plan, terms: getTerms(plan) }
                                                })}
                                            >
                                                <p className="text-blue-600 font-medium">
                                                    {plan.summer ? "ภาคฤดูร้อน" : `ภาคเรียนปกติ ${plan.term} เทอม`}
                                                </p>
                                                <p className="text-gray-700">
                                                    ปีการศึกษา: {plan.year}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudyPlans;
