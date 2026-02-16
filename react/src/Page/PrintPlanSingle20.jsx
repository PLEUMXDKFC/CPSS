import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import axios from "axios";

const PrintPlanSingle20 = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [tableData, setTableData] = useState({});
    const [groupData, setGroupData] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const selectedGroupData = groupData.find(group => group.infoid === selectedGroup);
    const subLevel = selectedGroupData ? selectedGroupData.sublevel : "ไม่ระบุ";

    const [selectedTerm, setSelectedTerm] = useState("1");

    // State สำหรับกรอกข้อมูล
    const [jobDescription, setJobDescription] = useState("");
    const [headOfDepartment, setHeadOfDepartment] = useState("");
    const [headOfCurriculum, setHeadOfCurriculum] = useState("");
    const [deputyDirector, setDeputyDirector] = useState("");
    const [director, setDirector] = useState("");

    // State สำหรับเก็บค่าที่บันทึกแล้ว
    const [savedJobDescription, setSavedJobDescription] = useState("");
    const [savedHeadOfDepartment, setSavedHeadOfDepartment] = useState("");
    const [savedHeadOfCurriculum, setSavedHeadOfCurriculum] = useState("");
    const [savedDeputyDirector, setSavedDeputyDirector] = useState("");
    const [savedDirector, setSavedDirector] = useState("");

    const [isSaved, setIsSaved] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // แยกข้อมูลออกเป็น "ระดับ" และ "ชั้นปี"
    let level = "ไม่ระบุ";
    let year = "";

    if (subLevel && subLevel !== "ไม่ระบุ") {
        if (subLevel.includes("ปวช.")) {
            level = "ปวช.";
            year = subLevel.replace("ปวช.", "");
        } else if (subLevel.includes("ปวส.") && subLevel.includes("ม.6")) {
            level = "ปวส.ม.6";
            year = subLevel.replace("ปวส.ม.6.", "");
        } else if (subLevel.includes("ปวส.")) {
            level = "ปวส.";
            year = subLevel.replace("ปวส.", "");
        }
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const queryParams = new URLSearchParams(location.search);
    const planid = queryParams.get("planid") || location.state?.planid || "";
    const [planDetail, setPlanDetail] = useState({ plan_name: "", plan_code: "" });
    const printRef = useRef();

    useEffect(() => {
        if (planid) {
            axios.get(`${API_BASE_URL}/server/api/GET/Get_plan_detail.php`, {
                params: { planid },
            }).then((response) => {
                if (response.data.plan_name) {
                    setPlanDetail(response.data);
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
                const groupedData = {};

                courses.forEach(course => {
                    const term = [1, 3, 5].includes(Number(course.term)) ? "1" : "2";
                    if (!groupedData[term]) {
                        groupedData[term] = {};
                    }
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
        setIsSaved(false);
    }, [selectedGroup]);

    // โหลดข้อมูลที่บันทึกไว้
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
                        // ใช้ข้อมูลตามภาคเรียนที่เลือก
                        const desc = selectedTerm === "1" ? data.descriptionterm1 : data.descriptionterm2;
                        setSavedJobDescription(desc || "");
                        setJobDescription(desc || "");

                        setSavedHeadOfDepartment(data.Headofdepartment || "");
                        setSavedHeadOfCurriculum(data.HeadofCurriculum || "");
                        setSavedDeputyDirector(data.DeputyDirector || "");
                        setSavedDirector(data.Director || "");

                        setHeadOfDepartment(data.Headofdepartment || "");
                        setHeadOfCurriculum(data.HeadofCurriculum || "");
                        setDeputyDirector(data.DeputyDirector || "");
                        setDirector(data.Director || "");

                        setIsSaved(true);
                    } else {
                        // เคลียร์ค่า
                        setSavedJobDescription("");
                        setSavedHeadOfDepartment("");
                        setSavedHeadOfCurriculum("");
                        setSavedDeputyDirector("");
                        setSavedDirector("");

                        setJobDescription("");
                        setHeadOfDepartment("");
                        setHeadOfCurriculum("");
                        setDeputyDirector("");
                        setDirector("");

                        setIsSaved(false);
                    }
                })
                .catch((error) => {
                    console.error("Error loading more_plan:", error);
                });
        }
    }, [selectedGroup, planid, selectedTerm]);

    const handleBack = () => {
        navigate(-1);
    };

    const handlePrint = () => {
        // เก็บ content เดิม
        const originalContent = document.body.innerHTML;
        
        // แทนที่ content ด้วยส่วนที่ต้องการพิมพ์
        const printContent = printRef.current.innerHTML;
        document.body.innerHTML = `
            <style>
             @page {
                size: A3 landscape !important;
                    margin: 10mm;
             }
            </style>
            ${printContent}
        `;
        
        // พิมพ์และคืนค่า content เดิม
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const handleSave = () => {
        const saveData = {
            planid,
            infoid: selectedGroup,
            Headofdepartment: headOfDepartment,
            HeadofCurriculum: headOfCurriculum,
            DeputyDirector: deputyDirector,
            Director: director
        };

        // บันทึกตามภาคเรียนที่เลือก
        if (selectedTerm === "1") {
            saveData.descriptionterm1 = jobDescription;
            saveData.descriptionterm2 = savedJobDescription; // เก็บค่าเดิมของภาค 2
        } else {
            saveData.descriptionterm1 = savedJobDescription; // เก็บค่าเดิมของภาค 1  
            saveData.descriptionterm2 = jobDescription;
        }

        axios.post(`${API_BASE_URL}/api/POST/save_more_plan.php`, saveData)
            .then(() => {
                setSavedJobDescription(jobDescription);
                setSavedHeadOfDepartment(headOfDepartment);
                setSavedHeadOfCurriculum(headOfCurriculum);
                setSavedDeputyDirector(deputyDirector);
                setSavedDirector(director);
                setIsEditing(false);
                setIsSaved(true);
                alert("บันทึกข้อมูลเรียบร้อย");
            }).catch((error) => {
                console.error("Error saving more_plan:", error);
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            });
    };

    const isFormComplete = () => {
        return (
            jobDescription.trim() !== "" &&
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

            {/* ตารางเลือกกลุ่ม */}
            <div className="overflow-x-auto mb-4">
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
                                            onChange={() => setSelectedGroup(item.infoid)}
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

            {/* เลือกภาคเรียน */}
            <div className="mb-4 flex gap-4 items-center">
                <label className="font-semibold">เลือกภาคเรียนที่ต้องการพิมพ์:</label>
                <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2"
                >
                    <option value="1">ภาคเรียนที่ 1</option>
                    <option value="2">ภาคเรียนที่ 2</option>
                </select>
            </div>

            {/* ปุ่มพิมพ์และจัดการ */}
            <div className="flex justify-end mb-4 gap-2">
                <button
                    onClick={handlePrint}
                    disabled={!isSaved || !isFormComplete() || isEditing}
                    className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg shadow-md transition-all duration-200
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

                {isSaved && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-2 text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                        <span className="font-medium">แก้ไขข้อมูล</span>
                    </button>
                )}

                {isEditing && (
                    <>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setJobDescription(savedJobDescription);
                                setHeadOfDepartment(savedHeadOfDepartment);
                                setHeadOfCurriculum(savedHeadOfCurriculum);
                                setDeputyDirector(savedDeputyDirector);
                                setDirector(savedDirector);
                            }}
                            className="flex items-center gap-2 px-6 py-2 text-white bg-gray-600 hover:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            <span className="font-medium">ยกเลิก</span>
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            <span className="font-medium">บันทึกการแก้ไข</span>
                        </button>
                    </>
                )}
            </div>

            {/* พื้นที่พิมพ์ */}
            <div ref={printRef} className="print-area">
                <table className="w-full border text-sm mt-6">
                    <thead>
                        <tr>
                            <th colSpan={5} className="border-1 p-1 text-center">
                                แผนการเรียน{planDetail?.plan_name.replace("หลักสูตร", "").replace("(ม.6)", "").trim() || "ไม่มีข้อมูล"} ({level}) ชั้นปีที่ {year} รหัส {planDetail?.plan_code || "-"}
                            </th>
                        </tr>
                        <tr>
                            <th colSpan={5} className="border-1 p-1 text-center">
                                ภาคเรียนที่ {selectedTerm} ปีการศึกษา {selectedGroupData?.year || "-"}
                            </th>
                        </tr>
                        <tr>
                            <th colSpan={5} className="border-1 p-1 text-center w-auto whitespace-nowrap">
                                ลักษณะงาน:{" "}
                                {savedJobDescription ? (
                                    isEditing ? (
                                        <input
                                            type="text"
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            className="border border-gray-400 rounded px-2 py-1 w-auto min-w-[350px]"
                                            placeholder={savedJobDescription}
                                        />
                                    ) : (
                                        <span className="hover:text-blue-600">{savedJobDescription}</span>
                                    )
                                ) : (
                                    <input
                                        type="text"
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        className="border border-gray-400 rounded px-2 py-1 w-auto min-w-[350px]"
                                        placeholder={`กรอกลักษณะงานภาคเรียนที่ ${selectedTerm}`}
                                    />
                                )}
                            </th>
                        </tr>
                        <tr className="text-center">
                            <th className="border-1 p-1 w-24">รหัสวิชา</th>
                            <th className="border-1 p-1">ชื่อวิชา</th>
                            <th className="border-1 p-1 w-12">ท</th>
                            <th className="border-1 p-1 w-12">ป</th>
                            <th className="border-1 p-1 w-12">น</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(tableData[selectedTerm] || {}).map(category => (
                            <React.Fragment key={category}>
                                <tr>
                                    <td className="border-1 p-1 text-center"></td>
                                    <td className="border-1 p-1 text-left font-semibold">{category}</td>
                                    <td className="border-1 p-1 text-center"></td>
                                    <td className="border-1 p-1 text-center"></td>
                                    <td className="border-1 p-1 text-center"></td>
                                </tr>
                                {Object.keys(tableData[selectedTerm][category] || {}).map(group => {
                                    const courses = tableData[selectedTerm][category][group] || [];
                                    return (
                                        <React.Fragment key={group}>
                                            {!["รายวิชาปรับพื้นฐาน", "3.หมวดวิชาเลือกเสรี", "4.กิจกรรมเสริมหลักสูตร"].includes(category) && (
                                                <tr>
                                                    <td className="border-1 p-1 text-center"></td>
                                                    <td className="border-1 p-1 text-left pl-4">{group}</td>
                                                    <td className="border-1 p-1 text-center"></td>
                                                    <td className="border-1 p-1 text-center"></td>
                                                    <td className="border-1 p-1 text-center"></td>
                                                </tr>
                                            )}
                                            {courses.map((course, index) => (
                                                <tr key={index} className="text-center">
                                                    <td className="border-1 p-1">{course.course_code}</td>
                                                    <td className="border-1 p-1 text-left pl-6">{course.course_name}</td>
                                                    <td className="border-1 p-1">{course.theory}</td>
                                                    <td className="border-1 p-1">{course.comply}</td>
                                                    <td className="border-1 p-1">{course.credit}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </React.Fragment>
                        ))}

                        {/* แถวสุดท้าย แสดงผลรวม */}
                        {(() => {
                            let total = { theory: 0, comply: 0, credit: 0 };

                            Object.keys(tableData[selectedTerm] || {}).forEach(category => {
                                Object.keys(tableData[selectedTerm][category] || {}).forEach(group => {
                                    tableData[selectedTerm][category][group]?.forEach(course => {
                                        total.theory += Number(course.theory) || 0;
                                        total.comply += Number(course.comply) || 0;
                                        total.credit += Number(course.credit) || 0;
                                    });
                                });
                            });

                            return (
                                <tr className="text-center font-semibold">
                                    <td className="border-1 p-1"></td>
                                    <td className="border-1 p-1">รวม (ไม่เกิน 22 นก.)</td>
                                    <td className="border-1 p-1">{total.theory}</td>
                                    <td className="border-1 p-1">{total.comply}</td>
                                    <td className="border-1 p-1">{total.credit}</td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </table>

                {/* ส่วนกรอกชื่อบุคคล */}
                <div className="flex justify-between mt-2 px-10">
                    {[
                        {
                            title: "หัวหน้าแผนกวิชาเทคนิคคอมพิวเตอร์",
                            savedValue: savedHeadOfDepartment,
                            currentValue: headOfDepartment,
                            onChange: setHeadOfDepartment
                        },
                        {
                            title: "หัวหน้างานพัฒนาหลักสูตรการเรียนการสอน",
                            savedValue: savedHeadOfCurriculum,
                            currentValue: headOfCurriculum,
                            onChange: setHeadOfCurriculum
                        },
                        {
                            title: "รองผู้อำนวยการฝ่ายวิชาการ",
                            savedValue: savedDeputyDirector,
                            currentValue: deputyDirector,
                            onChange: setDeputyDirector
                        },
                        {
                            title: "ผู้อำนวยการวิทยาลัยเทคนิคแพร่",
                            savedValue: savedDirector,
                            currentValue: director,
                            onChange: setDirector
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
                                            onChange={(e) => item.onChange(e.target.value)}
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
                                        onChange={(e) => item.onChange(e.target.value)}
                                        className="border-b border-gray-400 w-40 text-center min-w-[200px]"
                                        placeholder="กรอกชื่อบุคคล"
                                    /> )
                                </div>
                            )}
                            <p>{item.title}</p>
                        </div>
                    ))}
                </div>

                {/* ปุ่มบันทึกด้านล่าง */}
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

export default PrintPlanSingle20;
