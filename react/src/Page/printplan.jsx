import React, { useEffect, useState,useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft,Printer } from "lucide-react";
import axios from "axios";

const Printplan = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [tableData, setTableData] = useState({});
    const [groupData, setGroupData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const selectedGroupData = groupData.find(group => group.infoid === selectedGroup);
    const subLevel = selectedGroupData ? selectedGroupData.sublevel : "ไม่ระบุ";
    
    // แยกข้อมูลออกเป็น "ระดับ" และ "ชั้นปี"
    let level = "ไม่ระบุ";
    let year = "";
    
    if (subLevel.includes("ปวช.")) {
        level = "ปวช.";
        year = subLevel.replace("ปวช.", ""); // ดึงเฉพาะตัวเลขปี
    } else if (subLevel.includes("ปวส.") && subLevel.includes("ม.6")) {
        level = "ปวส.ม.6";
        year = subLevel.replace("ปวส.ม.6.", ""); 
    } else if (subLevel.includes("ปวส.")) {
        level = "ปวส.";
        year = subLevel.replace("ปวส.", ""); 
    }
    
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const queryParams = new URLSearchParams(location.search);
    const planid = queryParams.get("planid") || location.state?.planid || "";
    const [planDetail, setPlanDetail] = useState({ plan_name: "", plan_code: "" });
    const printRef = useRef(); // ✅ ใช้ useRef เพื่ออ้างอิงพื้นที่ที่ต้องการพิมพ์

    useEffect(() => {
        if (planid) {
            axios.get(`${API_BASE_URL}/server/api/GET/Get_plan_detail.php`, {
                params: { planid },
            }).then((response) => {
                if (response.data.plan_name) {
                    setPlanDetail(response.data);  // บันทึกข้อมูลแผนการเรียน
                } else {
                    console.error("No plan data found");
                }
            }).catch((error) => {
                console.error("Error fetching plan details:", error);
            });
        }
    }, [planid]);

    useEffect(() => {
        if (planid) {
            axios.get(`${API_BASE_URL}/server/api/GET/Getgroupforgroup.php`, {
                params: { planid },
            }).then((response) => {
                setGroupData(response.data);
                if (response.data.length > 0) {
                    setSelectedGroup(response.data[0].infoid);
                }
            }).catch((error) => {
                console.error("Error fetching group data:", error);
            });
        }
    }, [planid]);

    useEffect(() => {
        if (selectedGroup) {
            axios.get(`${API_BASE_URL}/server/api/GET/Get_printcourse_information.php`, {
                params: { infoid: selectedGroup }
            }).then((response) => {
                const courses = Array.isArray(response.data) ? response.data : [];
                const groupedData = { "1": {}, "2": {} };
                courses.forEach(course => {
                    const term = [1, 3, 5].includes(Number(course.term)) ? "1" : "2";
                    if (!groupedData[term][course.subject_category]) {
                        groupedData[term][course.subject_category] = {};
                    }
                    if (!groupedData[term][course.subject_category][course.subject_groups]) {
                        groupedData[term][course.subject_category][course.subject_groups] = [];
                    }
                    groupedData[term][course.subject_category][course.subject_groups].push(course);
                });
                setTableData(groupedData);
            }).catch((error) => {
                console.error("Error fetching course information:", error);
            });
        }
    }, [selectedGroup]);
    
    const handleBack = () => {
        navigate(-1);
    };
    
    // ✅ ฟังก์ชันพิมพ์เฉพาะส่วนของแผนการเรียน
    const handlePrint = () => {
        const printContent = printRef.current.innerHTML;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // ✅ รีโหลดหน้าเพื่อคืนค่าเดิม
    };


    return (
        <div className="container mx-auto p-4">
            <button
                onClick={handleBack}
                className="mb-6 flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">ย้อนกลับ</span>
            </button>
              {/* ✅ ปุ่มพิมพ์ */}
            

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2">ระดับชั้น</th>
                            <th className="border border-gray-300 p-2">กลุ่ม</th>
                            <th className="border border-gray-300 p-2">ภาคเรียน</th>
                            <th className="border border-gray-300 p-2">ปีการศึกษา</th>
                            <th className="border border-gray-300 p-2">เลือก</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groupData.length > 0 ? (
                            groupData.map((item, index) => (
                                <tr key={index} className="text-center">
                                    <td className="border border-gray-300 p-2">{item.sublevel ?? "summer"}</td>
                                    <td className="border border-gray-300 p-2">{item.group_name}</td>
                                    <td className="border border-gray-300 p-2">{item.subterm}</td>
                                    <td className="border border-gray-300 p-2">{item.year}</td>
                                    <td className="border border-gray-300 p-2">
                                    <input 
                                        type="radio" 
                                        name="groupSelection" 
                                        value={item.infoid} 
                                        checked={selectedGroup === item.infoid} 
                                        onChange={() => {
                                            setSelectedGroup(item.infoid); // เปลี่ยนค่า selectedGroup
                                        }} 
                                        className="w-5 h-5 accent-blue-500 cursor-pointer" 
                                    />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="border border-gray-300 p-2 text-center text-gray-500">
                                    ไม่มีข้อมูลกลุ่ม
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end mb-4">
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2 mt-4 text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
                <Printer size={20} />
                <span className="font-medium">พิมพ์</span>
            </button>
        </div>
            <div ref={printRef} className="print-area">
            <table className="w-full border  text-sm mt-6">
                <thead>
                    <tr>
                    <th colSpan={10} className="border-1 p-1 text-center">
                        แผนการเรียน{planDetail?.plan_name.replace("หลักสูตร", "").replace("(ม.6)", "").trim() || "ไม่มีข้อมูล"} ({level}) ชั้นปีที่ {year} รหัส {planDetail?.plan_code || "-"}
                    </th>



                    </tr>
                    <tr>
                    <th colSpan={5} className="border-1 p-1 text-center">
                        ภาคเรียนที่ 1 ปีการศึกษา {selectedGroupData?.year || "-"}
                    </th>
                    <th colSpan={5} className="border-1 p-1 text-center">
                        ภาคเรียนที่ 2 ปีการศึกษา {selectedGroupData?.year || "-"}
                    </th>

                    </tr>
                    <tr>
                        <th colSpan={5} className="border-1  p-1 text-center">ลักษณะงาน:</th>
                        <th colSpan={5} className="border-1  p-1 text-center">ลักษณะงาน:</th>
                    </tr>
                    <tr className="text-center">
                        <th className="border-1  p-1 w-24">รหัสวิชา</th>
                        <th className="border-1  p-1">ชื่อวิชา</th>
                        <th className="border-1  p-1 w-12">ท</th>
                        <th className="border-1  p-1 w-12">ป</th>
                        <th className="border-1  p-1 w-12">น</th>
                        <th className="border-1  p-1 w-24">รหัสวิชา</th>
                        <th className="border-1  p-1">ชื่อวิชา</th>
                        <th className="border-1  p-1 w-12">ท</th>
                        <th className="border-1  p-1 w-12">ป</th>
                        <th className="border-1  p-1 w-12">น</th>
                    </tr>
                </thead>
                <tbody>
    {Object.keys(tableData["1"] || {}).map(category => (
        <React.Fragment key={category}>
            <tr>
                <td className="border-1 p-1 text-center"></td>
                <td className="border-1 p-1 text-left">{category}</td>
                <td className="border-1 p-1 text-center"></td>
                <td className="border-1 p-1 text-center"></td>
                <td className="border-1 p-1 text-center"></td>
                <td className="border-1 p-1 text-center"></td>
                <td className="border-1 p-1 text-left">{category}</td>
                <td className="border-1 p-1 text-center"></td>
                <td className="border-1 p-1 text-center"></td>
                <td className="border-1 p-1 text-center"></td>
            </tr>
            {Object.keys(tableData["1"][category] || {}).map(group => {
                const term1Courses = tableData["1"][category][group] || [];
                const term2Courses = tableData["2"][category]?.[group] || [];
                const maxRows = Math.max(term1Courses.length, term2Courses.length);

                return (
                    <React.Fragment key={group}>
                    { !["รายวิชาปรับพื้นฐาน", "3.หมวดวิชาเลือกเสรี", "4.กิจกรรมเสริมหลักสูตร"].includes(category) && (
                        <tr>
                            <td className="border-1 p-1 text-center"></td>
                            <td className="border-1 p-1 text-left">{group}</td>
                            <td className="border-1 p-1 text-center"></td>
                            <td className="border-1 p-1 text-center"></td>
                            <td className="border-1 p-1 text-center"></td>
                            <td className="border-1 p-1 text-center"></td>
                            <td className="border-1 p-1 text-left">{group}</td>
                            <td className="border-1 p-1 text-center"></td>
                            <td className="border-1 p-1 text-center"></td>
                            <td className="border-1 p-1 text-center"></td>
                        </tr>
                    )}
                        {[...Array(maxRows)].map((_, index) => (
                            <tr key={index} className="text-center">
                                {term1Courses[index] ? (
                                    <>
                                        <td className="border-1 p-1">{term1Courses[index].course_code}</td>
                                        <td className="border-1 p-1 text-left">{term1Courses[index].course_name}</td>
                                        <td className="border-1 p-1">{term1Courses[index].theory}</td>
                                        <td className="border-1 p-1">{term1Courses[index].comply}</td>
                                        <td className="border-1 p-1">{term1Courses[index].credit}</td>
                                    </>
                                ) : (
                                    <>
                                    <td className="border-1 p-1"></td>
                                    <td className="border-1 p-1"></td>
                                    <td className="border-1 p-1"></td>
                                    <td className="border-1 p-1"></td>
                                    <td className="border-1 p-1"></td>
                                    </>

                                )}
                                {term2Courses[index] ? (
                                    <>
                                        <td className="border-1 p-1">{term2Courses[index].course_code}</td>
                                        <td className="border-1 p-1 text-left">{term2Courses[index].course_name}</td>
                                        <td className="border-1 p-1">{term2Courses[index].theory}</td>
                                        <td className="border-1 p-1">{term2Courses[index].comply}</td>
                                        <td className="border-1 p-1">{term2Courses[index].credit}</td>
                                    </>
                                ) : (
                                    <>
                                    <td className="border-1 p-1"></td>
                                    <td className="border-1 p-1"></td>
                                    <td className="border-1 p-1"></td>
                                    <td className="border-1 p-1"></td>
                                    <td className="border-1 p-1"></td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </React.Fragment>
                );
            })}
        </React.Fragment>
    ))}

    {/* ✅ แถวสุดท้าย แสดงผลรวมทั้งหมด ✅ */}
    {(() => {
        let totalTerm1 = { theory: 0, comply: 0, credit: 0 };
        let totalTerm2 = { theory: 0, comply: 0, credit: 0 };

        Object.keys(tableData["1"] || {}).forEach(category => {
            Object.keys(tableData["1"][category] || {}).forEach(group => {
                tableData["1"][category][group]?.forEach(course => {
                    totalTerm1.theory += Number(course.theory) || 0;
                    totalTerm1.comply += Number(course.comply) || 0;
                    totalTerm1.credit += Number(course.credit) || 0;
                });
            });
        });

        Object.keys(tableData["2"] || {}).forEach(category => {
            Object.keys(tableData["2"][category] || {}).forEach(group => {
                tableData["2"][category][group]?.forEach(course => {
                    totalTerm2.theory += Number(course.theory) || 0;
                    totalTerm2.comply += Number(course.comply) || 0;
                    totalTerm2.credit += Number(course.credit) || 0;
                });
            });
        });

        return (
            <tr className="text-center">
                <td className="border-1 p-1"></td>
                <td colSpan={1} className="border-1 p-1">รวม (ไม่เกิน 22 นก.)</td>
                <td className="border-1 p-1">{totalTerm1.theory}</td>
                <td className="border-1 p-1">{totalTerm1.comply}</td>
                <td className="border-1 p-1">{totalTerm1.credit}</td>
                <td className="border-1 p-1"></td>
                <td colSpan={1} className="border-1 p-1">รวม (ไม่เกิน 22 นก.)</td>
                <td className="border-1 p-1">{totalTerm2.theory}</td>
                <td className="border-1 p-1">{totalTerm2.comply}</td>
                <td className="border-1 p-1">{totalTerm2.credit}</td>
            </tr>
        );
    })()}
</tbody>
            </table>
           <div className="flex justify-between mt-2 px-10">
    <div className="text-center">
        <br /><br />
        ....................................... <br />
        <p>()</p>
        <p>หัวหน้าแผนกวิชาเทคนิคคอมพิวเตอร์</p>
    </div>
    <div className="text-center">
        <br /><br />
        ....................................... <br />
        <p>()</p>
        <p>หัวหน้างานพัฒนาหลักสูตรการเรียนการสอน</p>
    </div>
    <div className="text-center">
        <br /><br />
        ....................................... <br />
        <p>()</p>
        <p>รองผู้อำนวยการฝ่ายวิชาการ</p>
    </div>
    <div className="text-center">
        <br /><br />
        ....................................... <br />
        <p>()</p>
        <p>ผู้อำนวยการวิทยาลัยเทคนิคแพร่</p>
    </div>
</div>
</div>

        </div>
        
    );
};

export default Printplan;

