import React, { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [openSection, setOpenSection] = useState({
    plan: false,
    table: false,
    report: false,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => {
    navigate("/LoginPage");
  };

  // ตรวจสอบ path และเปิด section ที่ตรงกันตอน mount/refresh
  useEffect(() => {
    const path = location.pathname;

    // กำหนด path ที่เกี่ยวข้องกับแต่ละ section
    const planPaths = [
      "/Createstudyplan", "/courseinfo", "/courseadd",
      "/Intomohou", "/Redirectmohou",
      "/intogroupinfo", "/Groupinfo",
      "/makeplan", "/intoplan", "/plan", "/add-subject",
      "/intocheckplan", "/checkplan"
    ];
    const tablePaths = ["/Into_list_of_subject", "/List_of_subject", "/In_list_of_subject", "/Teacheradd", "/Studentroomadd", "/Into_Create_Table", "/Select_table", "/Create_Study_Table", "/IntoTeacherSchedule", "/TeacherSchedule", "/TeacherYearSchedule", "/TeacherGroupSchedule", "/TeacherHistoryTable", "/IntoRoomSchedule", "/RoomSchedule", "RoomYearSchedule", "RoomGroupSchedule", "RoomHistoryTable", "/Studyhistorytable", "/IntoStudyHistoryTable", "/HistoryTable"];
    const reportPaths = ["/intoprintplan", "/PrintPlan20"];

    // เช็คว่า path ปัจจุบันตรงกับ section ไหน
    const isPlanPath = planPaths.some(p => path.includes(p));
    const isTablePath = tablePaths.some(p => path.includes(p));
    const isReportPath = reportPaths.some(p => path.includes(p));

    setOpenSection({
      plan: isPlanPath,
      table: isTablePath,
      report: isReportPath,
    });
  }, [location.pathname]);

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

          {/* Home / Back Button */}
          <Link
            to={isLoggedIn ? "/Createstudyplan" : "/LoginPage"}
            className="flex items-center w-full p-2 mb-2 rounded-md hover:bg-white/20 transition text-lg font-semibold"
          >
            <LucideIcons.Home className="w-5 h-5 mr-2" />
            <span>{isLoggedIn ? "หน้าหลัก" : "กลับหน้าหลัก"}</span>
          </Link>
          <hr className="border-gray-500 mb-2" />

          {/* หมวด: แผนการเรียน (เฉพาะ Login) */}
          {isLoggedIn && (
            <>
              <button
                onClick={() => toggleSection("plan")}
                className="flex justify-between items-center w-full text-lg font-semibold mb-2 cursor-pointer"
              >
                <span>แผนการเรียน</span>
                <motion.div
                  animate={{ rotate: openSection.plan ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <LucideIcons.ChevronRight className="w-5 h-5" />
                </motion.div>
              </button>
              <hr className="border-gray-500 mb-2" />

              {/* Content ที่ expand */}
              <AnimatePresence initial={false}>
                {openSection.plan && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex flex-col space-y-2 mb-4 overflow-hidden"
                  >
                    <li>
                      <Link
                        to="/Createstudyplan"
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/Createstudyplan") ||
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
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/Intomohou") ||
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
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/intogroupinfo") ||
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
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/makeplan") ||
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
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/checkplan") ||
                          location.pathname.includes("/intocheckplan")
                          ? "bg-white/20"
                          : ""
                          }`}
                      >
                        <LucideIcons.CheckCircle className="w-5 h-5 mr-2" />
                        ดูใบตรวจเช็คการจัดแผนการเรียน
                      </Link>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
              <hr className="border-gray-500 mb-2" />
            </>
          )}

          {/* หมวด: ตารางเรียน */}
          <button
            onClick={() => toggleSection("table")}
            className="flex justify-between items-center w-full text-lg font-semibold mb-2 cursor-pointer"
          >
            <span>ตารางเรียน</span>
            <motion.div
              animate={{ rotate: openSection.table ? 90 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <LucideIcons.ChevronRight className="w-5 h-5" />
            </motion.div>
          </button>
          <hr className="border-gray-500 mb-2" />

          <AnimatePresence initial={false}>
            {openSection.table && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col space-y-2 mb-4 overflow-hidden"
              >

                {/* Restricted Menus */}
                {isLoggedIn && (
                  <>
                    <li>
                      <Link
                        to="/Into_list_of_subject"
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/Into_list_of_subject") ||
                          location.pathname.includes("/List_of_subject") ||
                          location.pathname.includes("/In_list_of_subject")
                          ? "bg-white/20"
                          : ""
                          }`}
                      >
                        <LucideIcons.Book className="w-5 h-5 mr-2" />
                        รายวิชาจากแผนการเรียน
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/Teacheradd"
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/Teacheradd")
                          ? "bg-white/20"
                          : ""
                          }`}
                      >
                        <LucideIcons.UserPlus className="w-5 h-5 mr-2" />
                        เพิ่มข้อมูลครู
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/Studentroomadd"
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/Studentroomadd")
                          ? "bg-white/20"
                          : ""
                          }`}
                      >
                        <LucideIcons.Users className="w-5 h-5 mr-2" />
                        เพิ่มข้อมูลห้องเรียน
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/Into_Create_Table"
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/Into_Create_Table") ||
                          location.pathname.includes("/Select_table") ||
                          location.pathname.includes("/Create_Study_Table")
                          ? "bg-white/20"
                          : ""
                          }`}
                      >
                        <LucideIcons.Table className="w-5 h-5 mr-2" />
                        สร้างตารางเรียน
                      </Link>
                    </li>
                  </>
                )}

                {/* Public Menus */}
                <li>
                  <Link
                    to="/IntoTeacherSchedule"
                    className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/IntoTeacherSchedule") ||
                      location.pathname.includes("/TeacherSchedule") ||
                      location.pathname.includes("/TeacherYearSchedule") ||
                      location.pathname.includes("/TeacherGroupSchedule") ||
                      location.pathname.includes("/TeacherHistoryTable")
                      ? "bg-white/20"
                      : ""
                      }`}
                  >
                    <LucideIcons.Calendar className="w-5 h-5 mr-2" />
                    ตารางสอนครู
                  </Link>
                </li>
                <li>
                  <Link
                    to="/IntoRoomSchedule"
                    className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/IntoRoomSchedule") ||
                      location.pathname.includes("/RoomSchedule") ||
                      location.pathname.includes("/RoomYearSchedule") ||
                      location.pathname.includes("/RoomGroupSchedule") ||
                      location.pathname.includes("/RoomHistoryTable")
                      ? "bg-white/20"
                      : ""
                      }`}
                  >
                    <LucideIcons.Monitor className="w-5 h-5 mr-2" />
                    ตารางการใช้ห้อง
                  </Link>
                </li>
                <li>
                  <Link
                    to="/Studyhistorytable"
                    className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/IntoStudyHistoryTable") ||
                      location.pathname.includes("/Studyhistorytable") ||
                      location.pathname.includes("/HistoryTable")
                      ? "bg-white/20"
                      : ""
                      }`}
                  >
                    <LucideIcons.Clock className="w-5 h-5 mr-2" />
                    ตารางเรียนย้อนหลัง
                  </Link>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
          <hr className="border-gray-500 mb-2" />

          {/* หมวด: พิมพ์รายงาน (เฉพาะ Login) */}
          {isLoggedIn && (
            <>
              <button
                onClick={() => toggleSection("report")}
                className="flex justify-between items-center w-full text-lg font-semibold mb-2 cursor-pointer"
              >
                <span>พิมพ์รายงาน</span>
                <motion.div
                  animate={{ rotate: openSection.report ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <LucideIcons.ChevronRight className="w-5 h-5" />
                </motion.div>
              </button>
              <hr className="border-gray-500 mb-2" />

              <AnimatePresence initial={false}>
                {openSection.report && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex flex-col space-y-2 mb-4 overflow-hidden"
                  >
                    <li>
                      <Link
                        to="/intoprintplan"
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/intoprintplan")
                          ? "bg-white/20"
                          : ""
                          }`}
                      >
                        <LucideIcons.Printer className="w-5 h-5 mr-2" />
                        พิมพ์แผนการเรียน
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/PrintPlan20"
                        className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes("/PrintPlan20")
                          ? "bg-white/20"
                          : ""
                          }`}
                      >
                        <LucideIcons.Printer className="w-5 h-5 mr-2" />
                        พิมพ์แผนการเรียน 2.0
                      </Link>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* ---------- ส่วนล่าง: Logout/Login ---------- */}
        <div className="p-4 border-t border-gray-500">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="flex items-center w-full gap-2 p-2 rounded-md hover:bg-white/20 transition cursor-pointer"
            >
              <LucideIcons.LogOut className="w-5 h-5" />
              <strong>ออกจากระบบ</strong>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center w-full gap-2 p-2 rounded-md hover:bg-white/20 transition cursor-pointer bg-green-600/80"
            >
              <LucideIcons.LogIn className="w-5 h-5" />
              <strong>เข้าสู่ระบบ</strong>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;