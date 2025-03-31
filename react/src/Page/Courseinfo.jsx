import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUp } from "lucide-react"; // ใช้ไอคอนที่เหมาะสม
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sidebar";
import CourseTable from "../components/Tableinfo";

function Courseinfo() {
  const { planid } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState("");
  const [prevCourse, setPrevCourse] = useState(""); // เก็บข้อมูลหลักสูตรของปีที่แล้ว
  const [showConfirm, setShowConfirm] = useState(false); // กำหนดการแสดงหน้าต่างยืนยัน
  const [isProcessing, setIsProcessing] = useState(false); // ใช้เพื่อแสดงสถานะกำลังประมวลผล
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // คำนวณ planid ของปีก่อนหน้า
  const previousPlanid = parseInt(planid) - 1;

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php?planid=${planid}`)
      .then((response) => {
        const foundPlan = response.data.find((plan) => plan.planid === parseInt(planid));
        setCourse(foundPlan?.course?.trim() || "ไม่พบข้อมูลหลักสูตร");
      })
      .catch((error) => {
        console.error("Error fetching course:", error);
        setCourse("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      });

    // ดึงข้อมูลหลักสูตรของปีที่แล้ว
    axios
      .get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php?planid=${previousPlanid}`)
      .then((response) => {
        const foundPrevPlan = response.data.find((plan) => plan.planid === previousPlanid);
        setPrevCourse(foundPrevPlan?.course?.trim() || "ไม่มีข้อมูลปีที่แล้ว");
      })
      .catch((error) => {
        console.error("Error fetching previous course:", error);
        setPrevCourse("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      });
  }, [planid]);

  const handleBack = () => {
    navigate(-1);
  };

  // ฟังก์ชันสำหรับการเพิ่มข้อมูลจากปีที่แล้ว
  const handleAddPreviousCourse = () => {
    setIsProcessing(true);

    // ส่งข้อมูลการเพิ่มไปยัง API
    axios
      .post(`${API_BASE_URL}/server/api/POST/CopyPreviousCourse.php`, {
        currentPlanid: planid,
        previousPlanid: previousPlanid,
      })
      .then((response) => {
        setIsProcessing(false);
        if (response.data.success) {
          alert("ข้อมูลจากปีก่อนหน้าได้ถูกเพิ่มเรียบร้อยแล้ว");
        } else {
          alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
        }
      })
      .catch((error) => {
        setIsProcessing(false);
        console.error("Error adding previous course:", error);
        alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
      });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className='ml-65 container mx-auto p-4'>

      <div className="flex justify-between items-center mb-6">
          <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
            <ArrowLeft size={20} />
            <span className="font-medium">ย้อนกลับ</span>
          </button>

          {/* ปุ่มเพิ่มข้อมูลจากปีที่แล้ว */}
          {previousPlanid > 0 && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 text-lg rounded-md"
            >
              <ArrowUp size={20} />
              ใช้ข้อมูลจากปีที่แล้ว
            </button>
          )}
        </div>

        {/* หน้าต่างยืนยัน */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">ยืนยันการเพิ่มข้อมูลจากปีที่แล้ว</h2>
              <p className="mb-4">คุณต้องการใช้ข้อมูลจากหลักสูตรปีก่อนหน้า  ไปยังหลักสูตรปีปัจจุบันหรือไม่?</p>
              <div className="flex justify-between">
                <button
                  onClick={handleAddPreviousCourse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  ยืนยัน
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {isProcessing && <div className="text-center mt-5">กำลังเพิ่มข้อมูลจากปีที่แล้ว...</div>}

        {/* หัวข้อหลัก */}
        <h1 className='text-center mb-4 text-2xl font-bold'>ข้อมูลรายวิชา</h1>

        {/* หมวดวิชาสมรรถนะแกนกลาง */}
        <span className='text-lg ml-5 font-bold'>1.หมวดวิชาสมรรถนะแกนกลาง</span>
        <div className='ml-10'>
          <br />
          <span className='text-lg ml-5 font-bold'>1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent('1.หมวดวิชาสมรรถนะแกนกลาง')}&subcategory=${encodeURIComponent('1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
            className='ml-5 text-blue-500 text-lg'
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
        </div>
        <CourseTable planid={planid} subject_groups={"1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"}  subject_category={"1.หมวดวิชาสมรรถนะแกนกลาง"}/>

        <div className='ml-10'>
          <br />
          <span className='text-lg ml-5 font-bold'>1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent('1.หมวดวิชาสมรรถนะแกนกลาง')}&subcategory=${encodeURIComponent('1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
            className='ml-5 text-blue-500 text-lg'
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
        </div>
        <CourseTable planid={planid} subject_groups={"1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"}  subject_category={"1.หมวดวิชาสมรรถนะแกนกลาง"}/>

        <div className='ml-10'>
          <br />
          <span className='text-lg ml-5 font-bold'>1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent('1.หมวดวิชาสมรรถนะแกนกลาง')}&subcategory=${encodeURIComponent('1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
            className='ml-5 text-blue-500 text-lg'
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
        </div>
        <CourseTable planid={planid} subject_groups={"1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"}  subject_category={"1.หมวดวิชาสมรรถนะแกนกลาง"}/>
         
        {course === "หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง (ม.6)" && (
        <div className="mt-5">
          <span className="text-lg ml-5 font-bold">รายวิชาปรับพื้นฐาน</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent("รายวิชาปรับพื้นฐาน")}&subcategory=${encodeURIComponent("")}&planid=${planid}`}
            className="ml-5 text-blue-500 text-lg"
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
          <CourseTable planid={planid} subject_groups={""} subject_category={"รายวิชาปรับพื้นฐาน"} />
        </div>
      )}


        <div className='mt-5'>
          <span className='text-lg ml-5 font-bold'>2. หมวดวิชาสมรรถนะวิชาชีพ</span>
          <div className='ml-10'>
            <br />
            <span className='text-lg ml-5 font-bold'>2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน</span>
            <Link
              to={`/courseadd?category=${encodeURIComponent('2.หมวดวิชาสมรรถนะวิชาชีพ')}&subcategory=${encodeURIComponent('2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
              className='ml-5 text-blue-500 text-lg'
            >
              เพิ่มข้อมูลรายวิชา
            </Link>
          </div>
          <CourseTable planid={planid} subject_groups={"2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"}  subject_category={"2.หมวดวิชาสมรรถนะวิชาชีพ"}/>

          <div className='ml-10'>
            <br />
            <span className='text-lg ml-5 font-bold'>2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ</span>
            <Link
              to={`/courseadd?category=${encodeURIComponent('2.หมวดวิชาสมรรถนะวิชาชีพ')}&subcategory=${encodeURIComponent('2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
              className='ml-5 text-blue-500 text-lg'
            >
              เพิ่มข้อมูลรายวิชา
            </Link>
          </div>
          <CourseTable planid={planid} subject_groups={"2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"}  subject_category={"2.หมวดวิชาสมรรถนะวิชาชีพ"}/>
        </div>

        <div className='mt-5'>
          <span className='text-lg ml-5 font-bold'>3.หมวดวิชาเลือกเสรี</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent('3.หมวดวิชาเลือกเสรี')}&subcategory=${encodeURIComponent('')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
            className='ml-5 text-blue-500 text-lg'
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
          <CourseTable planid={planid} subject_groups={""} subject_category={"3.หมวดวิชาเลือกเสรี"} />
        </div>

        <div className='mt-5'>
          <span className='text-lg ml-5 font-bold'>4.กิจกรรมเสริมหลักสูตร</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent('4.กิจกรรมเสริมหลักสูตร')}&subcategory=${encodeURIComponent('')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
            className='ml-5 text-blue-500 text-lg'
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
          <CourseTable planid={planid} subject_groups={""} subject_category={"4.กิจกรรมเสริมหลักสูตร"} />
        </div>

      </div>
      </div>
  );
}

export default Courseinfo;