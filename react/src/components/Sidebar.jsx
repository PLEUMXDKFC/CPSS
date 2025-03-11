import React, { useEffect } from 'react';
import * as LucideIcons from "lucide-react";
import Swal from 'sweetalert2'; // อย่าลืมนำเข้า Swal

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
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

function Sidebar() {
    return (
        <>
            {/* Sidebar */}
            <div id="sidebar" className="w-64 bg-[#3E3269] text-white p-4 flex flex-col h-screen fixed left-0 top-0 lg:block">
                <a href="dashboard" className="text-lg font-semibold mb-4">แผนการเรียน</a>
                <hr className="border-gray-500 my-4" />

                <ul className="flex flex-col space-y-2 flex-grow">
                    <li>
                        <a href="{{ route('dashboard') }}" className="flex items-center p-2 rounded-md hover:bg-white/20 transition {{ request()->is('dashboard') ? 'bg-white/20' : '' }}">
                            <LucideIcons.Book className="w-5 h-5 mr-2"></LucideIcons.Book>ข้อมูลรายวิชา
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('curriculum-structure.index') }}" className="flex items-center p-2 rounded-md hover:bg-white/20 transition {{ request()->is('curriculum-structure') ? 'bg-white/20' : '' }}">
                            <LucideIcons.LayoutDashboard className="w-5 h-5 mr-2"></LucideIcons.LayoutDashboard>ดูโครงสร้างแผนการเรียน
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('plan.index') }}" className="flex items-center p-2 rounded-md hover:bg-white/20 transition {{ request()->is('make-plan') ? 'bg-white/20' : '' }}">
                            <LucideIcons.Calendar className="w-5 h-5 mr-2"></LucideIcons.Calendar>สร้างแผนการเรียน
                        </a>
                    </li>
                    <li>
                        <a href="{{ route('view-group') }}" className="flex items-center p-2 rounded-md hover:bg-white/20 transition {{ request()->is('view-group') ? 'bg-white/20' : '' }}">
                            <LucideIcons.User className="w-5 h-5 mr-2"></LucideIcons.User>ข้อมูลกลุ่มการเรียน
                        </a>
                    </li>
                </ul>

                <hr className="border-gray-500 my-4" />

                <div>
                    <button id="logoutBtn" className="flex items-center gap-2 p-2 rounded-md hover:bg-white/20 transition">
                        <LucideIcons.LogOut className="w-5 h-5" />
                        <strong>Logout</strong>
                    </button>
                </div>
            </div>

            {/* Toggle Button สำหรับ Mobile */}
            <button onClick={toggleSidebar} className="lg:hidden fixed top-4 left-4 bg-blue-500 text-white p-2 rounded-md z-50">☰</button>
        </>
    );
}

export default Sidebar;