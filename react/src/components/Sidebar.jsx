import React from 'react'
import * as LucideIcons from "lucide-react";
import { Link } from "react-router-dom";  // ✅ import Link ที่นี่


function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classNameList.toggle('hidden');
}

function LogoutButton() {
    useEffect(() => {
      const logoutBtn = document.getElementById("logoutBtn");
  
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
          e.preventDefault(); // ป้องกันการโหลดหน้าใหม่
  
          Swal.fire({
            title: "ยืนยันการออกจากระบบ",
            text: "คุณต้องการออกจากระบบใช่หรือไม่?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "ออกจากระบบ",
            cancelButtonText: "ยกเลิก",
            reverseButtons: true,
            customClass: {
              popup: "swal2-popup",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              // แสดง loading เมื่อกดยืนยัน
              Swal.fire({
                title: "กำลังออกจากระบบ...",
                text: "กรุณารอสักครู่",
                timer: 800,
                timerProgressBar: true,
                showConfirmButton: false,
                willClose: () => {
                  // Redirect ไปยัง logout.php
                  window.location.href = "command/logout.php";
                },
              });
            } else {
              // เมื่อกดยกเลิกหรือกด ESC
              Swal.fire({
                title: "ยกเลิกการออกจากระบบ",
                icon: "info",
                timer: 800,
                showConfirmButton: false,
                customClass: {
                  popup: "swal2-popup",
                },
              });
            }
          });
        });
      }
    }, []);
}

function sidebar() {
  return (
    <>
        <div id="sidebar" className="w-64 bg-[#3E3269] text-white p-4 flex flex-col h-screen fixed lg:block">
            <a href="dashboard" className="text-lg font-semibold mb-4">แผนการเรียน</a>
            <hr className="border-gray-500 my-4" />

            <ul className="flex flex-col space-y-2 flex-grow">
                <li>
                    <Link to="/" className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname === '/' ? 'bg-white/20' : ''}`}>
                        <LucideIcons.Book className="w-5 h-5 mr-2" />
                        ข้อมูลรายวิชา
                    </Link>
                </li>
                <li>
                    <Link to={"/Intomohou"} className={`flex items-center p-2 rounded-md hover:bg-white/20 transition ${location.pathname === '/Intomohou' || location.pathname.startsWith('/mohou') ? 'bg-white/20' : '' }`}>
                        <LucideIcons.LayoutDashboard className="w-5 h-5 mr-2"></LucideIcons.LayoutDashboard>ดูโครงสร้างแผนการเรียน
                    </Link>
                </li>
                <li>
                    <Link href="{{ route('plan.index') }}" className="flex items-center p-2 rounded-md hover:bg-white/20 transition {{ request()->is('make-plan') ? 'bg-white/20' : '' }}">
                        <LucideIcons.Calendar className="w-5 h-5 mr-2"></LucideIcons.Calendar>สร้างแผนการเรียน
                    </Link>
                </li>
                <li>
                    <a href="{{ route('view-group') }}" className="flex items-center p-2 rounded-md hover:bg-white/20 transition {{ request()->is('view-group') ? 'bg-white/20' : '' }}">
                        <LucideIcons.User className="w-5 h-5 mr-2"></LucideIcons.User>ข้อมูลกลุ่มการเรียน
                    </a>
                </li>
            </ul>

            <hr className="border-gray-500 my-4" />

            <div>
            <button id="logoutBtn" className="flex items-center w-full gap-2 p-2 rounded-md hover:bg-white/20 transition">
                <LucideIcons.LogOut className="w-5 h-5" />
                <strong>Logout</strong>
            </button>
            </div>
        </div>
        <button onClick={toggleSidebar} className="lg:hidden fixed top-4 left-4 bg-blue-500 text-white p-2 rounded-md">☰</button>  
    </>
  )
}

export default sidebar