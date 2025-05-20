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
    const [jobDescription1, setJobDescription1] = useState(""); // ภาคเรียนที่ 1
    const [jobDescription2, setJobDescription2] = useState(""); // ภาคเรียนที่ 2
    const [headOfDepartment, setHeadOfDepartment] = useState("");
    const [headOfCurriculum, setHeadOfCurriculum] = useState("");
    const [deputyDirector, setDeputyDirector] = useState("");
    const [director, setDirector] = useState("");

    const [savedJobDescription1, setSavedJobDescription1] = useState(""); // ค่าที่บันทึกสำหรับภาคเรียนที่ 1
    const [savedJobDescription2, setSavedJobDescription2] = useState(""); // ค่าที่บันทึกสำหรับภาคเรียนที่ 2
    const [savedHeadOfDepartment, setSavedHeadOfDepartment] = useState("");
    const [savedHeadOfCurriculum, setSavedHeadOfCurriculum] = useState("");
    const [savedDeputyDirector, setSavedDeputyDirector] = useState("");
    const [savedDirector, setSavedDirector] = useState("");
    
    const [isSaved, setIsSaved] = useState(false);

    // เพิ่ม state สำหรับการแก้ไข
    const [isEditing, setIsEditing] = useState(false);
    const [editingField, setEditingField] = useState(null);

    const handleInputChange = (e, field) => {
        switch(field) {
            case "headOfDepartment":
                setHeadOfDepartment(e.target.value);
                break;
            case "headOfCurriculum":
                setHeadOfCurriculum(e.target.value);
                break;
            case "deputyDirector":
                setDeputyDirector(e.target.value);
                break;
            case "director":
                setDirector(e.target.value);
                break;
            case "jobDescription1":
                setJobDescription1(e.target.value);
                break;
            case "jobDescription2":
                setJobDescription2(e.target.value);
                break;
        }
    };

    // เพิ่มฟังก์ชันสำหรับจัดการการแก้ไข
    const handleEdit = (fieldName, value) => {
        setIsEditing(true);
        setEditingField(fieldName);
        switch(fieldName) {
            case "jobDescription1":
                setJobDescription1(value);
                break;
            case "jobDescription2":
                setJobDescription2(value);
                break;
            case "headOfDepartment":
                setHeadOfDepartment(value);
                break;
            case "headOfCurriculum":
                setHeadOfCurriculum(value);
                break;
            case "deputyDirector":
                setDeputyDirector(value);
                break;
            case "director":
                setDirector(value);
                break;
        }
    };

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
        setIsSaved(false); // กลับมาให้บันทึกใหม่
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

    // แก้ไขฟังก์ชัน handleSave
    const handleSave = () => {
        axios.post(`${API_BASE_URL}/server/api/POST/save_more_plan.php`, {
            planid,
            infoid: selectedGroup,
            descriptionterm1: jobDescription1,
            descriptionterm2: jobDescription2,
            Headofdepartment: headOfDepartment,
            HeadofCurriculum: headOfCurriculum,
            DeputyDirector: deputyDirector,
            Director: director
        }).then(() => {
            setSavedJobDescription1(jobDescription1);
            setSavedJobDescription2(jobDescription2);
            setSavedHeadOfDepartment(headOfDepartment);
            setSavedHeadOfCurriculum(headOfCurriculum);
            setSavedDeputyDirector(deputyDirector);
            setSavedDirector(director);
            setIsEditing(false);
            setEditingField(null);
            setIsSaved(true);
        }).catch((error) => {
            console.error("Error saving more_plan:", error);
        });
    };
    
    
    useEffect(() => {
        if (selectedGroup && planid) {
            axios.get(`${API_BASE_URL}/server/api/GET/get_more_plan.php`, {
                params: {
                    planid,
                    infoid: selectedGroup
                }
            })
            .then((response) => {
                const data = response.data;
                if (data) {
                    setSavedJobDescription1(data.descriptionterm1);
                    setSavedJobDescription2(data.descriptionterm2);
                    setSavedHeadOfDepartment(data.Headofdepartment);
                    setSavedHeadOfCurriculum(data.HeadofCurriculum);
                    setSavedDeputyDirector(data.DeputyDirector);
                    setSavedDirector(data.Director);
    
                    // ตั้งค่าค่า input เผื่อใช้แก้ไขต่อ
                    setJobDescription1(data.descriptionterm1);
                    setJobDescription2(data.descriptionterm2);
                    setHeadOfDepartment(data.Headofdepartment);
                    setHeadOfCurriculum(data.HeadofCurriculum);
                    setDeputyDirector(data.DeputyDirector);
                    setDirector(data.Director);
                } else {
                    // เคลียร์ค่าเมื่อไม่มีข้อมูล
                    setSavedJobDescription1("");
                    setSavedJobDescription2("");
                    setSavedHeadOfDepartment("");
                    setSavedHeadOfCurriculum("");
                    setSavedDeputyDirector("");
                    setSavedDirector("");
    
                    setJobDescription1("");
                    setJobDescription2("");
                    setHeadOfDepartment("");
                    setHeadOfCurriculum("");
                    setDeputyDirector("");
                    setDirector("");
                }
                if (response.data) {
                    setSavedJobDescription1(response.data.descriptionterm1 || "");
                    setSavedJobDescription2(response.data.descriptionterm2 || "");
                    setSavedHeadOfDepartment(response.data.Headofdepartment || "");
                    setSavedHeadOfCurriculum(response.data.HeadofCurriculum || "");
                    setSavedDeputyDirector(response.data.DeputyDirector || "");
                    setSavedDirector(response.data.Director || "");
                    setIsSaved(true);
                } else {
                    setIsSaved(false);
                }
            })
            .catch((error) => {
                console.error("Error loading more_plan:", error);
            });
        }
    }, [selectedGroup, planid]);

    const isFormComplete = () => {
        return (
            jobDescription1.trim() !== "" &&
            jobDescription2.trim() !== "" &&
            headOfDepartment.trim() !== "" &&
            headOfCurriculum.trim() !== "" &&
            deputyDirector.trim() !== "" &&
            director.trim() !== ""
        );
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
                                        type="checkbox" 
                                        name="groupSelection" 
                                        value={item.infoid} 
                                        checked={selectedGroup === item.infoid} 
                                        onChange={() => {
                                            setSelectedGroup(item.infoid); // ✅ เมื่อเปลี่ยน group จะ trigger useEffect
                                        }} 
                                        className="w-5 h-5 accent-blue-500 cursor-pointer " 
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
            <div className="flex justify-end mb-4 gap-2">
    <button
        onClick={handlePrint}
        disabled={!isSaved || !isFormComplete() || isEditing}
        className={`flex items-center gap-2 px-6 py-2 mt-4 text-white rounded-lg shadow-md transition-all duration-200
            ${(isSaved && isFormComplete() && !isEditing) 
                ? "bg-green-600 hover:bg-green-700 cursor-pointer" 
                : "bg-gray-400 cursor-not-allowed"}`}
    >
        <Printer size={20} />
        <span className="font-medium">
            {!isSaved 
                ? "กรุณาบันทึกข้อมูลก่อนพิมพ์" 
                : !isFormComplete() 
                    ? "กรุณากรอกข้อมูลให้ครบก่อนพิมพ์"
                    : isEditing
                        ? "กรุณาบันทึกการแก้ไขก่อนพิมพ์"
                        : "พิมพ์"}
        </span>
    </button>

    {/* ปุ่มอื่นๆ คงเดิม */}
    {isSaved && !isEditing && (
        <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-2 mt-4 text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
            <span className="font-medium">แก้ไขข้อมูล</span>
        </button>
    )}
    
    {isEditing && (
        <>
            <button
                onClick={() => {
                    setIsEditing(false);
                    setEditingField(null);
                    // Reset to saved values
                    setJobDescription1(savedJobDescription1);
                    setJobDescription2(savedJobDescription2);
                    setHeadOfDepartment(savedHeadOfDepartment);
                    setHeadOfCurriculum(savedHeadOfCurriculum);
                    setDeputyDirector(savedDeputyDirector);
                    setDirector(savedDirector);
                }}
                className="flex items-center gap-2 px-6 py-2 mt-4 text-white bg-gray-600 hover:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
                <span className="font-medium">ยกเลิก</span>
            </button>
            <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 mt-4 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
                <span className="font-medium">บันทึกการแก้ไข</span>
            </button>
        </>
    )}
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
                    <th colSpan={5} className="border-1 p-1 text-center w-auto whitespace-nowrap">
                        ลักษณะงาน:{" "}
                        {savedJobDescription1 ? (
                            isEditing ? (
                                <input
                                    type="text"
                                    value={jobDescription1}
                                    onChange={(e) => setJobDescription1(e.target.value)}
                                    className="border border-gray-400 rounded px-2 py-1 w-auto min-w-[350px]"
                                    placeholder={savedJobDescription1}
                                />
                            ) : (
                                <span className="hover:text-blue-600">{savedJobDescription1}</span>
                            )
                        ) : (
                            <input
                                type="text"
                                value={jobDescription1}
                                onChange={(e) => setJobDescription1(e.target.value)}
                                className="border border-gray-400 rounded px-2 py-1 w-auto min-w-[350px]"
                                placeholder="กรอกลักษณะงานภาคเรียนที่ 1"
                            />
                        )}
                    </th>
                    <th colSpan={5} className="border-1 p-1 text-center w-auto whitespace-nowrap">
                        ลักษณะงาน:{" "}
                        {savedJobDescription2 || (
                            <input
                                type="text"
                                value={jobDescription2}
                                onChange={(e) => setJobDescription2(e.target.value)}
                                className="border border-gray-400 rounded px-2 py-1 w-auto min-w-[350px]"
                                placeholder="กรอกลักษณะงานภาคเรียนที่ 2"
                            />
                        )}
                    </th>
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
    {[
        {
            title: "หัวหน้าแผนกวิชาเทคนิคคอมพิวเตอร์",
            savedValue: savedHeadOfDepartment,
            currentValue: headOfDepartment,
            field: "headOfDepartment"
        },
        {
            title: "หัวหน้างานพัฒนาหลักสูตรการเรียนการสอน",
            savedValue: savedHeadOfCurriculum,
            currentValue: headOfCurriculum,
            field: "headOfCurriculum"
        },
        {
            title: "รองผู้อำนวยการฝ่ายวิชาการ",
            savedValue: savedDeputyDirector,
            currentValue: deputyDirector,
            field: "deputyDirector"
        },
        {
            title: "ผู้อำนวยการวิทยาลัยเทคนิคแพร่",
            savedValue: savedDirector,
            currentValue: director,
            field: "director"
        }
    ].map((item, index) => (
        <div key={index} className="text-center">
            <br /><br />
            {item.savedValue ? (
                isEditing ? (
                    <div>
                        ( <input
                            type="text"
                            value={item.currentValue}
                            onChange={(e) => handleInputChange(e, item.field)}
                            className="border-b border-gray-400 w-40 text-center min-w-[200px]"
                            placeholder={item.savedValue}
                        /> )
                    </div>
                ) : (
                    <span className="hover:text-blue-600">
                        ({item.savedValue})
                    </span>
                )
            ) : (
                <div>
                    ( <input
                        type="text"
                        value={item.currentValue}
                        onChange={(e) => handleInputChange(e, item.field)}
                        className="border-b border-gray-400 w-40 text-center min-w-[200px]"
                        placeholder="กรอกชื่อบุคคล"
                    /> )
                </div>
            )}
            <p>{item.title}</p>
        </div>
    ))}
</div>
            <div className="flex justify-end mb-4">
    {!isFormComplete() && !isSaved && !isEditing && (
        <p className="text-red-500 text-sm mt-7 mr-2">* กรุณากรอกข้อมูลให้ครบก่อนบันทึก</p>
    )}
    
    {(isEditing || !isSaved) && (
        <button
            onClick={handleSave}
            disabled={!isFormComplete() && !isEditing}
            className={`flex items-center gap-2 px-6 py-2 mt-4 text-white rounded-lg shadow-md transition-all duration-200 cursor-pointer 
                ${(isFormComplete() || isEditing) ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
            {isEditing ? 'บันทึกการแก้ไข' : 'บันทึก'}
        </button>
    )}
</div>
        </div>
    </div>
        
    );
};

export default Printplan;

