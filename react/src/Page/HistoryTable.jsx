import React from "react";
import Sidebar from "../components/sidebar";

const Plans = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="ml-64 flex-1 p-6">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">วิทยาลัยเทคโนโลยี</h1>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>ตารางสอนจันทร์เรียน ระดับชั้น.......ปวช.3.................แผนกวิชา......ช่างเทคนิคคอมพิวเตอร์.......กลุ่ม......1 - 2......จำนวนนักเรียน.............คน</p>
                                <p>ภาคเรียนที่..........2............... ปีการศึกษา..........2568................</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="border border-gray-400 px-4 py-2">
                                <p className="text-sm">เอกสารหมายเลข 6</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timetable */}
                <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2 text-sm">เวลา</th>
                                <th className="border border-gray-300 p-2 text-sm">07.30<br/>08.00</th>
                                <th className="border border-gray-300 p-2 text-sm">08.00<br/>09.00</th>
                                <th className="border border-gray-300 p-2 text-sm">09.00<br/>10.00</th>
                                <th className="border border-gray-300 p-2 text-sm">10.00<br/>11.00</th>
                                <th className="border border-gray-300 p-2 text-sm">11.00<br/>12.00</th>
                                <th className="border border-gray-300 p-2 text-sm">12.00<br/>13.00</th>
                                <th className="border border-gray-300 p-2 text-sm">13.00<br/>14.00</th>
                                <th className="border border-gray-300 p-2 text-sm">14.00<br/>15.00</th>
                                <th className="border border-gray-300 p-2 text-sm">15.00<br/>16.00</th>
                                <th className="border border-gray-300 p-2 text-sm">16.00<br/>17.00</th>
                                <th className="border border-gray-300 p-2 text-sm">17.00<br/>18.00</th>
                                <th className="border border-gray-300 p-2 text-sm">18.00<br/>19.00</th>
                            </tr>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-300 p-2 text-sm">วัน / คาบ</th>
                                <th className="border border-gray-300 p-2 text-sm"></th>
                                <th className="border border-gray-300 p-2 text-sm">1</th>
                                <th className="border border-gray-300 p-2 text-sm">2</th>
                                <th className="border border-gray-300 p-2 text-sm">3</th>
                                <th className="border border-gray-300 p-2 text-sm">4</th>
                                <th className="border border-gray-300 p-2 text-sm"></th>
                                <th className="border border-gray-300 p-2 text-sm">5</th>
                                <th className="border border-gray-300 p-2 text-sm">6</th>
                                <th className="border border-gray-300 p-2 text-sm">7</th>
                                <th className="border border-gray-300 p-2 text-sm">8</th>
                                <th className="border border-gray-300 p-2 text-sm">9</th>
                                <th className="border border-gray-300 p-2 text-sm">10</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Monday */}
                            <tr>
                                <td className="border border-gray-300 p-3 font-semibold text-center bg-gray-50">จันทร์</td>
                                <td className="border border-gray-300 p-3 h-24" rowSpan="5"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24" rowSpan="5"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                            </tr>
                            {/* Tuesday */}
                            <tr>
                                <td className="border border-gray-300 p-3 font-semibold text-center bg-gray-50">อังคาร</td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                            </tr>
                            {/* Wednesday */}
                            <tr>
                                <td className="border border-gray-300 p-3 font-semibold text-center bg-gray-50">พุธ</td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                            </tr>
                            {/* Thursday */}
                            <tr>
                                <td className="border border-gray-300 p-3 font-semibold text-center bg-gray-50">พฤหัสบดี</td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                            </tr>
                            {/* Friday */}
                            <tr>
                                <td className="border border-gray-300 p-3 font-semibold text-center bg-gray-50">ศุกร์</td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                                <td className="border border-gray-300 p-3 h-24"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Plans;
