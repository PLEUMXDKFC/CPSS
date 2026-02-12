import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp } from "lucide-react";
import axios from "axios";
import Sidebar from "../components/sidebar";
import CourseTable from "../components/Tableinfo";
import Swal from "sweetalert2";

function Courseinfo() {
  const { planid } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState("");
  const [year, setYear] = useState(null);
  const [previousPlanid, setPreviousPlanid] = useState(null);
  const [previousCourse, setPreviousCourse] = useState(null); // เพิ่มตัวแปรเก็บหลักสูตรของปีก่อนหน้า
  const [previousStudentId, setPreviousStudentId] = useState(null); // เพิ่มตัวแปรเก็บรหัสปีการศึกษา (student_id) ของปีก่อนหน้า
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 📌 ฟังก์ชันสำหรับดึงข้อมูลหลักสูตร
  const fetchCourseInfo = () => {


    axios.get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php?planid=${planid}`)
      .then((response) => {


        // Debug type matching


        const foundPlan = response.data.find((plan) => String(plan.planid) === String(planid));



        if (foundPlan) {
          setYear(foundPlan.year);
          setCourse(foundPlan.course.trim());
          setStudentId(foundPlan.student_id);
          setRefreshKey(Date.now()); // รีเฟรช key
        } else {
          console.warn("⚠️ Plan not found! Please check if the planid correct.");
        }
      })
      .catch((error) => {
        console.error("Error fetching course:", error);
        setCourse("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      });
  };

  useEffect(() => {
    fetchCourseInfo();
  }, [planid]);


  // ดึงข้อมูลแผนการเรียนของปีที่แล้ว
  useEffect(() => {
    if (studentId) {
      const previousStudentId = parseInt(studentId) - 1;
      axios.get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php`)
        .then((response) => {


          // หา planid ของปีที่แล้วที่มี student_id น้อยกว่า 1 และชื่อหลักสูตรตรงกัน (หรือใกล้เคียง)
          const foundPrevPlan = response.data.find((plan) => {
            const planCourse = plan.course.trim().toLowerCase();
            const currentCourse = course.trim().toLowerCase();
            return (
              Number(plan.student_id) === previousStudentId &&
              planCourse === currentCourse
            );
          });



          if (foundPrevPlan) {
            setPreviousPlanid(foundPrevPlan.planid);
            setPreviousCourse(foundPrevPlan.course.trim());
            setPreviousStudentId(foundPrevPlan.student_id);
          } else {
            setPreviousPlanid(null);
            setPreviousCourse(null);
            setPreviousStudentId(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching previous year plan:", error);
        });
    }
  }, [studentId, course]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddPreviousCourse = async () => {
    if (!previousPlanid) {
      Swal.fire("แจ้งเตือน", "ไม่พบข้อมูลปีที่แล้ว", "warning");
      return;
    }

    // ดึงรายวิชาของปีที่แล้วมาแสดงให้เลือก
    setIsProcessing(true);
    axios.get(`${API_BASE_URL}/server/api/GET/Getstudyplan.php?planid=${previousPlanid}&mode=subjects`)
      .then((response) => {
        setIsProcessing(false);
        if (response.data && response.data.length > 0) {
          setAvailableSubjects(response.data);
          setSelectedSubjects([]); // รีเซ็ตการเลือก
          setShowConfirm(false); // ปิด modal ยืนยันเดิม
          setShowSelectionModal(true); // เปิด modal เลือกรายวิชา
        } else {
          Swal.fire("แจ้งเตือน", "ไม่พบรายวิชาในหลักสูตรที่แล้ว", "info");
        }
      })
      .catch((error) => {
        setIsProcessing(false);
        console.error("Error fetching subjects:", error);
        Swal.fire("ผิดพลาด", "ไม่สามารถดึงข้อมูลรายวิชาได้", "error");
      });
  };

  const handleToggleSubject = (subjectId) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSubjects(availableSubjects.map(s => s.subject_id));
    } else {
      setSelectedSubjects([]);
    }
  };

  const handleSaveSelectedSubjects = () => {
    if (selectedSubjects.length === 0) {
      Swal.fire("แจ้งเตือน", "กรุณาเลือกรายวิชาอย่างน้อย 1 วิชา", "warning");
      return;
    }

    setIsProcessing(true);
    axios.post(`${API_BASE_URL}/server/api/POST/CopyPreviousCourse.php`, {
      currentPlanid: planid,
      selectedSubjects: selectedSubjects
    })
      .then((response) => {
        setIsProcessing(false);
        if (response.data.success) {
          Swal.fire("สำเร็จ", "เพิ่มข้อมูลรายวิชาเรียบร้อยแล้ว", "success").then(() => {
            fetchCourseInfo(); // รีเฟรชหน้า
          });
          setShowSelectionModal(false);
        } else {
          Swal.fire("ผิดพลาด", response.data.message || "เกิดข้อผิดพลาดในการบันทึก", "error");
        }
      })
      .catch((error) => {
        setIsProcessing(false);
        console.error("Error saving subjects:", error);
        Swal.fire("ผิดพลาด", "เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
      });
  };



  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-65 container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
            <ArrowLeft size={20} />
            <span className="font-medium">ย้อนกลับ</span>
          </button>
          {previousPlanid && course && previousCourse &&
            course === previousCourse && (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 text-lg rounded-md"
              >
                <ArrowUp size={20} />
                ใช้ข้อมูลจากปีที่แล้ว
              </button>
            )}
        </div>


        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">ดึงข้อมูลจากปีที่แล้ว</h2>
              <p className="mb-4">
                คุณต้องการดึงข้อมูลรายวิชาจาก {course} รหัส {previousStudentId} (ปีนี้รหัส {studentId}) หรือไม่?
              </p>
              <div className="flex justify-between">
                <button onClick={handleAddPreviousCourse} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  ตรวจสอบและเลือกรายวิชา
                </button>
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal เลือกรายวิชา */}
        {showSelectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">เลือกรายวิชาที่จะนำเข้า</h2>
                <button onClick={() => setShowSelectionModal(false)} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
              </div>

              <div className="overflow-y-auto flex-grow mb-4 border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสวิชา</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อวิชา</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ท</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ป</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">น</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={availableSubjects.length > 0 && selectedSubjects.length === availableSubjects.length}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableSubjects.map((subject) => (
                      <tr key={subject.subject_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.course_code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.course_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.theory}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.comply}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.credit}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes(subject.subject_id)}
                            onChange={() => handleToggleSubject(subject.subject_id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-2 border-t">
                <div className="flex-1 text-sm text-gray-500 flex items-center">
                  เลือก {selectedSubjects.length} จาก {availableSubjects.length} รายวิชา
                </div>
                <button
                  onClick={() => setShowSelectionModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveSelectedSubjects}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  บันทึกข้อมูล ({selectedSubjects.length})
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
        <CourseTable key={refreshKey + "_group1"} planid={planid} subject_groups={"1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"} subject_category={"1.หมวดวิชาสมรรถนะแกนกลาง"} />

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
        <CourseTable key={refreshKey + "_group2"} planid={planid} subject_groups={"1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"} subject_category={"1.หมวดวิชาสมรรถนะแกนกลาง"} />

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
        <CourseTable key={refreshKey + "_group3"} planid={planid} subject_groups={"1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"} subject_category={"1.หมวดวิชาสมรรถนะแกนกลาง"} />

        {course === "หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง (ม.6)" && (
          <div className="mt-5">
            <span className="text-lg ml-5 font-bold">รายวิชาปรับพื้นฐาน</span>
            <Link
              to={`/courseadd?category=${encodeURIComponent("รายวิชาปรับพื้นฐาน")}&subcategory=${encodeURIComponent("")}&planid=${planid}`}
              className="ml-5 text-blue-500 text-lg"
            >
              เพิ่มข้อมูลรายวิชา
            </Link>
            <CourseTable key={refreshKey + "_group4"} planid={planid} subject_groups={""} subject_category={"รายวิชาปรับพื้นฐาน"} />
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
          <CourseTable key={refreshKey + "_group5"} planid={planid} subject_groups={"2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"} subject_category={"2.หมวดวิชาสมรรถนะวิชาชีพ"} />

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
          <CourseTable key={refreshKey + "_group6"} planid={planid} subject_groups={"2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"} subject_category={"2.หมวดวิชาสมรรถนะวิชาชีพ"} />
        </div>

        <div className='mt-5'>
          <span className='text-lg ml-5 font-bold'>3.หมวดวิชาเลือกเสรี</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent('3.หมวดวิชาเลือกเสรี')}&subcategory=${encodeURIComponent('')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
            className='ml-5 text-blue-500 text-lg'
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
          <CourseTable key={refreshKey + "_group7"} planid={planid} subject_groups={""} subject_category={"3.หมวดวิชาเลือกเสรี"} />
        </div>

        <div className='mt-5'>
          <span className='text-lg ml-5 font-bold'>4.กิจกรรมเสริมหลักสูตร</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent('4.กิจกรรมเสริมหลักสูตร')}&subcategory=${encodeURIComponent('')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
            className='ml-5 text-blue-500 text-lg'
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
          <CourseTable key={refreshKey + "_group8"} planid={planid} subject_groups={""} subject_category={"4.กิจกรรมเสริมหลักสูตร"} />
        </div>

      </div>
    </div>
  );
}

export default Courseinfo;