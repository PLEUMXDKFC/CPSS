import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios';
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';


function Groupinfoform({ fetchData }) {

  // state ของฟอร์มต่าง ๆ
  const [term, setTerm] = useState("");
  const [summerTerm, setSummerTerm] = useState("");
  const [summer, setSummer] = useState("");
  // summerYear เป็น array สำหรับเก็บค่า input แต่ละช่องใน loop
  const [summerYear, setSummerYear] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  
  // ใช้ useSearchParams เพื่อดึง query parameters
  const [searchParams] = useSearchParams();
  const {planid} = useParams();
  const [planidFromURL, setPlanidFormURL] = useState(planid);
  const course = searchParams.get("course");
  const year = searchParams.get("year");
  const studentId = searchParams.get("student_id");
  const group = searchParams.get("group");

  // ใช้ useLocation เพื่อดึง state ที่ส่งมาจาก navigate
  const location = useLocation();
  const planState = location.state; // ข้อมูลของ plan ที่ส่งมา

  // ฟังก์ชันจัดการ summerTerm ให้สร้าง array สำหรับ summerYear
  const handleSummerTermChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,1}$/.test(value)) {
      setSummerTerm(value);
      if (!isNaN(value) && value > 0) {
        // สร้าง array ที่มีจำนวนช่อง = summerTerm - 1
        setSummerYear(Array.from({ length: Number(value) - 1 }, () => ""));
      } else {
        setSummerYear([]);
      }
    }
  };

    // ฟังก์ชัน handleCancel สำหรับรีเซ็ตฟอร์ม
    const handleCancel = () => {
        setTerm('');
        setSummer('');
        setSummerTerm('');
        setSummerYear([]); // รีเซ็ต summerYear ถ้าต้องการให้ฟอร์มว่าง
    };

  // ฟังก์ชันสร้าง subterm array จาก term (สมมติว่า term เป็นเลขคู่)
const generateSubterms = (term) => {
    const termNum = parseInt(term, 10);
    const subterms = [];
    // ทำ loop ทีละ 2 หนึ่ง pair คือ (i+1)-(i+2)
    for (let i = 0; i < termNum; i += 2) {
      subterms.push(`${i + 1}-${i + 2}`);
    }
    return subterms;
  };
  
  // ตัวอย่างการใช้งาน
