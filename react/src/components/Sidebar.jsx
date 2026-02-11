import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("hidden");
}

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openSection, setOpenSection] = useState({
    plan: true,
    report: false,
  });

  const toggleSection = (section) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = () => {
    Swal.fire({
      title: "ยืนยันการออกจากระบบ",
      text: "คุณต้องการออกจากระบบใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "กำลังออกจากระบบ...",
          text: "กรุณารอสักครู่",
          timer: 800,
          timerProgressBar: true,
          showConfirmButton: false,
          willClose: () => {
            localStorage.clear();
            sessionStorage.clear();
            navigate("/");
          },
        });
      }
    });
  };

  return (
    <>
      <div
        id="sidebar"
        className="w-64 bg-[#3E3269] text-white flex flex-col h-screen fixed lg:block"
      >
        {/* ---------- ส่วนเมนู (scroll ได้) ---------- */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* หมวด: แผนการเรียน */}
          <button
            onClick={() => toggleSection("plan")}
            className="flex justify-between items-center w-full text-lg font-semibold mb-2 cursor-pointer"
          >
            <span>แผนการเรียน</span>
            {openSection.plan ? (
              <LucideIcons.ChevronDown className="w-5 h-5" />
            ) : (
              <LucideIcons.ChevronRight className="w-5 h-5" />
            )}
          </button>
          <hr className="border-gray-500 mb-2" />

          {openSection.plan && (
            <ul className="flex flex-col space-y-2 mb-4">
              <li>
                <Link
                  to="/Createstudyplan"
                  className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${
                    location.pathname.includes("/Createstudyplan") ||
                    location.pathname.includes("/courseinfo") ||
                    location.pathname.includes("/courseadd")
                      ? "bg-white/20"
                      : ""
                  }`}
                >
                  <LucideIcons.Book className="w-5 h-5 mr-2" />
                  ข้อมูลรายวิชา
                </Link>
              </li>
              <li>
                <Link
                  to="/Intomohou"
                  className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${
                    location.pathname.includes("/Intomohou") ||
                    location.pathname.includes("/Redirectmohou")
                      ? "bg-white/20"
                      : ""
                  }`}
                >
                  <LucideIcons.LayoutDashboard className="w-5 h-5 mr-2" />
                  ดูแบบสรุปโครงสร้างหลักสูตร
                </Link>
              </li>
              <li>
                <Link
                  to="/intogroupinfo"
                  className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${
                    location.pathname.includes("/intogroupinfo") ||
                    location.pathname.includes("/Groupinfo")
                      ? "bg-white/20"
                      : ""
                  }`}
                >
                  <LucideIcons.User className="w-5 h-5 mr-2" />
                  ข้อมูลกลุ่มการเรียน
                </Link>
              </li>
              <li>
                <Link
                  to="/makeplan"
                  className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${
                    location.pathname.includes("/makeplan") ||
                    location.pathname.includes("/intoplan") ||
                    location.pathname.includes("/plan") ||
                    location.pathname.includes("/add-subject")
                      ? "bg-white/20"
                      : ""
                  }`}
                >
                  <LucideIcons.Calendar className="w-5 h-5 mr-2" />
                  สร้างแผนการเรียน
                </Link>
              </li>
              <li>
                <Link
                  to="/intocheckplan"
                  className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${
                    location.pathname.includes("/checkplan") ||
                    location.pathname.includes("/intocheckplan")
                      ? "bg-white/20"
                      : ""
                  }`}
                >
                  <LucideIcons.CheckCircle className="w-5 h-5 mr-2" />
                  ดูใบตรวจเช็คการจัดแผนการเรียน
                </Link>
              </li>
            </ul>
          )}

          {/* หมวด: พิมพ์รายงาน */}
          <button
            onClick={() => toggleSection("report")}
            className="flex justify-between items-center w-full text-lg font-semibold mb-2 cursor-pointer"
          >
            <span>พิมพ์รายงาน</span>
            {openSection.report ? (
              <LucideIcons.ChevronDown className="w-5 h-5" />
            ) : (
              <LucideIcons.ChevronRight className="w-5 h-5" />
            )}
          </button>
          <hr className="border-gray-500 mb-2" />

          {openSection.report && (
            <ul className="flex flex-col space-y-2 mb-4">
              <li>
                <Link
                  to="/intoprintplan"
                  className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${
                    location.pathname.includes("/intoprintplan")
                      ? "bg-white/20"
                      : ""
                  }`}
                >
                  <LucideIcons.Printer className="w-5 h-5 mr-2" />
                  พิมพ์แผนการเรียน
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* ---------- ส่วนล่าง: Logout ---------- */}
        <div className="p-4 border-t border-gray-500">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-2 p-2 rounded-md hover:bg-white/20 transition cursor-pointer"
          >
            <LucideIcons.LogOut className="w-5 h-5" />
            <strong>ออกจากระบบ</strong>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
