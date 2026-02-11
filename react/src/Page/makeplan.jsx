import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const MakePlan = () => {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [selectedCode, setSelectedCode] = useState(""); // รหัสที่เลือก
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php`)
      .then((response) => {
        const sortedPlans = response.data.sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return a.group - b.group;
        });

        // กรองเฉพาะ student_id ไม่ซ้ำ
        const uniquePlans = [];
        const seenStudentIds = new Set();
        for (const plan of sortedPlans) {
          if (!seenStudentIds.has(plan.student_id)) {
            seenStudentIds.add(plan.student_id);
            uniquePlans.push(plan);
          }
        }

        setPlans(uniquePlans);
        setFilteredPlans(uniquePlans);
      })
      .catch((error) => {
        console.error("Error fetching study plans:", error);
      });
  }, []);

  // ✅ เมื่อเลือก student_id
  const handleSelectChange = (e) => {
    const selected = e.target.value;
    setSelectedCode(selected);

    if (selected === "") {
      setFilteredPlans(plans);
    } else {
      const filtered = plans.filter(
        (plan) => String(plan.student_id) === selected
      );
      setFilteredPlans(filtered);
    }
  };

  // ✅ ดึงรายการรหัสที่ไม่ซ้ำทั้งหมด
  const uniqueStudentIds = [...new Set(plans.map((p) => p.student_id))];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-65 container mx-auto p-6">
        <h2 className="text-center text-3xl font-bold mb-6">แผนการเรียน</h2>

        {/* ---------- ส่วน select กรองรหัส ---------- */}
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

        {/* ---------- ส่วนแสดงผล ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPlans.length === 0 ? (
            <div className="col-span-full text-center text-gray-600">
              <p className="mb-2">ยังไม่มีหลักสูตร</p>
              <a
                href="http://localhost:5173/Createstudyplan"
                className="text-blue-600 underline hover:text-blue-800"
              >
                เพิ่มหลักสูตรได้ที่นี่
              </a>
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <div
                key={plan.planid}
                className="bg-white shadow-lg p-6 rounded-xl cursor-pointer hover:bg-blue-200 transition-all"
                onClick={() =>
                  navigate(
                    `/intoplan?planid=${plan.planid}&course=${encodeURIComponent(
                      plan.course
                    )}&year=${plan.year}&student_id=${plan.student_id}`
                  )
                }
              >
                <h3 className="text-xl font-semibold text-blue-600 mb-2">
                  แผนการเรียน รหัส: {plan.student_id}
                </h3>
                <p className="text-gray-700">พุทธศักราช: {plan.year}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MakePlan;
