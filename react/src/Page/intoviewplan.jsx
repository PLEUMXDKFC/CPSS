import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import axios from "axios";
import { Link } from "react-router-dom";
import Logo from "../img/logo.png";

const intocheckplan = () => {
    const [plans, setPlans] = useState([]);
    const [allPlans, setAllPlans] = useState([]);
    const [filteredPlans, setFilteredPlans] = useState([]);
    const [selectedCode, setSelectedCode] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        axios.get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php`)
            .then(response => {
                const data = response.data;

                if (data.length > 0) {
                    setAllPlans(data);
                    // กลุ่มข้อมูลตามชื่อ course
                    const groupedByCourse = data.reduce((acc, plan) => {
                        if (!acc[plan.course]) {
                            acc[plan.course] = [];
                        }
                        acc[plan.course].push(plan);
                        return acc;
                    }, {});

                    // สำหรับแต่ละกลุ่ม course, หาค่าที่ year และ student_id ล่าสุด
                    const latestPlans = Object.values(groupedByCourse).map(plansInCourse => {
                        return plansInCourse.sort((a, b) => {
                            if (b.year !== a.year) return b.year - a.year;
                            return b.student_id.localeCompare(a.student_id);
                        })[0]; // เลือกรายการแรกสุด
                    });

                    setPlans(latestPlans);
                    setFilteredPlans(latestPlans);
                } else {
                    setPlans([]);
                    setFilteredPlans([]);
                }
            })
            .catch(error => {
                console.error("Error fetching study plans:", error);
            });
    }, []);

    const handleSelectChange = (e) => {
        const selected = e.target.value;
        setSelectedCode(selected);

        if (selected === "") {
            setFilteredPlans(plans);
        } else {
            const filtered = allPlans.filter(
                (plan) => String(plan.student_id) === selected
            );
            setFilteredPlans(filtered);
        }
    };

    const uniqueStudentIds = [...new Set(allPlans.map((p) => p.student_id))].sort().reverse();

    return (
        <div className="flex min-h-screen ">
            <nav className="fixed top-0 w-full bg-white shadow-md z-50">
                <div className="flex justify-between items-center p-4">
                    <div className="flex items-center gap-3">
                        <img className="h-10" src={Logo} alt="Logo" />
                        <span className="text-xl font-bold">CTN PHRAE</span>
                    </div>

                    {/* Hamburger Button */}
                    <div className="md:hidden">
                        <button onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <HiX size={30} /> : <HiMenu size={30} />}
                        </button>
                    </div>

                    {/* Desktop Menu */}
                    <ul className="hidden md:flex gap-6 text-lg">
                        <li><Link to="/" className="hover:text-blue-600">หน้าหลัก</Link></li>
                        <li><Link to="/intoviewplan" className="text-blue-600 hover:text-blue-600">แผนการเรียน</Link></li>
                        <li><Link to="/LoginPage" className="hover:text-blue-600">เข้าสู่ระบบ</Link></li>
                    </ul>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden bg-white px-4 pb-4 shadow">
                        <ul className="flex flex-col gap-4 text-lg">
                            <li><Link to="/" onClick={() => setMenuOpen(false)}>หน้าหลัก</Link></li>
                            <li><Link to="/intoviewplan" onClick={() => setMenuOpen(false)}>แผนการเรียน</Link></li>
                            <li><Link to="/LoginPage" onClick={() => setMenuOpen(false)}>เข้าสู่ระบบ</Link></li>
                        </ul>
                    </div>
                )}
            </nav>
            <div className="container mx-auto px-4 py-6 mt-20">
                <h2 className="text-center text-2xl md:text-3xl font-bold mb-6">แผนการเรียน</h2>

                <div className="mb-6 text-center">
                    <label className="mr-2 font-semibold">ค้นหาตามรหัสปีการศึกษา:</label>
                    <select
                        value={selectedCode}
                        onChange={handleSelectChange}
                        className="border border-gray-400 rounded-lg px-3 py-2"
                    >
                        <option value="">-- แสดงทั้งหมด --</option>
                        {uniqueStudentIds.map((id) => (
                            <option key={id} value={id}>
                                รหัส {id}
                            </option>
                        ))}
                    </select>
                </div>

                {filteredPlans.length === 0 ? (
                    <div className="text-center text-gray-500 text-base md:text-lg mt-10 border border-gray-300 rounded-xl p-6 shadow-sm">
                        ไม่มีแผนการเรียนในระบบ
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {filteredPlans.map((plan) => (
                            <div
                                key={plan.planid}
                                className="bg-white shadow-md p-4 rounded-lg cursor-pointer hover:bg-blue-100 transition-all"
                                onClick={() =>
                                    navigate(
                                        `/view-plan?planid=${plan.planid}&course=${encodeURIComponent(plan.course)}&year=${plan.year}&student_id=${plan.student_id}`
                                    )
                                }
                            >
                                <h3 className="text-lg md:text-xl font-semibold text-blue-600 mb-2">
                                    {plan.course}
                                </h3>
                                <p className="text-sm md:text-base text-gray-700">
                                    พุทธศักราช: {plan.year} รหัส: {plan.student_id}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default intocheckplan;
