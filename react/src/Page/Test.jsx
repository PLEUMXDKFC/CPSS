import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  
import { Link } from "react-router-dom";
import Logo from "../img/logo.png";
import LargeImg from "../img/large-img.jpg";
import DiplomaGif from "../img/diploma.gif";
import BookGif from "../img/book.gif";
import DocumentGif from "../img/document.gif";
import SettingsGif from "../img/settings.gif";
import CodeIcon from "../img/file-earmark-code-fill.svg";
import GitIcon from "../img/git.svg";
import GithubIcon from "../img/github.svg";
import PhpIcon from "../img/filetype-php.svg";

const CPSSHomepage = () => {
  const [title, setTitle] = useState("Course Planning & Scheduling System (CPSS)");
  const navigate = useNavigate();

  useEffect(() => {
    // ดึงค่าจาก localStorage
    const token = localStorage.getItem("token");
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");

    // ตรวจสอบเงื่อนไขก่อน Redirect
    if (token && rememberMe && savedUsername && savedPassword) {
      navigate("/Createstudyplan");
    }

    // เปลี่ยนข้อความทุก 5 วินาที
    const interval = setInterval(() => {
      setTitle((prevTitle) =>
        prevTitle === "Course Planning & Scheduling System (CPSS)"
          ? "ระบบวางแผนหลักสูตรและตารางเรียน (CPSS)"
          : "Course Planning & Scheduling System (CPSS)"
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <>
      <nav className="fixed top-0 w-full bg-white shadow-md p-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <img className="h-10" src={Logo} alt="Logo" />
          <span className="text-xl font-bold">CTN PHRAE</span>
        </div>
        <ul className="flex gap-6 text-lg">
          <li><Link to="/" className="hover:text-blue-600">HOME</Link></li>
          <li><Link to="/view-plan" className="hover:text-blue-600">VIEW PLANING</Link></li>
          <li><Link to="/LoginPage" className="hover:text-blue-600">SIGN IN</Link></li>
        </ul>
      </nav>
      
      <header className="flex flex-col items-center text-center py-20 bg-gray-100 mt-16">
        <h1 className="text-4xl font-bold text-blue-600">{title}</h1>
        <p className="mt-4 text-lg">You can plan your course and schedule classes on this website.</p>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <img className="w-full rounded-lg shadow-lg" src={LargeImg} alt="Main" />
          <div className="text-lg">
            <h2 className="text-2xl font-bold mb-3">ระบบวางแผนหลักสูตรและตารางเรียน (CPSS)</h2>
            <p>ระบบที่ช่วยบริหารจัดการหลักสูตรและตารางเรียนของมหาวิทยาลัย หรือสถาบันการศึกษา ลดปัญหาตารางเรียนซ้อนกัน...</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          {[{ img: DiplomaGif, title: "การวางแผนหลักสูตร", desc: "ระบบช่วยจัดการหลักสูตรให้เหมาะสมกับโครงสร้างการเรียนของนักศึกษา" },
            { img: BookGif, title: "การจัดตารางเรียน", desc: "ปรับแต่งตารางเรียนอัตโนมัติ ลดความซ้ำซ้อน และจัดการห้องเรียนอย่างมีประสิทธิภาพ" },
            { img: DocumentGif, title: "ระบบการจัดกลุ่มและภาคเรียน", desc: "รองรับการจัดกลุ่มและภาคเรียนของนักศึกษา" },
            { img: SettingsGif, title: "การบริหารจัดการ", desc: "ช่วยผู้ดูแลระบบปรับปรุงและบริหารจัดการข้อมูลการเรียนการสอนได้อย่างมีประสิทธิภาพ" }
          ].map((item, index) => (
            <div key={index} className="flex items-center bg-white shadow-lg rounded-lg p-5">
              <img src={item.img} className="w-20 h-20 mr-4 rounded-md" alt={item.title} />
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}  
        </div>
      </main>

      <footer className="bg-gray-900 text-white text-center py-6 mt-10">
        <div className="flex justify-center gap-5 mb-4">
          {[CodeIcon, GitIcon, GithubIcon, PhpIcon].map((icon, i) => (
            <img key={i} src={icon} className="h-10" alt="icon" />
          ))}
        </div>
        <p>© 2024 CTN PHRAE DESIGN BY CTN TEAM</p>
      </footer>
    </>
  );
};

export default CPSSHomepage;
