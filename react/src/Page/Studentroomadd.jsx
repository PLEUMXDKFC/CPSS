// src/Page/Studentroomadd.jsx
import React, { useState, useEffect } from "react";
import { School, RefreshCw, HelpCircle, Edit, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Studentroomadd() {
  const [formData, setFormData] = useState({
    room_name: "",

    room_type: "ห้องทฤษฎี",
  });

  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // submit
  const [isFetching, setIsFetching] = useState(false); // load table
  const [message, setMessage] = useState(null); // {type, text}
  const [editingRoomId, setEditingRoomId] = useState(null); // ถ้ามี = โหมดแก้ไข
  const [roomToDelete, setRoomToDelete] = useState(null); // สำหรับ modal ลบ

  const isEditing = editingRoomId !== null;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    window.clearTimeout(showMessage._t);
    showMessage._t = window.setTimeout(() => setMessage(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // โหลดรายการห้อง
  const fetchRooms = async () => {
    setIsFetching(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/server/api/GET/get_rooms.php`, {
        headers: { Accept: "application/json" },
      });
      if (Array.isArray(data)) {
        setRooms(data);
      } else {
        console.error("รูปแบบข้อมูลห้องไม่เป็น Array:", data);
        setRooms([]);
        showMessage("error", "รูปแบบข้อมูลห้องเรียนไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRooms([]);
      showMessage("error", "โหลดข้อมูลห้องเรียนไม่สำเร็จ");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const resetForm = () => {
    setFormData({
      room_name: "",

      room_type: "ห้องทฤษฎี",
    });
    setEditingRoomId(null);
  };

  // บันทึก / อัปเดตห้อง
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // ตรวจสอบข้อมูลซ้ำ (client-side: ชื่อห้อง + ประเภทห้องต้องไม่ซ้ำกัน)
    const trimName = formData.room_name.trim();
    const trimType = formData.room_type.trim();
    const isDuplicate = rooms.some(
      (r) =>
        r.room_name.trim().toLowerCase() === trimName.toLowerCase() &&
        r.room_type?.trim().toLowerCase() === trimType.toLowerCase() &&
        (!isEditing || r.room_id !== editingRoomId)
    );
    if (isDuplicate) {
      showMessage("error", "ข้อมูลห้องเรียนนี้มีอยู่ในระบบแล้ว (ชื่อห้องและประเภทห้องซ้ำ)");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,

      };

      let url = "/api/POST/InsertRoom.php";

      if (isEditing) {
        // โหมดแก้ไข
        url = "/api/UPDATE/UpdateRoom.php";
        payload.room_id = editingRoomId;
      }

      const { data } = await axios.post(`${API_BASE_URL}/server${url}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (data?.status === "success") {
        showMessage("success", isEditing ? "อัปเดตข้อมูลห้องเรียนสำเร็จ" : "บันทึกข้อมูลห้องเรียนสำเร็จ");
        resetForm();
        fetchRooms(); // รีโหลดตาราง
      } else {
        showMessage("error", data?.message || "ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (err) {
      console.error("Error submitting room:", err);
      showMessage("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  // กดปุ่มแก้ไข -> เติมข้อมูลลงฟอร์ม
  const handleEditClick = (room) => {
    setEditingRoomId(room.room_id);
    setFormData({
      room_name: room.room_name || "",

      room_type: room.room_type || "ห้องทฤษฎี",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // เปิด modal ลบ
  const handleDeleteClick = (room) => {
    setRoomToDelete(room);
  };

  // ยืนยันลบจริง
  const confirmDelete = async () => {
    if (!roomToDelete) return;

    try {
      const payload = { room_id: roomToDelete.room_id };
      const { data } = await axios.post(`${API_BASE_URL}/server/api/Delete/DeleteRoom.php`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (data?.status === "success") {
        showMessage("success", "ลบข้อมูลห้องเรียนสำเร็จ");
        fetchRooms();
      } else {
        showMessage("error", data?.message || "ไม่สามารถลบข้อมูลได้");
      }
    } catch (err) {
      console.error("Error deleting room:", err);
      showMessage("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setRoomToDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-65 container mx-auto p-6">
        {/* ให้ทุกอย่างอยู่ตรงกลางด้วย max-w + mx-auto */}
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">เพิ่มข้อมูลห้องเรียน</h1>
            <School className="w-8 h-8 text-green-600" />
          </div>

          {/* Card ฟอร์ม */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              {isEditing ? "แก้ไขข้อมูลห้องเรียน" : "กรอกข้อมูลห้องเรียนใหม่"}
            </h2>

            {message && (
              <div
                className={`mb-4 p-3 rounded-md text-sm ${message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                  }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* แถวที่ 1: ชื่อห้อง, ตึก */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="room_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ชื่อห้อง / เลขที่ห้อง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="room_name"
                    id="room_name"
                    value={formData.room_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="เช่น 19-301 หรือ Lab Com 1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="room_type"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ประเภทห้อง
                  </label>
                  <select
                    name="room_type"
                    id="room_type"
                    value={formData.room_type}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ห้องทฤษฎี">ห้องทฤษฎี</option>
                    <option value="ห้องปฏิบัติ">ห้องปฏิบัติ</option>
                  </select>
                </div>
              </div>

              {/* ปุ่ม Submit / ยกเลิกแก้ไข */}
              <div className="flex justify-end pt-4 gap-3">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-white border border-gray-500 text-gray-600 rounded-md hover:bg-gray-600 hover:text-white transition"
                  >
                    ยกเลิกการแก้ไข
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-white border border-blue-600 text-blue-600 font-semibold rounded-md shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400"
                >
                  {isLoading
                    ? "กำลังบันทึก..."
                    : isEditing
                      ? "อัปเดตข้อมูลห้องเรียน"
                      : "บันทึกข้อมูลห้องเรียน"}
                </button>
              </div>
            </form>
          </div>

          {/* ตารางแสดงห้องที่มีในระบบ */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-semibold text-gray-700">
                รายชื่อห้องเรียนในระบบ
              </h2>
              <button
                onClick={fetchRooms}
                className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw
                  className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อห้อง
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ประเภทห้อง
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isFetching && rooms.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : rooms.length > 0 ? (
                    rooms.map((r) => (
                      <tr
                        key={r.room_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {r.room_name}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {r.room_type || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditClick(r)}
                              className="px-3 py-1 text-xs border border-blue-500 text-blue-600 rounded-md bg-white hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1"
                            >
                              <Edit size={14} />
                              แก้ไข
                            </button>
                            <button
                              onClick={() => handleDeleteClick(r)}
                              className="px-3 py-1 text-xs border border-red-500 text-red-600 rounded-md bg-white hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        ไม่พบข้อมูลห้องเรียนในระบบ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal ยืนยันการลบ */}
      {roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full border-4 border-gray-200 flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                ยืนยันการลบข้อมูลห้องเรียน
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                คุณต้องการลบห้อง{" "}
                <span className="font-semibold text-gray-800">
                  {roomToDelete.room_name}
                </span>{" "}
                ใช่หรือไม่?
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setRoomToDelete(null)}
                className="px-5 py-2 rounded-md bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Studentroomadd;
