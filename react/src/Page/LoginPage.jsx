import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Logo from "../img/logo.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    if (savedRememberMe) {
      const savedUsername = localStorage.getItem("savedUsername");
      const savedPassword = localStorage.getItem("savedPassword");
      if (savedUsername && savedPassword) {
        setUsername(savedUsername);
        setPassword(savedPassword);
        setRememberMe(true);
        handleAutoLogin(savedUsername, savedPassword);
      }
    } else {
      localStorage.removeItem("savedUsername");
      localStorage.removeItem("savedPassword");
    }
  }, []);

  const handleAutoLogin = async (savedUsername, savedPassword) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/server/api/POST/login.php`, {
        username: savedUsername,
        password: savedPassword,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        navigate("/Createstudyplan");
      }
    } catch (err) {
      console.error("Auto Login Error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/server/api/POST/login.php`, {
        username,
        password,
      });

      if (response.data.success) {
        Swal.fire({
          title: "เข้าสู่ระบบสำเร็จ!",
          text: "กำลังเปลี่ยนหน้า...",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        localStorage.setItem("token", response.data.token);

        if (rememberMe) {
          localStorage.setItem("savedUsername", username);
          localStorage.setItem("savedPassword", password);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("savedUsername");
          localStorage.removeItem("savedPassword");
          localStorage.removeItem("rememberMe");
        }

        setTimeout(() => navigate("/Createstudyplan"), 1500);
      } else {
        Swal.fire({
          title: "เข้าสู่ระบบล้มเหลว",
          text: response.data.message || "เกิดข้อผิดพลาด",
          icon: "error",
        });
      }
    } catch (err) {
      console.error("Login Error:", err);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อ API ได้",
        icon: "error",
      });
    }
  };

  const handleForgotPassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: "ลืมรหัสผ่าน?",
      html: `
        <input id="swal-username" class="swal2-input" placeholder="ชื่อผู้ใช้">
        <input id="swal-new-password" type="password" class="swal2-input" placeholder="รหัสผ่านใหม่">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "เปลี่ยนรหัสผ่าน",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const username = document.getElementById("swal-username").value;
        const newPassword = document.getElementById("swal-new-password").value;
        if (!username || !newPassword) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบ");
        }
        return { username, newPassword };
      },
    });

    if (formValues) {
      try {
        const response = await axios.post(`${API_BASE_URL}/server/api/POST/reset_password.php`, {
          username: formValues.username,
          newPassword: formValues.newPassword,
        });

        if (response.data.success) {
          Swal.fire("สำเร็จ!", "รหัสผ่านของคุณถูกเปลี่ยนแล้ว", "success");
        } else {
          Swal.fire("ผิดพลาด!", response.data.message || "เกิดข้อผิดพลาด", "error");
        }
      } catch (error) {
        console.error("Reset Password Error:", error);
        Swal.fire("ผิดพลาด!", "ไม่สามารถเชื่อมต่อ API ได้", "error");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <img className="h-10" src={Logo} alt="Logo" />
            <span className="text-xl font-bold">CTN PHRAE</span>
          </div>

          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <HiX size={30} /> : <HiMenu size={30} />}
            </button>
          </div>

          <ul className="hidden md:flex gap-6 text-lg">
            <li><Link to="/" className="hover:text-blue-600">หน้าหลัก</Link></li>
            <li><Link to="/intoviewplan" className="hover:text-blue-600">แผนการเรียน</Link></li>
            <li><Link to="/Studyhistorytable" className="hover:text-blue-600">ตารางเรียน (ทั่วไป)</Link></li>
            <li><Link to="/LoginPage" className="text-blue-600 hover:text-blue-600">เข้าสู่ระบบ</Link></li>
          </ul>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white px-4 pb-4 shadow">
            <ul className="flex flex-col gap-4 text-lg">
              <li><Link to="/" onClick={() => setMenuOpen(false)}>หน้าหลัก</Link></li>
              <li><Link to="/intoviewplan" onClick={() => setMenuOpen(false)}>แผนการเรียน</Link></li>
              <li><Link to="/Studyhistorytable" onClick={() => setMenuOpen(false)}>ตารางเรียน (ทั่วไป)</Link></li>
              <li><Link to="/LoginPage" onClick={() => setMenuOpen(false)}>เข้าสู่ระบบ</Link></li>
            </ul>
          </div>
        )}
      </nav>

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm mt-24 mx-4 sm:mx-0">
        <h2 className="text-2xl font-bold text-center text-gray-700">เข้าสู่ระบบ</h2>
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="relative w-full mt-3">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              className="w-full pl-10 p-3 border rounded focus:ring focus:ring-blue-300"
              placeholder="ชื่อผู้ใช้"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  document.getElementById("password-input")?.focus();
                }
              }}
            />
          </div>

          <div className="relative w-full mt-3">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              id="password-input"
              className="w-full pl-10 p-3 border rounded focus:ring focus:ring-blue-300"
              placeholder="รหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center mt-3 flex-wrap gap-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-gray-600">จดจำฉัน</label>
            </div>
            <button type="button" className="text-blue-500 hover:underline text-sm" onClick={handleForgotPassword}>
              ลืมรหัสผ่าน?
            </button>
          </div>

          <button
            className="w-full bg-blue-500 text-white py-2 mt-4 rounded hover:bg-blue-600 transition"
            type="submit"
          >
            ยืนยัน
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400">หรือ</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <Link
            to="/Studyhistorytable"
            className="w-full block text-center bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
          >
            ดูตารางเรียน (บุคคลทั่วไป)
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
