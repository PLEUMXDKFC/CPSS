import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ArrowLeft, AlertTriangle, Users, DoorOpen, CheckCircle, XCircle } from "lucide-react";
import Swal from "sweetalert2";

function EmptyPage() {
    const navigate = useNavigate();

    // ข้อมูลตัวอย่างห้องเรียน
    const [classrooms] = useState([
        { id: 1, name: "ปวช.1/1", capacity: 30, currentStudents: 30, status: "เต็ม" },
        { id: 2, name: "ปวช.1/2", capacity: 20, currentStudents: 20, status: "เต็ม" },
        { id: 3, name: "ปวช.1/3", capacity: 30, currentStudents: 35, status: "เกินความจุ" },
    ]);

    const handleBack = () => {
        navigate(-1);
    };

    const checkCapacity = (classroom) => {
        if (classroom.currentStudents > classroom.capacity) {
            Swal.fire({
                icon: "error",
                title: "เกินความจุ!",
                html: `
                    <p class="text-lg"><strong>${classroom.name}</strong></p>
                    <p class="mt-2">ความจุสูงสุด: <strong>${classroom.capacity}</strong> คน</p>
                    <p>จำนวนผู้เรียนปัจจุบัน: <strong class="text-red-600">${classroom.currentStudents}</strong> คน</p>
                    <p class="mt-2 text-red-600">⚠️ เกินความจุ <strong>${classroom.currentStudents - classroom.capacity}</strong> คน</p>
                `,
                confirmButtonColor: "#d33",
            });
        } else if (classroom.currentStudents === classroom.capacity) {
            Swal.fire({
                icon: "warning",
                title: "ห้องเต็ม",
                html: `
                    <p class="text-lg"><strong>${classroom.name}</strong></p>
                    <p class="mt-2">ความจุสูงสุด: <strong>${classroom.capacity}</strong> คน</p>
                    <p>จำนวนผู้เรียนปัจจุบัน: <strong class="text-yellow-600">${classroom.currentStudents}</strong> คน</p>
                    <p class="mt-2 text-yellow-600">⚠️ ห้องเต็มพอดี ไม่สามารถรับผู้เรียนเพิ่มได้</p>
                `,
                confirmButtonColor: "#f59e0b",
            });
        } else {
            Swal.fire({
                icon: "success",
                title: "ปกติ",
                html: `
                    <p class="text-lg"><strong>${classroom.name}</strong></p>
                    <p class="mt-2">ความจุสูงสุด: <strong>${classroom.capacity}</strong> คน</p>
                    <p>จำนวนผู้เรียนปัจจุบัน: <strong class="text-green-600">${classroom.currentStudents}</strong> คน</p>
                    <p class="mt-2 text-green-600">✅ เหลือที่ว่าง <strong>${classroom.capacity - classroom.currentStudents}</strong> คน</p>
                `,
                confirmButtonColor: "#10b981",
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "เกินความจุ":
                return "bg-red-100 text-red-800 border-red-300";
            case "เต็ม":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            default:
                return "bg-green-100 text-green-800 border-green-300";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "เกินความจุ":
                return <XCircle className="text-red-600" size={20} />;
            case "เต็ม":
                return <AlertTriangle className="text-yellow-600" size={20} />;
            default:
                return <CheckCircle className="text-green-600" size={20} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="ml-64 container mx-auto p-6">
                {/* ปุ่มย้อนกลับ */}
                <button
                    onClick={handleBack}
                    className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">ย้อนกลับ</span>
                </button>

                {/* หัวข้อหลัก */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
                        ระบบตรวจสอบและแจ้งเตือนความจุห้องเรียน
                    </h1>
                    <p className="text-center text-gray-600 text-lg">
                        ระบบสามารถตรวจสอบและแจ้งเตือนทันที หากจำนวนผู้เรียนเกินความจุห้องเรียนที่กำหนด
                    </p>
                </div>

                {/* สถิติรวม */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="text-green-600" size={32} />
                            <h3 className="text-xl font-bold text-green-800">ห้องปกติ</h3>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            {classrooms.filter(c => c.status === "ปกติ").length} ห้อง
                        </p>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="text-yellow-600" size={32} />
                            <h3 className="text-xl font-bold text-yellow-800">ห้องเต็ม</h3>
                        </div>
                        <p className="text-3xl font-bold text-yellow-600">
                            {classrooms.filter(c => c.status === "เต็ม").length} ห้อง
                        </p>
                    </div>

                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <XCircle className="text-red-600" size={32} />
                            <h3 className="text-xl font-bold text-red-800">เกินความจุ</h3>
                        </div>
                        <p className="text-3xl font-bold text-red-600">
                            {classrooms.filter(c => c.status === "เกินความจุ").length} ห้อง
                        </p>
                    </div>
                </div>

                {/* ตารางข้อมูลห้องเรียน */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-blue-600 text-white p-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <DoorOpen size={28} />
                            รายการห้องเรียนทั้งหมด
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-300">
                                    <th className="p-4 text-left font-bold text-gray-700">ชื่อห้อง</th>
                                    <th className="p-4 text-center font-bold text-gray-700">
                                        <div className="flex items-center justify-center gap-2">
                                            <DoorOpen size={18} />
                                            ความจุสูงสุด
                                        </div>
                                    </th>
                                    <th className="p-4 text-center font-bold text-gray-700">
                                        <div className="flex items-center justify-center gap-2">
                                            <Users size={18} />
                                            จำนวนผู้เรียน
                                        </div>
                                    </th>
                                    <th className="p-4 text-center font-bold text-gray-700">ที่ว่าง/เกิน</th>
                                    <th className="p-4 text-center font-bold text-gray-700">สถานะ</th>
                                    <th className="p-4 text-center font-bold text-gray-700">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classrooms.map((classroom) => {
                                    const difference = classroom.capacity - classroom.currentStudents;
                                    return (
                                        <tr
                                            key={classroom.id}
                                            className="border-b hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="p-4 font-semibold text-gray-800">
                                                {classroom.name}
                                            </td>
                                            <td className="p-4 text-center text-gray-700">
                                                {classroom.capacity} คน
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`font-bold ${classroom.currentStudents > classroom.capacity
                                                        ? "text-red-600"
                                                        : classroom.currentStudents === classroom.capacity
                                                            ? "text-yellow-600"
                                                            : "text-green-600"
                                                    }`}>
                                                    {classroom.currentStudents} คน
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`font-bold ${difference < 0 ? "text-red-600" : "text-green-600"
                                                    }`}>
                                                    {difference >= 0 ? `+${difference}` : difference} คน
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 font-semibold ${getStatusColor(classroom.status)}`}>
                                                    {getStatusIcon(classroom.status)}
                                                    {classroom.status}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => checkCapacity(classroom)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all cursor-pointer shadow-md hover:shadow-lg"
                                                >
                                                    ตรวจสอบ
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* คำอธิบายเพิ่มเติม */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-6">
                    <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <AlertTriangle size={24} />
                        หมายเหตุ
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>✅ <strong className="text-green-600">สถานะปกติ</strong> : จำนวนผู้เรียนยังไม่เกินความจุ มีที่ว่างรับผู้เรียนเพิ่ม</li>
                        <li>⚠️ <strong className="text-yellow-600">สถานะเต็ม</strong> : จำนวนผู้เรียนเท่ากับความจุพอดี ไม่สามารถรับผู้เรียนเพิ่มได้</li>
                        <li>❌ <strong className="text-red-600">สถานะเกินความจุ</strong> : จำนวนผู้เรียนเกินความจุที่กำหนด ต้องดำเนินการแก้ไข</li>
                        <li>🔔 ระบบจะแจ้งเตือนอัตโนมัติเมื่อมีการเพิ่มผู้เรียนที่ทำให้เกินความจุ</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default EmptyPage;