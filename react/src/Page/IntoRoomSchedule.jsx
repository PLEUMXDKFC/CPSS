import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, School, Monitor, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function IntoRoomSchedule() {
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${API_BASE_URL}/server/api/GET/get_rooms.php`)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setRooms(res.data);
                } else {
                    setRooms([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching rooms:", err);
                setError("ไม่สามารถดึงข้อมูลห้องเรียนได้");
                setLoading(false);
            });
    }, [API_BASE_URL]);

    // กรองข้อมูลตามคำค้นหา (ชื่อห้อง หรือ ประเภทห้อง)
    const filteredRooms = rooms.filter((room) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
            (room.room_name || "").toLowerCase().includes(lowerSearch) ||
            (room.room_type || "").toLowerCase().includes(lowerSearch)
        );
    });

    const handleSelectRoom = (room) => {
        navigate(`/RoomYearSchedule`, { state: { room } });
    };

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <div className="flex-1 p-8 ml-64">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <School className="text-blue-600 w-10 h-10" />
                        ตารางการใช้ห้อง
                    </h1>
                    <p className="text-gray-500 mt-2">เลือกห้องเรียนเพื่อดูตารางสอน</p>
                </header>

                <div className="mb-8 relative max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all duration-200"
                        placeholder="ค้นหาห้องเรียน..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : error ? (
                    <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRooms.length > 0 ? (
                            filteredRooms.map((room) => (
                                <div
                                    key={room.room_id}
                                    onClick={() => handleSelectRoom(room)}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group overflow-hidden relative"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top"></div>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                 {room.room_type?.includes("ปฏิบัติ") ? (
                                                    <Monitor className="w-6 h-6 text-blue-600" />
                                                ) : (
                                                    <MapPin className="w-6 h-6 text-blue-600" />
                                                )}
                                            </div>
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                                {room.room_id}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                                            {room.room_name}
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <School className="w-3 h-3" />
                                            {room.room_type || "-"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">ไม่พบข้อมูลห้องเรียนที่ค้นหา</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default IntoRoomSchedule;
