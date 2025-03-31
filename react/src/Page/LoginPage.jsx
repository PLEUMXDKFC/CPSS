import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Logo from "../img/logo.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ตรวจสอบ flag ว่าผู้ใช้เคยเลือก "จดจำฉัน" ไว้หรือไม่
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
      // ลบข้อมูลเก่าที่อาจถูกเก็บไว้
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
          localStorage.setItem("rememberMe", "true"); // บันทึก flag ว่าผู้ใช้เลือกจดจำฉัน
        } else {
          localStorage.removeItem("savedUsername");
          localStorage.removeItem("savedPassword");
          localStorage.removeItem("rememberMe");
        }        
        

        setTimeout(() => navigate("/Createstudyplan"), 1500);
      } else {
        Swal.fire({ title: "เข้าสู่ระบบล้มเหลว", text: response.data.message || "เกิดข้อผิดพลาด", icon: "error" });
      }
    } catch (err) {
      console.error("Login Error:", err);
      Swal.fire({ title: "เกิดข้อผิดพลาด", text: "ไม่สามารถเชื่อมต่อ API ได้", icon: "error" });
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
      <nav className="fixed top-0 w-full bg-white shadow-md p-4 flex justify-between items-center z-50">
        <div className="flex items-center">
          <img className="h-12" src={Logo} alt="CTN PHRAE" />
          <span className="ml-2 text-xl font-semibold text-gray-700">CTN PHRAE</span>
        </div>
        <div>
          <ul className="flex space-x-6">
            <li><a href="/" className="text-gray-600 hover:text-blue-500">HOME</a></li>
            <li><a href="/LoginPage" className="text-gray-600 hover:text-blue-500">SIGN IN</a></li>
          </ul>
        </div>
      </nav>

      <div className="bg-white p-8 rounded-lg shadow-lg w-96 mt-10">
        <h2 className="text-2xl font-bold text-center text-gray-700">Sign in</h2>
        <form className="mt-4" onSubmit={handleSubmit}>
          <input
            className="w-full p-3 border rounded mt-3 focus:ring focus:ring-blue-300"
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full p-3 border rounded mt-3 focus:ring focus:ring-blue-300"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-gray-600">จดจำฉัน</label>
            </div>
            <button type="button" className="text-blue-500 hover:underline" onClick={handleForgotPassword}>
              ลืมรหัสผ่าน?
            </button>
          </div>
          <button className="w-full bg-blue-500 text-white py-2 mt-4 rounded hover:bg-blue-600 transition" type="submit">
            Confirm!
          </button>
        </form>
      </div>
    </div>
    
  );
};

export default LoginPage;
