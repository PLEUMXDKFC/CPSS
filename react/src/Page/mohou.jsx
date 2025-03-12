import React, { useState } from 'react';
import Sidebar from '../components/sidebar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { LucideEdit, LucideEye, LucideTrash, LucideCheck, LucideX } from 'lucide-react';

function Mohou() {
    // ใช้ useState จัดการค่าที่เลือก
    const [selectedCourse, setSelectedCourse] = useState("ประกาศนียบัตร");
    const [selectedYear, setSelectedYear] = useState("2568");
    const [selectedStudentId, setSelectedStudentId] = useState("70");
    const [selectedGroup, setSelectedGroup] = useState("1");

    // ฟังก์ชันตรวจสอบเงื่อนไขหน่วยกิต
    const isCreditMatch = (requiredCredit, providedCredit) => {
        return requiredCredit === providedCredit;
    };

    return (
        <div className="flex h-screen">
            <div className="w-72 fixed h-full text-white">
                <Sidebar />
            </div>

            <div className="flex-1 ml-72 p-6 overflow-auto">
                <h1 className="text-2xl font-bold text-center mb-6">ดูโครงสร้างแผนการเรียน</h1>

                {/* Dropdowns */}
                <div className="flex justify-center gap-4 mb-6 text-lg">
                    <label className="flex items-center">หลักสูตร</label>
                    <select 
                        className="border border-black p-2 text-base rounded-lg text-red-500"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        <option>ประกาศนียบัตร</option>
                        <option>อนุปริญญา</option>
                        <option>ปริญญาตรี</option>
                    </select>

                    <label className="flex items-center">พุทธศักราช</label>
                    <select 
                        className="border border-black p-2 text-base rounded-lg text-red-500"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <option>2568</option>
                        <option>2569</option>
                        <option>2570</option>
                        <option>2571</option>
                        <option>2572</option>
                    </select>

                    <label className="flex items-center">รหัสนักศึกษา</label>
                    <select 
                        className="border border-black p-2 text-base rounded-lg text-red-500"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                        <option>68</option>
                        <option>69</option>
                        <option>70</option>
                        <option>71</option>
                        <option>72</option>
                    </select>

                    <label className="flex items-center">กลุ่ม</label>
                    <select 
                        className="border border-black p-2 text-base rounded-lg text-red-500"
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>1-2</option>
                    </select>
                </div>

                {/* ข้อความเพิ่มเติม */}
                <div className="text-center mt-6 text-lg text-gray-700">
                    <label className="flex justify-center">แบบสรุปโครงสร้างหลักสูตร</label>
                    <p>
                        หลักสูตร <span className="text-red-500">{selectedCourse} </span> 
                        พุทธศักราช <span className="text-red-500">{selectedYear}</span> ใช้สำหรับนักศึกษา 
                        รหัสนักศึกษา <span className="text-red-500">{selectedStudentId}</span> กลุ่ม 
                        <span className="text-red-500">{selectedGroup}</span>
                    </p>
                    <p>ประเภทวิชา อุตสาหกรรมดิจิทัลและเทคโนโลยีสารสนเทศ</p>
                    <p>กลุ่มอาชีพ ฮาร์ดแวร์ สาขาวิชา ข้างเทคนิคคอมพิวเตอร์</p>
                    <p>วิทยาลัยเทคนิคแพร่</p>
                </div>

                <div className="flex flex-row mt-6">
                    {/* ข้อความเพิ่มเติมด้านซ้าย */}
                    <div className="mt-6 text-lg text-gray-700 w-1/2">
                        <p><strong>1. หมวดวิชาสะสมเน้นกลาง (ไม่น้อยกว่า)</strong></p>
                        <p className="ml-4">1.1. กลุ่มสมรรถนะภาษาและการสื่อสาร (ไม่น้อยกว่า)</p>
                        <p className="ml-4">1.2. กลุ่มสมรรถนะการคิดและการแก้ปัญหา (ไม่น้อยกว่า)</p>
                        <p className="ml-4">1.3. กลุ่มสมรรถนะสังคมและการดำรงชีวิต (ไม่น้อยกว่า)</p>

                        <p className="mt-4"><strong>2. หมวดวิชาสะสมวิชาชีพ (ไม่น้อยกว่า)</strong></p>
                        <p className="ml-4">2.1. กลุ่มสมรรถนะวิชาชีพพื้นฐาน (ไม่น้อยกว่า)</p>
                        <p className="ml-4">2.2. กลุ่มสมรรถนะวิชาชีพเฉพาะ (ไม่น้อยกว่า)</p>

                        <p className="mt-4"><strong>3. หมวดวิชาเลือกเสรี (ไม่น้อยกว่า)</strong></p>
                        <p className="mt-4"><strong>รวมหน่วยกิตทั้งหมด (ไม่น้อยกว่า)</strong></p>

                        <p className="mt-4"><strong>5. กิจกรรมเสริมหลักสูตร</strong></p>
                    </div>

                    {/* ตาราง */}
                    <div className="w-1/2 overflow-x-auto">
                        <table className="table-auto border-collapse border border-gray-300 text-sm max-w-4xl mx-auto">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2">โครงสร้างหลักสูตรกำหนด</th>
                                    <th className="border border-gray-300 px-4 py-2"></th>
                                    <th className="border border-gray-300 px-4 py-2">สาขาวิชา/สาขางาน ที่จัดไว้ในแผนการเรียน</th>
                                    <th className="border border-gray-300 px-4 py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { required: 20, provided: 20 },
                                    { required: 2, provided: 10 },
                                    { required: 6, provided: 6 },
                                    { required: 5, provided: 5 },
                                    { required: 70, provided: 70 },
                                    { required: 34, provided: 34 },
                                    { required: 36, provided: 36 },
                                    { required: 10, provided: 10 },
                                    { required: 100, provided: 100 },
                                    { required: 36, provided: 36 },
                                ].map((row, index) => (
                                    <tr key={index}>
                                        <td className={`border border-gray-300 px-4 py-2 text-center text-black ${
                                            isCreditMatch(row.required, row.provided) ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            {row.required}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-black">หน่วยกิต</td>
                                        <td className={`border border-gray-300 px-4 py-2 text-center ${
                                            isCreditMatch(row.required, row.provided) ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            {row.provided}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">หน่วยกิต</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Mohou;