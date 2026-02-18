import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { Search, User, Briefcase, ChevronRight } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function IntoTeacherSchedule() {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_BASE_URL}/server/api/GET/get_teachers.php`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                setTeachers(data);
                setFilteredTeachers(data);
            })
            .catch((err) => console.error("Error fetching teachers:", err));
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = teachers.filter((t) =>
            `${t.fname} ${t.lname}`.toLowerCase().includes(query) ||
            t.teacher_id.toString().includes(query) ||
            (t.department && t.department.toLowerCase().includes(query))
        );
        setFilteredTeachers(filtered);
    };

    const handleSelectTeacher = (teacher) => {
        navigate("/TeacherYearSchedule", { state: { teacher } });
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <div className="flex-1 ml-64 p-8">
                <header className="mb-8 text-center pt-4">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">ตารางสอนครู</h2>
                    <p className="text-gray-500 text-lg">เลือกรายชื่อครูเพื่อดูตารางสอนรายบุคคล</p>
                </header>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-12 relative">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อครู, รหัส, หรือแผนก..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Teacher Grid */}
                {filteredTeachers.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 mx-auto max-w-2xl shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-gray-800 font-semibold text-lg mb-1">ไม่พบข้อมูลครูที่ค้นหา</h3>
                        <p className="text-gray-500">ลองตรวจสอบคำสะกดหรือค้นหาด้วยคำอื่น</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeachers.map((teacher) => (
                            <div
                                key={teacher.teacher_id}
                                onClick={() => handleSelectTeacher(teacher)}
                                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden flex flex-col relative min-h-[180px]"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                <div className="p-8 flex items-start gap-5">
                                    <div className="shrink-0 w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                                        <User size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h3 className="font-bold text-gray-800 text-lg truncate group-hover:text-blue-600 transition-colors">
                                            {teacher.prefix} {teacher.fname} {teacher.lname}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1.5">
                                            <Briefcase size={14} className="shrink-0" />
                                            <span className="truncate">{teacher.department || "ไม่ระบุแผนก"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-auto border-t border-gray-50 bg-gray-50/30 px-6 py-3 flex items-center justify-between group-hover:bg-blue-50/40 transition-colors">
                                    <div className="flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                                        ดูตาราง <ChevronRight className="w-3 h-3 ml-0.5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default IntoTeacherSchedule;
