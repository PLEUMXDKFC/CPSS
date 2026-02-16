// src/Page/Teacheradd.jsx
import React, { useEffect, useState } from "react";
import { UserPlus, Users, RefreshCw, X, Trash2, Edit3 } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** ---------- Helper: แปลงคำนำหน้าตัวย่อ -> แบบเต็ม ---------- */
const prefixFullMap = {
  "อ.": "อาจารย์",
  "ผศ.": "ผู้ช่วยศาสตราจารย์",
  "รศ.": "รองศาสตราจารย์",
  "ศ.": "ศาสตราจารย์",
  "ดร.": "ด็อกเตอร์",
  "นาย": "นาย",
  "นาง": "นาง",
  "น.ส.": "นางสาว",
};

const formatPrefix = (prefix) => {
  if (!prefix) return "-";
  const key = String(prefix).trim();
  return prefixFullMap[key] || key;
};

function Teacheradd() {
  /** ---------- Form state ---------- */
  const [formData, setFormData] = useState({
    prefix: "",
    fname: "",
    lname: "",
    department: "",
  });

  /** ---------- UI state ---------- */
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null); // null = เพิ่มใหม่
  const [teacherToDelete, setTeacherToDelete] = useState(null); // เก็บแถวที่จะลบ
  const [isDeleting, setIsDeleting] = useState(false);

  /** ---------- Helpers ---------- */
  const showMessage = (type, text) => {
    setMessage({ type, text });
    window.clearTimeout(showMessage._t);
    showMessage._t = window.setTimeout(() => setMessage(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      prefix: "",
      fname: "",
      lname: "",
      department: "",
    });
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /** ---------- Fetch teachers (GET) ---------- */
  const fetchTeachers = async () => {
    setIsFetching(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/server/api/GET/get_teachers.php`, {
        headers: { Accept: "application/json" },
      });
      if (Array.isArray(data)) {
        setTeachers(data);
      } else {
        setTeachers([]);
        console.error("รูปแบบข้อมูลไม่เป็น Array:", data);
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setTeachers([]);
      showMessage("error", "โหลดรายชื่อครูไม่สำเร็จ");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  /** ---------- Edit / Delete handlers ---------- */
  const handleEdit = (teacher) => {
    setFormData({
      prefix: teacher.prefix || "",
      fname: teacher.fname || "",
      lname: teacher.lname || "",
      department: teacher.department || "",
    });
    setEditingId(teacher.teacher_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // กดปุ่ม "ลบ" -> แค่เปิด modal
  const openDeleteModal = (teacher) => {
    setTeacherToDelete(teacher);
  };

  const closeDeleteModal = () => {
    setTeacherToDelete(null);
    setIsDeleting(false);
  };

  // กดยืนยันลบใน modal
  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    setIsDeleting(true);
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/server/api/Delete/DeleteTeacher.php`, {
        data: { teacher_id: teacherToDelete.teacher_id },
        headers: { "Content-Type": "application/json" },
      });

      if (data?.status === "success") {
        showMessage("success", "ลบข้อมูลครูผู้สอนสำเร็จ");
        fetchTeachers();
        if (editingId === teacherToDelete.teacher_id) {
          resetForm();
        }
        closeDeleteModal();
      } else {
        showMessage("error", data?.message || "ไม่สามารถลบข้อมูลได้");
      }
    } catch (err) {
      console.error("Error deleting teacher:", err);
      showMessage("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsDeleting(false);
    }
  };

  /** ---------- Submit (Insert / Update) ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        const payload = {
          teacher_id: editingId,
          ...formData,
        };

        const { data } = await axios.put(`${API_BASE_URL}/server/api/UPDATE/UpdateTeacher.php`, payload, {
          headers: { "Content-Type": "application/json" },
        });

        if (data?.status === "success") {
          showMessage("success", "อัปเดตข้อมูลครูผู้สอนสำเร็จ");
          resetForm();
          fetchTeachers();
        } else {
          showMessage("error", data?.message || "ไม่สามารถอัปเดตข้อมูลได้");
        }
      } else {
        console.log('Sending data to InsertTeacher:', formData);
        const { data } = await axios.post(`${API_BASE_URL}/server/api/POST/InsertTeacher.php`, formData, {
          headers: { "Content-Type": "application/json" },
        });

        if (data?.status === "success") {
          showMessage("success", "ข้อมูลครูผู้สอนถูกเพิ่มในระบบแล้ว");
          resetForm();
          fetchTeachers();
        } else {
          showMessage("error", data?.message || "ไม่สามารถบันทึกข้อมูลได้");
        }
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      showMessage("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  /** ---------- UI ---------- */
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className="ml-65 container mx-auto p-6">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">เพิ่มข้อมูลครูผู้สอน</h1>
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>

          {/* Form */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              {editingId ? "แก้ไขข้อมูลครูผู้สอน" : "กรอกข้อมูลครูใหม่"}
            </h2>

            {message && (
              <div
                role="alert"
                className={`mb-4 p-4 rounded-md ${message.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                  }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="prefix" className="block text-sm font-medium text-gray-700">
                    คำนำหน้า <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="prefix"
                    name="prefix"
                    type="text"
                    value={formData.prefix}
                    onChange={handleChange}
                    required
                    placeholder="เช่น อาจารย์, ผู้ช่วยศาสตราจารย์, นางสาว"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="fname" className="block text-sm font-medium text-gray-700">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fname"
                    name="fname"
                    type="text"
                    value={formData.fname}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="lname" className="block text-sm font-medium text-gray-700">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lname"
                    name="lname"
                    type="text"
                    value={formData.lname}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  แผนกวิชา
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="เช่น เทคโนโลยีสารสนเทศ, การบัญชี"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>



              <div className="flex justify-between items-center pt-4">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-semibold rounded-md border border-gray-400 text-gray-700 hover:bg-gray-50 transition"
                  >
                    ยกเลิกการแก้ไข
                  </button>
                )}
                <div className="flex-1" />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:bg-gray-400"
                >
                  {isLoading
                    ? "กำลังบันทึก..."
                    : editingId
                      ? "บันทึกการแก้ไข"
                      : "บันทึกข้อมูลครูผู้สอน"}
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-700">รายชื่อครูในระบบ</h2>
              </div>
              <button
                onClick={fetchTeachers}
                title="รีเฟรชข้อมูล"
                className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <RefreshCw className={`w-5 h-5 ${isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อ-นามสกุล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      แผนกวิชา
                    </th>

                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isFetching && teachers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : teachers.length > 0 ? (
                    teachers.map((t) => (
                      <tr key={t.teacher_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrefix(t.prefix)} {t.fname} {t.lname}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{t.department || "-"}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* ปุ่มแก้ไข */}
                            <button
                              type="button"
                              onClick={() => handleEdit(t)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm transition"
                            >
                              <Edit3 className="w-3 h-3" />
                              แก้ไข
                            </button>

                            {/* ปุ่มลบ */}
                            <button
                              type="button"
                              onClick={() => openDeleteModal(t)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md border border-red-500 text-red-600 bg-white hover:bg-red-50 hover:text-red-700 hover:shadow-sm transition"
                            >
                              <Trash2 className="w-3 h-3" />
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        ไม่พบข้อมูลครูในระบบ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* -------- Modal ยืนยันลบ -------- */}
        {teacherToDelete && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8">
              {/* ไอคอนคำถาม */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-blue-300 flex items-center justify-center">
                  <span className="text-3xl text-blue-400">?</span>
                </div>
              </div>

              {/* Title + Text */}
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                ยืนยันการลบข้อมูลครูผู้สอน
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                คุณต้องการลบข้อมูลของ{" "}
                <span className="font-semibold text-gray-900">
                  {formatPrefix(teacherToDelete.prefix)} {teacherToDelete.fname}{" "}
                  {teacherToDelete.lname}
                </span>{" "}
                ออกจากระบบใช่หรือไม่?
              </p>

              {/* ปุ่ม */}
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="min-w-[110px] px-4 py-2 text-sm font-semibold rounded-md bg-red-500 text-white hover:bg-red-400 transition disabled:bg-red-300"
                  disabled={isDeleting}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="min-w-[110px] px-4 py-2 text-sm font-semibold rounded-md bg-blue-500 text-white hover:bg-blue-400 transition disabled:bg-blue-300"
                >
                  {isDeleting ? "กำลังลบ..." : "ลบข้อมูล"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Teacheradd;
