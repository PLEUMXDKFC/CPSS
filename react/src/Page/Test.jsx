import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
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
  const [titleIndex, setTitleIndex] = useState(0);
  const [descIndex, setDescIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const titles = [
    "Course Planning & Scheduling System (CPSS)",
    "ระบบวางแผนหลักสูตรและตารางเรียน (CPSS)",
  ];

  const descriptions = [
    "You can plan your course and schedule classes on this website.",
    "วางแผนหลักสูตรและตารางเรียนของคุณได้อย่างง่ายดายบนเว็บไซต์นี้.",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rememberMe = localStorage.getItem("rememberMe") === "true";
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");

    if (token && rememberMe && savedUsername && savedPassword) {
      navigate("/Createstudyplan");
    }

    const titleInterval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titles.length);
    }, 3000);

    const descInterval = setInterval(() => {
      setDescIndex((prev) => (prev + 1) % descriptions.length);
    }, 3000);

    return () => {
      clearInterval(titleInterval);
      clearInterval(descInterval);
    };
  }, [navigate]);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-3">
            <img className="h-10" src={Logo} alt="Logo" />
            <span className="text-xl font-bold">CTN PHRAE</span>
          </div>

          {/* Hamburger Button */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <HiX size={30} /> : <HiMenu size={30} />}
            </button>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex gap-6 text-lg">
            <li><Link to="/" className="text-blue-600 hover:text-blue-600">หน้าหลัก</Link></li>
            <li><Link to="/intoviewplan" className="hover:text-blue-600">แผนการเรียน</Link></li>
            <li><Link to="/Studyhistorytable" className="hover:text-blue-600">ตารางเรียน (ทั่วไป)</Link></li>
            <li><Link to="/LoginPage" className="hover:text-blue-600">เข้าสู่ระบบ</Link></li>
          </ul>
        </div>

        {/* Mobile Menu */}
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

      {/* Header */}
      <header className="flex flex-col items-center text-center py-20 bg-gray-100 mt-16">
        <h1 className="text-4xl font-bold text-blue-600">{titles[titleIndex]}</h1>
        <p className="mt-4 text-lg transition-opacity duration-500 ease-in-out">
          {descriptions[descIndex]}
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <img className="w-full rounded-lg shadow-lg" src={LargeImg} alt="Main" />
          <div className="text-lg">
            <h2 className="text-2xl font-bold mb-3">ระบบวางแผนหลักสูตรและตารางเรียน (CPSS)</h2>
            <p>
              ระบบที่ช่วยบริหารจัดการหลักสูตรและตารางเรียนของมหาวิทยาลัย หรือสถาบันการศึกษา ลดปัญหาตารางเรียนซ้อนกัน...
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          {[{
            img: DiplomaGif, title: "การวางแผนหลักสูตร",
            desc: "ระบบช่วยจัดการหลักสูตรให้เหมาะสมกับโครงสร้างการเรียนของนักศึกษา"
          }, {
            img: BookGif, title: "การจัดตารางเรียน",
            desc: "ปรับแต่งตารางเรียนอัตโนมัติ ลดความซ้ำซ้อน และจัดการห้องเรียนอย่างมีประสิทธิภาพ"
          }, {
            img: DocumentGif, title: "ระบบการจัดกลุ่มและภาคเรียน",
            desc: "รองรับการจัดกลุ่มและภาคเรียนของนักศึกษา"
          }, {
            img: SettingsGif, title: "การบริหารจัดการ",
            desc: "ช่วยผู้ดูแลระบบปรับปรุงและบริหารจัดการข้อมูลการเรียนการสอนได้อย่างมีประสิทธิภาพ"
          }].map((item, index) => (
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

      {/* Footer */}
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