//   console.log(generateSubterms(6)); // ผลลัพธ์: ["1-2", "3-4", "5-6"]
//   console.log(generateSubterms(4)); // ผลลัพธ์: ["1-2", "3-4"]
  

  // ฟังก์ชันสำหรับอัปเดตค่าของ summerYear ตาม index
  const handleSummerYearChange = (index, value) => {
    const updated = [...summerYear];
    updated[index] = value;
    setSummerYear(updated);
  };

  // ฟังก์ชัน submit เพื่อสร้าง record แยกเป็น 2 กลุ่ม
  const Submit = async (e) => {
    e.preventDefault();

    // รับค่า planid จาก URL และค่าอื่น ๆ จาก form
    const planidVal = planidFromURL; // ได้มาจาก URL
    const termVal = parseInt(term, 10); // term จาก form (เช่น 6)
    const formYear = Number(year);      // ปีเริ่มต้น (เช่น 2568)
    const groupName = group;            // ใช้เป็น group_name
    const subterm = group;              // ตัวอย่างใช้ group เป็น subterm (หรือประมวลผลเพิ่มเติมได้)
    const subtermArray = generateSubterms(termVal); // สร้าง subterm array


    // === 1. สร้าง record จาก loop (Non-summer) ===
    // จำนวน loop คำนวณจาก term (เช่น term 6 → loopCount = 3)
    const loopCount = termVal / 2;
    const loopRecords = [];
    for (let i = 0; i < loopCount; i++) {
      let sublevel = null;
      // กำหนด sublevel ตามเงื่อนไข course
      if (course === "หลักสูตรประกาศณียบัตรวิชาชีพ") {
        sublevel = `ปวช.${i + 1}`;
      } else if (course === "หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง") {
        sublevel = `ปวส.${i + 1}`;
      } else if (course === "หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง ม.6") {
        sublevel = `ปวส.${i + 1} ม.6`;
      }
      loopRecords.push({
        planid: planidVal,
        sublevel: sublevel,          // เช่น ปวช.1, ปวช.2, ปวช.3
        group_name: groupName,
        term: termVal,
        subterm: subtermArray[i],
        summer: null,                // สำหรับ record loop จะไม่บันทึก summer
        year: formYear + i,          // ปีเพิ่มขึ้นทีละ 1
      });
    }

    // === 2. สร้าง record สำหรับข้อมูลจาก form (Summer) ===
    // เนื่องจาก form summer มีหลายค่า (input หลักและ input เสริม) เราจะสร้าง record แยกสำหรับแต่ละค่า
    const summerRecords = [];
    // Record สำหรับ input หลัก (ปีภาคเรียนฤดูร้อน 1)
    if (summer) {
      summerRecords.push({
        planid: planidVal,
        sublevel: null,          // ไม่มี sublevel สำหรับ summer record
        group_name: groupName,
        term: termVal,
        subterm: subterm,
        summer: parseInt(summer, 10),
        year: parseInt(summer, 10),
      });
    }
    // Record สำหรับ input เสริม (ปีภาคเรียนฤดูร้อน 2, 3, ...)
    summerYear.forEach((sy) => {
      if (sy) {
        summerRecords.push({
          planid: planidVal,
          sublevel: null,
          group_name: groupName,
          term: termVal,
          subterm: subterm,
          summer: parseInt(sy, 10),
          year: parseInt(sy, 10)
        });
      }
    });

    // รวม record ทั้งหมดที่จะส่งไปบันทึก
    const records = [...loopRecords, ...summerRecords];
    console.log("Records to save:", records);

    // ส่งข้อมูลไปยัง API เพื่อลงฐานข้อมูล
    try {
        const response = await axios.post(`${API_BASE_URL}/server/api/POST/Insert_groupinfo.php`, { 
            planid: planidVal,
            records: records 
        });
    
        console.log("Response data:", response.data); // log ข้อมูลทั้งหมด
    
        // ใช้ console.log เพื่อตรวจสอบค่า message
        console.log("Message received:", response.data.message);
    
        if (response.data.message.trim() === "บันทึกข้อมูลเรียบร้อยแล้ว") {
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            Toast.fire({
                icon: "success",
                title: "ข้อมูลถูกบันทึกสำเร็จ!"
            });
    
            // เรียกใช้ฟังก์ชัน fetchData เพื่อดึงข้อมูลใหม่หลังบันทึกสำเร็จ
            handleCancel(); // รีเซ็ตฟอร์ม
            fetchData();
        }
        else {
            console.error('Error: Message mismatch', response.data);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถบันทึกข้อมูลได้ โปรดลองใหม่อีกครั้ง.',
                confirmButtonText: 'ตกลง'
            });
        }
    } catch (error) {
        // หากเกิดข้อผิดพลาดแสดง SweetAlert
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: 'ไม่สามารถบันทึกข้อมูลได้ โปรดลองใหม่อีกครั้ง.',
            confirmButtonText: 'ตกลง'
        });
    }
  };
  

    // const Submit = async (e) =>{
    //     e.preventDefault();

    //     const data = {
    //         term: term,
    //         summer: summer
    //     };

    //     console.log('ข้อมูลที่กรอก:', data);

    //     try {
    //         const response = await axios.post(`${API_BASE_URL}/server/api/POST/Insert_groupinfo.php`)
    //         console.log("API Response:", response); // ตรวจสอบค่า response ที่ได้รับ

    //         if (response.data.message === "Data inserted successfully") {
    //             const Toast = Swal.mixin({
    //             toast: true,
    //             position: "top-end",
    //             showConfirmButton: false,
    //             timer: 3000,
    //             timerProgressBar: true,
    //             didOpen: (toast) => {
    //                 toast.onmouseenter = Swal.stopTimer;
    //                 toast.onmouseleave = Swal.resumeTimer;
    //             }
    //             });
    //             Toast.fire({
    //             icon: "success",
    //             title: "ข้อมูลถูกบันทึกสำเร็จ!"
    //             });

    //             // เรียกใช้ฟังก์ชัน fetchData เพื่อดึงข้อมูลใหม่หลังบันทึกสำเร็จ
    //             fetchData();
    //             handleCancel(); // รีเซ็ตฟอร์ม
    //         }
    //     } catch {
    //         // หากเกิดข้อผิดพลาดแสดง SweetAlert
    //         console.error('Error:', error);
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'เกิดข้อผิดพลาด!',
    //             text: 'ไม่สามารถบันทึกข้อมูลได้ โปรดลองใหม่อีกครั้ง.',
    //             confirmButtonText: 'ตกลง'
    //         });
    //     }
    // }

    // console.log(summerTerm);

    // const handlesummer = () => {
    //     if (summerTerm > 1) {
    //         const newSummerArray = Array.from({ length: summerTerm }, (_, i) => Number(planDetails.year) -1 + (i + 1));
    //         setsummer(newSummerArray);
    //     } else {
    //         setsummer([]);
    //     }    

    //     (e) => {
    //         if (e.target.value.length > 4) {
    //             e.target.value = e.target.value.slice(0, 4);
    //         }
    //     }
    // }
   

  return (
    <>
        <div className='flex items-center justify-center border border-gray-400 bg-gray-100 mb-6 mt-10 rounded-lg'>
            <form onSubmit={Submit} className='flex flex-col gap-4 p-4 w-full'>
                <div className='flex flex-row gap-20 items-center justify-center'>
                    <div className='flex flex-row gap-20'>
                        <div className='flex flex-col gap-2'>
                            <h1 className='text-[20px]'>เทอม</h1>
                            <input className='p-1 h-auto border rounded-lg' placeholder='เทอม'
                            value={term}
                            onChange={(e) => setTerm(e.target.value)}
                            maxLength={1}></input>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <h1 className="text-[20px]">ภาคเรียนฤดูร้อน</h1>
                            <input
                                type="number"
                                className="p-1 h-auto border rounded-lg"
                                placeholder="ภาคเรียนฤดูร้อน"
                                value={summerTerm}
                                onChange={handleSummerTermChange} // ฟังก์ชันนี้จะทำงานเมื่อผู้ใช้พิมพ์
                            />
                        </div>

                            <div className="flex flex-col gap-2 items-center">
                                <h1 className="text-[20px]">ปีการศึกษาภาคเรียนฤดูร้อน</h1>
                                <input
                                    className="p-1 h-auto border rounded-lg"
                                    placeholder="กรอกปีภาคเรียนฤดูร้อน1"
                                    type="number"
                                    value={summer}
                                    onChange={(e) => setSummer(e.target.value)}
                                    onInput={(e) => {
                                        // จำกัดความยาวของตัวเลขไม่ให้เกิน 4 หลัก
                                        if (e.target.value.length > 4) {
                                            e.target.value = e.target.value.slice(0, 4);
                                        }
                                    }}
                                />
                                {summerYear.map((value, index) => (
                                    <div key={index}>
                                        <input
                                            className="p-1 h-auto border rounded-lg"
                                            placeholder={`ปีภาคเรียนฤดูร้อน ${index + 2}`}
                                            type="number"
                                            value={value}
                                            onChange={(e) =>
                                                handleSummerYearChange(index, e.target.value)
                                            }
                                            onInput={(e) => {
                                                if (e.target.value.length > 4) {
                                                    e.target.value = e.target.value.slice(0, 4);
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                    <div className='flex flex-row gap-4 items-center justify-center'>
                        <button type='submit' className='bg-green-500 text-white p-2 rounded-lg w-20 hover:bg-green-600'>ยืนยัน</button>
                        <button type='button' onClick={handleCancel} className='bg-red-500 text-white p-2 rounded-lg w-20 hover:bg-red-600'>ยกเลิก</button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default Groupinfoform