import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sidebar";
import { ArrowLeft } from "lucide-react";

function List_of_subject() {
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
                const filtered = data.filter(plan => plan.student_id === studentId);

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
                            .sort(([a], [b]) => parseInt(a) - parseInt(b)) // เรียงกลุ่ม ก.1, ก.2, ...
                            .map(([group, plans]) => ({
                                group,
                                plans: plans.sort((a, b) => {
                                    const aIsSummer = a.summer !== null;
                                    const bIsSummer = b.summer !== null;

                                    if (a.year !== b.year) {
                                        return a.year - b.year;
                                    }

                                    // ให้ภาคเรียนปกติมาก่อนฤดูร้อน
                                    if (aIsSummer !== bIsSummer) {
                                        return aIsSummer ? 1 : -1;
                                    }

                                    return 0;
                                })
                            }))
                    }));

                setPlans(finalGrouped);
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

                <h2 className="text-center text-3xl font-bold mb-6">รายวิชาจากแผนการเรียน</h2>

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
                                            onClick={() => navigate(`/In_list_of_subject/${plan.infoid}`, { state: plan })}
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
}

export default List_of_subject