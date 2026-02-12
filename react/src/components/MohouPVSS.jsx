import React, { useState, useEffect, useRef } from 'react'; // เพิ่ม useRef
import Sidebar from './Sidebar';
import axios from 'axios';
import { ArrowLeft,Printer } from "lucide-react";
import { useParams, useLocation, useNavigate } from 'react-router-dom';

function Mohou() {
    const { planid } = useParams(); // ดึงค่า planid จาก URL
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const navigate = useNavigate();

    // ดึงค่าจาก query parameters
    const course = searchParams.get('course');
    const year = searchParams.get('year');
    const student_id = searchParams.get('student_id');

    // ตั้งค่า state เริ่มต้นจากค่าที่ดึงมาจาก URL
    const [selectedCourse, setSelectedCourse] = useState(course || "");
    const [selectedYear, setSelectedYear] = useState(year || "");
    const [selectedStudentId, setSelectedStudentId] = useState(student_id || "");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [subjectData, setSubjectData] = useState([]); // เก็บข้อมูล subject ที่ดึงมา
    const [error, setError] = useState(null); // เก็บ error หากเกิดข้อผิดพลาด
    const printRef = useRef(null);

    const [creditA, setCreditA] = useState(0); // เงื่อนไข A
    const [creditB, setCreditB] = useState(0); // เงื่อนไข B
    const [creditC, setCreditC] = useState(0); // เงื่อนไข C
    const [creditD, setCreditD] = useState(0); // เงื่อนไข D
    const [creditE, setCreditE] = useState(0); // เงื่อนไข E
    const [creditF, setCreditF] = useState(0); // เงื่อนไข F
    const [creditG, setCreditG] = useState(0); // เงื่อนไข F
    const [totalRemedial, setCreditRemedial] = useState(0); 
    const [totalCredits, setTotalCredits] = useState(0); // คำนวณรวมหน่วยกิตทั้งหมด

    useEffect(() => {
        const fetchSubjectData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/server/api/GET/get_mohou.php`, {
                    params: { planid }
                });
    
                console.log("Response data: ", response.data);
                // กรองข้อมูลโดยเปลี่ยนเป็น Number เพื่อให้แน่ใจว่าการเปรียบเทียบตรงกัน
                const filteredData = response.data.filter(
                    subject => Number(subject.planid) === Number(planid)
                );
    
                setSubjectData(filteredData);
                console.log("Subject data: ", filteredData);
    
                // คำนวณ Credit ตามเงื่อนไข
                const totalA = filteredData.reduce((total, subject) => {
                    if (
                        subject.subject_category === "1.หมวดวิชาสมรรถนะแกนกลาง" &&
                        subject.subject_groups === "1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"
                    ) {
                        return total + Number(subject.credit);
                    }
                    return total;
                }, 0);
    
                const totalB = filteredData.reduce((total, subject) => {
                    if (
                        subject.subject_category === "1.หมวดวิชาสมรรถนะแกนกลาง" &&
                        subject.subject_groups === "1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"
                    ) {
                        return total + Number(subject.credit);
                    }
                    return total;
                }, 0);
    
                const totalC = filteredData.reduce((total, subject) => {
                    if (
                        subject.subject_category === "1.หมวดวิชาสมรรถนะแกนกลาง" &&
                        subject.subject_groups === "1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"
                    ) {
                        return total + Number(subject.credit);
                    }
                    return total;
                }, 0);
    
                const totalD = filteredData.reduce((total, subject) => {
                    if (
                        subject.subject_category === "2.หมวดวิชาสมรรถนะวิชาชีพ" &&
                        subject.subject_groups === "2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"
                    ) {
                        return total + Number(subject.credit);
                    }
                    return total;
                }, 0);
    
                const totalE = filteredData.reduce((total, subject) => {
                    if (
                        subject.subject_category === "2.หมวดวิชาสมรรถนะวิชาชีพ" &&
                        subject.subject_groups === "2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"
                    ) {
                        return total + Number(subject.credit);
                    }
                    return total;
                }, 0);
    
                const totalF = filteredData.reduce((total, subject) => {
                    if (subject.subject_category === "3.หมวดวิชาเลือกเสรี") {
                        return total + Number(subject.credit);
                    }
                    return total;
                }, 0);
    
                const totalG = filteredData.reduce((total, subject) => {
                    if (subject.subject_category === "4.กิจกรรมเสริมหลักสูตร") {
                        return total + Number(subject.credit);
                    }
                    return total;
                }, 0);
    
                // คำนวณหน่วยกิตของ "รายวิชาปรับพื้นฐาน"
                const totalRemedial = filteredData.reduce((total, subject) => {
                    if (
                        subject.subject_category === "รายวิชาปรับพื้นฐาน"
                    ) {
                        return total + Number(subject.credit);
                    }
                    return total;
                }, 0);
    
                // ตั้งค่า state สำหรับ Credit
                setCreditA(totalA);
                setCreditB(totalB);
                setCreditC(totalC);
                setCreditD(totalD);
                setCreditE(totalE);
                setCreditF(totalF);
                setCreditG(totalG);
    
                // ตั้งค่าหน่วยกิตของรายวิชาปรับพื้นฐาน
                setCreditRemedial(totalRemedial);
    
                // คำนวณหน่วยกิตรวม
                const total = totalA + totalB + totalC + totalD + totalE + totalF + totalRemedial ;
                setTotalCredits(total);
    
            } catch (error) {
                setError('ไม่สามารถดึงข้อมูลได้');
                console.error("Error fetching data: ", error);
            }
        };
    
        fetchSubjectData();
    }, [planid, API_BASE_URL]);
    

    console.log("Credit A: ", creditA);
    console.log("Credit D: ", creditD);
    console.log("Credit E: ", creditE);
    console.log("Credit F: ", creditF);
    console.log("Credit G: ", creditG);
    





    const sum = (creditA + creditB+creditC);
    const sum2 = (creditD + creditE);
    const sum3 = (creditA + creditB+creditC+creditD+creditE+creditF);
    console.log(sum);
    console.log(sum2);
    console.log(sum3);
    
    const handleBack = () => {
        navigate(-1);
    };

    // ✅ ฟังก์ชันพิมพ์เฉพาะส่วนของแผนการเรียน
    const handlePrint = () => {
        // เก็บ content เดิม
        const originalContent = document.body.innerHTML;
        
        // แทนที่ content ด้วยส่วนที่ต้องการพิมพ์
        const printContent = printRef.current.innerHTML;
        document.body.innerHTML = `
            <style>
                /* CSS สำหรับการพิมพ์ */
                * {
                    color: black !important;
                    border-color: black !important;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                th, td {
                    border: 1px solid black;
                    padding: 8px;
                    text-align: center;
                }
                .text-red-500,
                .text-green-500,
                .text-gray-700 {
                    color: black !important;
                }
            </style>
            ${printContent}
        `;
        
        // พิมพ์และคืนค่า content เดิม
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };
    

    return (
        <div className="flex h-screen">
            <div className="w-72 fixed h-full text-white">
                <Sidebar />
            </div>

            <div className="flex-1 ml-72 p-6 overflow-auto">
            <button onClick={handleBack} className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                    <ArrowLeft size={20} />
                    <span className="font-medium">ย้อนกลับ</span>
                </button>
                <h1 className="text-2xl font-bold text-center mb-6">ดูแบบสรุปโครงสร้างหลักสูตร</h1>

                <div ref={printRef} className="print-area">

                {/* ข้อความเพิ่มเติม */}
                <div className="text-center mt-6 text-lg text-black-700">
                    <label className="flex justify-center">แบบสรุปโครงสร้างหลักสูตร</label>
                    <p>
                        <span className="text-red-500">{selectedCourse} </span> 
                        พุทธศักราช <span className="text-red-500">{selectedYear}</span> ใช้สำหรับนักศึกษา 
                        รหัส <span className="text-red-500">{selectedStudentId}</span>
                    </p>
                    <p>ประเภทวิชา อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ</p>
                    <p>กลุ่มอาชีพ ฮาร์ดแวร์ สาขาวิชา เทคโนโลยีคอมพิวเตอร์</p>
                    <p>วิทยาลัยเทคนิคแพร่</p>
                </div>
         
                <div className="flex flex-row mt-6">
    {/* ข้อความเพิ่มเติมด้านซ้าย */}
    <div className="mt-8 text-lg text-black-700 w-1/2">
        <p>หมวดวิชา</p>
        <p><strong>1. หมวดวิชาสรรถนะแกนกลาง  (ไม่น้อยกว่า)</strong></p>
        <p className="ml-4 mt-2">1.1. กลุ่มสมรรถนะภาษาและการสื่อสาร (ไม่น้อยกว่า)</p>
        <p className="ml-4 mt-2">1.2. กลุ่มสมรรถนะการคิดและการแก้ปัญหา (ไม่น้อยกว่า)</p>
        <p className="ml-4 mt-2">1.3. กลุ่มสมรรถนะสังคมและการดำรงชีวิต (ไม่น้อยกว่า)</p>
        
        <p className="mt-2"><strong>รายวิชาปรับพื้นฐาน</strong></p> {/* เพิ่ม mt-4 ที่นี่ */}

        <p className="mt-2"><strong>2. หมวดวิชาสมรรถนะวิชาชีพ (ไม่น้อยกว่า)</strong></p>
        <p className="ml-4 mt-2">2.1. กลุ่มสมรรถนะวิชาชีพพื้นฐาน (ไม่น้อยกว่า)</p>
        <p className="ml-4 mt-2">2.2. กลุ่มสมรรถนะวิชาชีพเฉพาะ (ไม่น้อยกว่า)</p>

        <p className="mt-2"><strong>3. หมวดวิชาเลือกเสรี (ไม่น้อยกว่า)</strong></p>
        <p className="mt-2"><strong>รวมหน่วยกิตทั้งหมด (ไม่น้อยกว่า)</strong></p>

        <p className="mt-3"><strong>4. กิจกรรมเสริมหลักสูตร</strong></p>
    </div>  



                    {/* ตาราง */}
                    <div className="w-1/2 overflow-x-auto">
                        <table className="table-auto border-collapse border border-gray-800 text-sm max-w-4xl mx-auto">
                            <thead>
                                <tr>
                                    <th className="border border-gray-800 px-4 py-2">โครงสร้างหลักสูตรกำหนด</th>
                                    <th className="border border-gray-800 px-4 py-2"></th>
                                    <th className="border border-gray-800 px-4 py-2">สาขาวิชา/สาขางาน ที่จัดไว้ในแผนการเรียน</th>
                                    <th className="border border-gray-800 px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>

                                <tr>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black font-bold">15</td>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    <th className={`border border-gray-800 px-4 py-2 text-center ${
                                        (creditA + creditB + creditC) !== 15 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {creditA + creditB + creditC}
                                    </th>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                </tr>
                             
                                <tr>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black font-bold">6</td>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    <th className={`border border-gray-800 px-4 py-2 text-center ${
                                        creditA !== 6 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {creditA}
                                    </th>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                </tr>

                                <tr>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black font-bold">6</td>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    <th className={`border border-gray-800 px-4 py-2 text-center ${
                                        creditB !== 6 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {creditB}
                                    </th>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                </tr>

                                <tr>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black font-bold">3</td>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    <th className={`border  border-gray-800 px-4 py-2 text-center ${
                                        creditC !== 3 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {creditC}
                                    </th>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black font-bold">15</td>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    <th className={`border border-gray-800 px-4 py-2 text-center ${
                                        totalRemedial !== 15 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {totalRemedial}
                                    </th>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                </tr>

                                <tr>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black font-bold">60</td>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    <th className={`border border-gray-800 px-4 py-2 text-center ${
                                        (creditD + creditE) !== 60 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {creditD + creditE}
                                    </th>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                </tr>
        
                                <tr>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black font-bold">34</td>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    <th className={`border  border-gray-800 px-4 py-2 text-center ${
                                        creditD !== 34 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {creditD}
                                    </th>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                </tr>

                                <tr>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black font-bold">26</td>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    <th className={`border  border-gray-800 px-4 py-2 text-center ${
                                        creditE !== 26 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {creditE}
                                    </th>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                </tr>

                                <tr>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black font-bold">5</td>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    <th className={`border border-gray-800 px-4 py-2 text-center ${
                                        creditF !== 5 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                        {creditF}
                                    </th>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                </tr>

                                    <tr>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black font-bold">95</td>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    <th className={`border border-gray-800 px-4 py-2 text-center ${
                                    (creditA + creditB + creditC + creditD + creditE + creditF + totalRemedial) !== 95 ? 'text-red-500' : 'text-green-500'
                                    }`}>
                                    {creditA + creditB + creditC + creditD + creditE + creditF + totalRemedial}
                                    </th>
                                    <td className="border border-gray-800 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                    </tr>
                                    <tr>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black font-bold">36</td>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black">ชั่วโมง</td>
                                    <th className="border  border-gray-800 px-4 py-2 text-center text-green-500">
                                        36
                                    </th>
                                    <td className="border  border-gray-800 px-4 py-2 text-center text-black">ชั่วโมง</td>
                                </tr>
                            </tbody>
                        </table>
                           {/* เพิ่มปุ่มพิมพ์ด้านล่างขวาของตาราง */}
                            <div className="flex justify-end mt-4 print:hidden">
                                <button 
                                     onClick={handlePrint}
                                     className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-all duration-200 cursor-pointer"
                            >
                                     <Printer size={20} />
                                    <span className="font-medium">พิมพ์แบบสรุปโครงสร้างหลักสูตร</span>
                               </button>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    </div>
    );
}

export default Mohou;