import React, { useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("hidden"); // ✅ แก้ classNameList เป็น classList
}

function Sidebar() {
  const navigate = useNavigate(); // ✅ ใช้ navigate แทน window.location.href

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
        // ✅ แสดง loading ก่อนทำการออกจากระบบ
        Swal.fire({
          title: "กำลังออกจากระบบ...",
          text: "กรุณารอสักครู่",
          timer: 800,
          timerProgressBar: true,
          showConfirmButton: false,
          willClose: () => {
            // ✅ ล้างข้อมูลที่เกี่ยวข้องทั้งหมด
            localStorage.removeItem("token"); // ลบ Token
            localStorage.removeItem("rememberMe"); // ลบค่า rememberMe
            localStorage.removeItem("savedUsername"); // ลบชื่อผู้ใช้ที่ถูกจำ
            localStorage.removeItem("savedPassword"); // ลบรหัสผ่านที่ถูกจำ
            sessionStorage.clear(); // ล้าง sessionStorage ทั้งหมด
  
            // ✅ รีไดเร็กไปหน้า Login
            navigate("/");
          },
        });
      }
    });
  };
  
  return (
    <>
      <div id="sidebar" className="w-64 bg-[#3E3269] text-white p-4 flex flex-col h-screen fixed lg:block">
        <a href="#" className="text-lg font-semibold mb-4">แผนการเรียน</a>
        <hr className="border-gray-500 my-4" />

        <ul className="flex flex-col space-y-2 flex-grow">
        <li>
            <Link to="/Createstudyplan" className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes('/Createstudyplan') || location.pathname.includes('/courseinfo') ||  location.pathname.includes('/courseadd') ? 'bg-white/20' : ''}`}>
                <LucideIcons.Book className="w-5 h-5 mr-2" />
                ข้อมูลรายวิชา
            </Link>
        </li>
          <li>
          <Link to="/Intomohou" className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes('/Intomohou') || location.pathname.includes('/Redirectmohou') ? 'bg-white/20' : ''}`}>
              <LucideIcons.LayoutDashboard className="w-5 h-5 mr-2" />
              ดูโครงสร้างแผนการเรียน
            </Link>
          </li>
          <li>
            <Link to="/intogroupinfo" className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname.includes('/intogroupinfo') || location.pathname.includes('/Groupinfo') ? 'bg-white/20' : ''}`}>
              <LucideIcons.User className="w-5 h-5 mr-2" />
              ข้อมูลกลุ่มการเรียน
            </Link>
          </li>
          <li>
            <Link to="/intoplan"  className={`flex items-center p-2 rounded-md hover:bg-white/20 transition  ${location.pathname.includes('/intoplan') || location.pathname.includes('/plan') ||  location.pathname.includes('/add-subject') ? 'bg-white/20' : ''}`}>
              <LucideIcons.Calendar className="w-5 h-5 mr-2" />
              สร้างแผนการเรียน
            </Link>
          </li>
        </ul>

            <ul className="flex flex-col space-y-2 flex-grow">
                <li>
                    <Link to={"/"} className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname === '/' ? 'bg-white/20' : ''}`}>
                        <LucideIcons.Book className="w-5 h-5 mr-2" />
                        ข้อมูลรายวิชา
                    </Link>
                </li>
                <li>
                    <a href="{{ route('curriculum-structure.index') }}" className="flex items-center p-2 rounded-md hover:bg-white/20 transition {{ request()->is('curriculum-structure') ? 'bg-white/20' : '' }}">
                        <LucideIcons.LayoutDashboard className="w-5 h-5 mr-2"></LucideIcons.LayoutDashboard>ดูโครงสร้างแผนการเรียน
                    </a>
                </li>
                <li>
                    <Link href="{{ route('plan.index') }}" className="flex items-center p-2 rounded-md hover:bg-white/20 transition {{ request()->is('make-plan') ? 'bg-white/20' : '' }}">
                        <LucideIcons.Calendar className="w-5 h-5 mr-2"></LucideIcons.Calendar>สร้างแผนการเรียน
                    </Link>
                </li>
                <li>
                  <Link to={"/Intogroupinfo"} className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname === '/Intogroupinfo' || location.pathname.startsWith('/Groupinfo/') ? 'bg-white/20' : '' }`}>
                        <LucideIcons.User className="w-5 h-5 mr-2"></LucideIcons.User>ข้อมูลกลุ่มการเรียน
                    </Link>
                </li>
            </ul>

        <hr className="border-gray-500 my-4" />
        
        <ul className="flex flex-col space-y-2 flex-grow">
        <li>
            <Link to="/intoprintplan"  className={`flex items-center p-2 rounded-md hover:bg-white/20 transition  ${location.pathname.includes('/intoprintplan') ? 'bg-white/20' : ''}`}>
              <LucideIcons.Printer className="w-5 h-5 mr-2" />
             พิมพ์แผนการเรียน
            </Link>
          </li>
          </ul>

          <hr className="border-gray-500 my-4" />
          
        <div>
          <button onClick={handleLogout} className="flex items-center w-full gap-2 p-2 rounded-md hover:bg-white/20 transition">
            <LucideIcons.LogOut className="w-5 h-5" />
            <strong>Logout</strong>
          </button>
        </div>
      </div>
      <button onClick={toggleSidebar} className="lg:hidden fixed top-4 left-4 bg-blue-500 text-white p-2 rounded-md">☰</button>
    </>
  );
}

export default Sidebar;
