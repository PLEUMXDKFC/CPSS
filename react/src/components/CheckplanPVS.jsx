import React, { useState, useEffect , useMemo ,useRef } from 'react'; 
import Sidebar from './Sidebar';
import axios from 'axios';
import { ArrowLeft, Printer } from "lucide-react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function CheckplanPVS() {
    const navigate = useNavigate();
    const location = useLocation(); // ใช้ useLocation เพื่อเข้าถึง query parameters
    const [courseData, setCourseData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [groupNames, setGroupNames] = useState([]);
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const queryParams = new URLSearchParams(location.search);
    const planid = queryParams.get('planid');
    const course = queryParams.get('course');
    const year = queryParams.get('year');
    const studentId = queryParams.get('student_id');

     const printRef = useRef(null);
    
         // ✅ ฟังก์ชันพิมพ์เฉพาะส่วนของแผนการเรียน
         const handlePrint = () => {
            const printContent = printRef.current.innerHTML;
            const originalContent = document.body.innerHTML;
    
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
            window.location.reload(); // ✅ รีโหลดหน้าเพื่อคืนค่าเดิม
        };

    const uniqueTerms = useMemo(() => {
        const terms = courseData.map(item => Number(item.term)).filter(Boolean);
        return [...new Set(terms)].sort((a, b) => a - b);
      }, [courseData]);
    
      useEffect(() => {
        if (planid) {
            axios.get(`${API_BASE_URL}/server/api/GET/getcheckplan.php?planid=${planid}`)
                .then(res => {
                    const sortedData = res.data.sort((a, b) => Number(a.term) - Number(b.term));
                    setCourseData(sortedData);
    
                    // ดึง group_name ออกมา แล้ว sort
                    const uniqueGroups = [...new Set(sortedData.map(item => item.group_name))];
    
                    // เรียง group_name จากน้อยไปมาก เช่น 1-1, 1-2, 2-1
                    const sortedGroups = uniqueGroups.sort((a, b) => {
                        const [aMain, aSub] = a.split('-').map(Number);
                        const [bMain, bSub] = b.split('-').map(Number);
    
                        if (aMain !== bMain) return aMain - bMain;
                        return aSub - bSub;
                    });
    
                    setGroupNames(sortedGroups);
    
                    // เลือก default เป็น "1-2" ก่อน ถ้ามี
                    if (sortedGroups.includes("1-2")) {
                        setSelectedGroup("1-2");
                    } else if (sortedGroups.length > 0) {
                        setSelectedGroup(sortedGroups[0]);
                    }
                })
                .catch(err => {
                    console.error("Error loading course data:", err);
                });
        }
    }, [planid]);
    
    const handleBack = () => {
        navigate(-1);
    };

    const processCredits = () => {
        // Initialize credits structure
        const credits = {
            "1.หมวดวิชาสมรรถนะแกนกลาง": {
                "1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร": { terms: {1:0,2:0,3:0,4:0,'S':0,6:0}, total: 0 },
                "1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา": { terms: {1:0,2:0,3:0,4:0,'S':0,6:0}, total: 0 },
                "1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต": { terms: {1:0,2:0,3:0,4:0,'S':0,6:0}, total: 0 }
            },
            "2.หมวดวิชาสมรรถนะวิชาชีพ": {
                "2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน": { terms: {1:0,2:0,3:0,4:0,'S':0,6:0}, total: 0 },
                "2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ": { terms: {1:0,2:0,3:0,4:0,'S':0,6:0}, total: 0 }
            },
            "3.หมวดวิชาเลือกเสรี": { terms: {1:0,2:0,3:0,4:0,'S':0,6:0}, total: 0 }
        };
    
        // Filter courseData by selected group
        const filteredData = selectedGroup 
            ? courseData.filter(item => item.group_name === selectedGroup)
            : courseData;
    
        filteredData.forEach(item => {
            const { term, subject } = item;
            const { subject_category, subject_groups, credit } = subject;
            const numericCredit = Number(credit) || 0;
            
            // Convert 'summer' term to 'S'
            const termKey = term === 'summer' ? 'S' : term;
            
            if (subject_category === "3.หมวดวิชาเลือกเสรี") {
                credits[subject_category].terms[termKey] = 
                    (credits[subject_category].terms[termKey] || 0) + numericCredit;
                credits[subject_category].total += numericCredit;
            } 
            else if (credits[subject_category]?.[subject_groups]) {
                credits[subject_category][subject_groups].terms[termKey] = 
                    (credits[subject_category][subject_groups].terms[termKey] || 0) + numericCredit;
                credits[subject_category][subject_groups].total += numericCredit;
            }
        });
    
        return credits;
    };

// คำนวณหน่วยกิตรวมตาม planid
const getCreditsForPlanid = (planid) => {
    return courseData.filter(item => item.planid === planid)
                     .reduce((acc, curr) => {
                         const { term, subject } = curr;
                         const { credit } = subject;
                         acc[term] = (acc[term] || 0) + credit;
                         return acc;
                     }, {});
};


    const credits = processCredits();
// แก้ไขฟังก์ชัน getTermTotal
const getTermTotal = (term) => {
    let total = 0;
    
    Object.values(credits).forEach(category => {
        if (category.terms) {
            // For direct categories (like หมวดวิชาเลือกเสรี)
            total += Number(category.terms[term]) || 0;
        } else {
            // For nested categories
            Object.values(category).forEach(group => {
                if (group.terms) {
                    total += Number(group.terms[term]) || 0;
                }
            });
        }
    });

    return total || '';
};

// แก้ไขฟังก์ชัน getGrandTotal
const getGrandTotal = () => {
    let total = 0;
    const terms = [1, 2, 3, 4, 'S', 6];
    terms.forEach(term => {
        total += Number(getTermTotal(term)) || 0;
    });
    return total || '';
};
    return (
        <div className="flex h-screen">
            <div className="w-72 fixed h-full text-white">
                <Sidebar />
            </div>

          <div className="flex-1 ml-65 p-6 overflow-auto">
                          <button onClick={handleBack} className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer">
                              <ArrowLeft size={20} />
                              <span className="font-medium">ย้อนกลับ</span>
                          </button>
                          {groupNames.length > 1 && (
                          <div className="mb-4 flex justify-end items-center gap-2">
                              <label htmlFor="groupSelect" className="text-gray-700 font-medium">
                                  เลือกกลุ่ม:
                              </label>
                              <select 
                                  id="groupSelect"
                                  value={selectedGroup}
                                  onChange={(e) => setSelectedGroup(e.target.value)}
                                  className="border rounded-md px-3 py-2 text-gray-700"
                              >
                                  {groupNames.sort((a, b) => a.localeCompare(b)).map(group => (
                                      <option key={group} value={group}>
                                          {group}
                                      </option>
                                  ))}
                              </select>
                          </div>
                      )}
                <div ref={printRef} className="print-area">
                <h1 className="text-xl font-bold text-center mb-6">ใบตรวจเช็คการจัดแผนการเรียน</h1>
                <table className="w-full border-collapse text-sm text-center text-black mb-6 ">
                    <thead className="font-bold">
                        <tr>
                            <td colSpan="8" className="border  align-top">
                                <p className="pt-2">แผนการจัดการเรียน</p>
                                <p className="pt-2">
                                    <label id="level-info1">หลักสูตร ปวส.{year}</label> {/* แสดงข้อมูลจาก URL */}
                                     <label id="semester-info1">
                                        สำหรับนักเรียนรหัส {studentId} {groupNames.length > 1 && selectedGroup && `ก.${selectedGroup}`}
                                    </label>
                                </p>
                                <p className="pt-2">ประเภทวิชา อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ</p>
                                <p className="pt-2">กลุ่มอาชีพ ฮาร์ดแวร์</p>
                                <p className="pt-2">สาขาวิชา เทคโนโลยีคอมพิวเตอร์</p>
                                <p className="pt-2">วิทยาลัยเทคนิคแพร่</p>
                                <p className="pt-2" id="semester-info2">ปีการศึกษา {year}</p> {/* แสดงข้อมูลจาก URL */}
                            </td>
                            <td className="w-[20%] border p-4 align-top text-center">
                                <p>โครงสร้างหลักสูตร</p>
                                <p id="semester-info3">ปวส.{year}</p>
                                <p>สำนักงานคณะกรรมการ</p>
                                <p>การอาชีวศึกษา</p>
                                <p>กำหนดไว้</p>
                            </td>
                    </tr>
                    <tr>
                    <td rowSpan="2" className="w-[42%] border p-2 text-center font-semibold">หมวดวิชา</td>
                    <td colSpan="7" className="border p-2 text-center font-semibold">แผนการเรียน</td>
                    <td className="border"></td>
                    </tr>
                     <tr className="text-center">
                    {["ภ.1", "ภ.2", "ภ.3", "ภ.4", "ภ.S", " ", "รวม"].map((term, i) => (
                        <td key={i} className="border p-1 ">{term}</td>
                    ))}
                    <td className="border p-1"></td>
                    </tr>

                </thead>
                <tbody id="table_result">
                    <tr className="font-bold">
                    <td className="border px-2 py-1 text-left border-b-0 ">1.หมวดวิชาสมรรถนะแกนกลาง</td>
                    <td className="border px-2 py-1 border-b-0"></td>
                    <td className="border px-2 py-1 border-b-0"></td>
                    <td className="border px-2 py-1 border-b-0"></td>
                    <td className="border px-2 py-1 border-b-0"></td>
                    <td className="border px-2 py-1 border-b-0"></td>
                    <td className="border px-2 py-1 border-b-0 w-[45px]"></td>
                    <td className="border px-2 py-1 border-b-0"></td>
                    <td className=" border px-2 py-1 font-semibold text-center" id="text3">ไม่น้อยกว่า 15 นก.</td>
                    </tr>
                    <tr>
                    <td className="border px-2 py-1 text-left border-t-0 border-b-0">1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร</td>
                    <td className="border px-2 py-1 border-t-0">
                    {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"]?.terms?.[1] > 0
                    ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].terms[1]
                    : ''}

                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"]?.terms[2] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].terms[2] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"]?.terms[3] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].terms[3] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].terms[4] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].terms[4] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].terms['S'] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].terms['S'] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].terms[6] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].terms[6] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].total > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร"].total 
                            : '0'}
                    </td>
                    <td className="border px-2 py-1 text-left" id="text4">ไม่น้อยกว่า 6</td>
                    </tr>
                    <tr>
                    <td className="border px-2 py-1 text-left border-t-0 border-b-0">1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา</td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"]?.terms[1] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"].terms[1] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"]?.terms[2] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"].terms[2] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"]?.terms[3] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"].terms[3] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"]?.terms[4] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"].terms[4] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"]?.terms['S'] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"].terms['S'] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"]?.terms[6] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"].terms[6] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"]?.total > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา"].total 
                            : '0'}
                    </td>
                    <td className="border px-2 py-1 text-left">ไม่น้อยกว่า 6</td>
                    </tr>
                    <tr>
                    <td className="border px-2 py-1 text-left border-t-0 border-b-0">1.3 กลุ่มสมรรถนะทางสังคมและการดำรงชีวิต</td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"]?.terms[1] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"].terms[1] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"]?.terms[2] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"].terms[2] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"]?.terms[3] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"].terms[3] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"]?.terms[4] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"].terms[4] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"]?.terms['S'] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"].terms['S'] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"]?.terms[6] > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"].terms[6] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["1.หมวดวิชาสมรรถนะแกนกลาง"]?.["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"]?.total > 0 
                            ? credits["1.หมวดวิชาสมรรถนะแกนกลาง"]["1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"].total 
                            : '0'}
                    </td>
                    <td className="border px-2 py-1 text-left" id="text5">ไม่น้อยกว่า 3</td>
                    </tr>
                    <tr className="font-bold">
                    <td className="border px-2 py-1 text-left border-t-0 border-b-0">2.หมวดวิชาสมรรถนะวิชาชีพ</td>
                    <td className="border px-2 py-1 border-t-0"></td>
                    <td className="border px-2 py-1 border-t-0"></td>
                    <td className="border px-2 py-1 border-t-0"></td>
                    <td className="border px-2 py-1 border-t-0"></td>
                    <td className="border px-2 py-1 border-t-0"></td>
                    <td className="border px-2 py-1 border-t-0"></td>
                    <td className="border px-2 py-1 border-t-0"></td>
                    <td className="border px-2 py-1 text-center" id="text6">ไม่น้อยกว่า 60 นก.</td>
                    </tr>
                    <tr>
                    <td className="border px-2 py-1 text-left border-t-0 border-b-0">2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน</td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"]?.terms[1] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"].terms[1] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"]?.terms[2] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"].terms[2] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"]?.terms[3] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"].terms[3] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"]?.terms[4] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"].terms[4] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"]?.terms['S'] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"].terms['S'] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"]?.terms[6] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"].terms[6] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"]?.total > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน"].total 
                            : '0'}
                    </td>
                    <td className="border px-2 py-1 text-left">ไม่น้อยกว่า 34</td>
                    </tr>
                    <tr>
                    <td className="border px-2 py-1 text-left border-t-0 border-b-0">2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ</td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"]?.terms[1] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"].terms[1] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"]?.terms[2] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"].terms[2] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"]?.terms[3] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"].terms[3] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"]?.terms[4] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"].terms[4] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"]?.terms['S'] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"].terms['S'] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"]?.terms[6] > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"].terms[6] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]?.["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"]?.total > 0 
                            ? credits["2.หมวดวิชาสมรรถนะวิชาชีพ"]["2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ"].total 
                            : '0'}
                    </td>
                    <td className="border px-2 py-1 text-left" id="text7">ไม่น้อยกว่า 26</td>
                    </tr>
                    <tr>
                    <td className="border px-2 py-1 text-left border-t-0 border-b-0 font-bold">3.หมวดวิชาเลือกเสรี</td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["3.หมวดวิชาเลือกเสรี"].terms[1] > 0 
                            ? credits["3.หมวดวิชาเลือกเสรี"].terms[1] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["3.หมวดวิชาเลือกเสรี"].terms[2] > 0 
                            ? credits["3.หมวดวิชาเลือกเสรี"].terms[2] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["3.หมวดวิชาเลือกเสรี"].terms[3] > 0 
                            ? credits["3.หมวดวิชาเลือกเสรี"].terms[3] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["3.หมวดวิชาเลือกเสรี"].terms[4] > 0 
                            ? credits["3.หมวดวิชาเลือกเสรี"].terms[4] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["3.หมวดวิชาเลือกเสรี"].terms['S'] > 0 
                            ? credits["3.หมวดวิชาเลือกเสรี"].terms['S'] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["3.หมวดวิชาเลือกเสรี"].terms[6] > 0 
                            ? credits["3.หมวดวิชาเลือกเสรี"].terms[6] 
                            : ''}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {credits["3.หมวดวิชาเลือกเสรี"].total > 0 
                            ? credits["3.หมวดวิชาเลือกเสรี"].total 
                            : '0'}
                    </td>
                    <td className="border px-2 py-1 text-center font-bold" id="text8">ไม่น้อยกว่า 5</td>
                    </tr>
                    <tr>
                    <td className="border px-2 py-1 text-left font-bold border-t-0 border-b-0">4.กิจกรรมเสริมหลักสูตร (2 ชั่วโมงต่อสัปดาห์)</td>
                    <td className="border px-2 py-1 border-t-0">
                        {courseData.filter(item => 
                            item.subject.subject_category === "4.กิจกรรมเสริมหลักสูตร" && 
                            item.term === "1" &&
                            item.group_name === selectedGroup  // เพิ่มเงื่อนไขกรอง group_name
                        ).map(item => item.subject.comply).join(", ") || ""}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {courseData.filter(item => 
                            item.subject.subject_category === "4.กิจกรรมเสริมหลักสูตร" && 
                            item.term === "2" &&
                            item.group_name === selectedGroup
                        ).map(item => item.subject.comply).join(", ") || ""}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {courseData.filter(item => 
                            item.subject.subject_category === "4.กิจกรรมเสริมหลักสูตร" && 
                            item.term === "3" &&
                            item.group_name === selectedGroup
                        ).map(item => item.subject.comply).join(", ") || ""}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {courseData.filter(item => 
                            item.subject.subject_category === "4.กิจกรรมเสริมหลักสูตร" && 
                            item.term === "4" &&
                            item.group_name === selectedGroup
                        ).map(item => item.subject.comply).join(", ") || ""}
                    </td>
                    <td className="border px-2 py-1 border-t-0">
                        {courseData.filter(item => 
                            item.subject.subject_category === "4.กิจกรรมเสริมหลักสูตร" && 
                            item.term === "summer" &&
                            item.group_name === selectedGroup
                        ).map(item => item.subject.comply).join(", ") || ""}
                    </td>
                    <td className="border px-2 py-1 border-t-0"></td>
                    <td className="border px-2 py-1 border-t-0">
                    {courseData
                        .filter(item => 
                            item.subject.subject_category === "4.กิจกรรมเสริมหลักสูตร" &&
                            item.group_name === selectedGroup  // เพิ่มเงื่อนไขกรอง group_name
                        )
                        .reduce((total, item) => total + (parseInt(item.subject.comply) || 0), 0) || "0"}
                    </td>
                    <td className="border px-2 py-1 text-left">2 ชั่วโมงต่อสัปดาห์</td>
                    </tr>
                    <tr className="font-bold text-center">
                    <td className="border px-2 py-1">รวมหน่วยกิต</td>
                    <td className="border px-2 py-1 border-t-0 bg-cyan-100">{getTermTotal(1)}</td>
                    <td className="border px-2 py-1 border-t-0 bg-cyan-100">{getTermTotal(2)}</td>
                    <td className="border px-2 py-1 border-t-0 bg-cyan-100">{getTermTotal(3)}</td>
                    <td className="border px-2 py-1 border-t-0 bg-cyan-100">{getTermTotal(4)}</td>
                    <td className="border px-2 py-1 border-t-0 bg-cyan-100">{getTermTotal('S')}</td>
                    <td className="border px-2 py-1 border-t-0 bg-cyan-100">{getTermTotal(6)}</td>
                    <td className="border px-2 py-1 border-t-0 bg-cyan-100">
                        {getGrandTotal()}
                    </td>
                    <td className="border px-2 py-1 text-center" id="text9">ไม่น้อยกว่า 80 นก.</td>
                    </tr>
                </tbody>
                </table>

                <table className="w-full mt-6 text-center text-base">
                <tbody>
                    <tr>
                    <td className="border-0 w-1/2">.................................................</td>
                    <td className="border-0 w-1/2">.................................................</td>
                    </tr>
                    <tr>
                    <td className="border-0 w-1/2 pt-2 pb-2">หัวหน้าแผนกเทคนิคคอมพิวเตอร์</td>
                    <td className="border-0 w-1/2 pt-2 pb-2">หัวหน้างานพัฒนาหลักสูตรการเรียนการสอน</td>
                    </tr>
                    <tr>
                    <td className="border-0 w-1/2">วันที่.............................</td>
                    <td className="border-0 w-1/2">วันที่.............................</td>
                    </tr>
                </tbody>
                </table>
            </div>
             {/* เพิ่มปุ่มพิมพ์ด้านล่างขวาของตาราง */}
            <div className="flex justify-end mt-4 print:hidden">
                     <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-all duration-200 cursor-pointer"
                        >
                        <Printer size={20} />
                    <span className="font-medium">พิมพ์ใบตรวจเช็คการจัดแผนการเรียน</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CheckplanPVS;