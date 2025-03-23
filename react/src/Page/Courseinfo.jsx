import React from 'react';
import { Link, useParams } from 'react-router-dom'; // นำเข้า useParams
import Sidebar from '../components/sidebar';
import CourseTable from '../components/Tableinfo';

function Courseinfo() {
  // รับค่า planid จาก URL Parameters
  const { planid } = useParams();

  return (
    <div>
      <Sidebar />
      <div className='ml-65 mt-6'>
        {/* ปุ่มย้อนกลับ */}
        <Link to="/dashboard" className='bg-red-500 text-white rounded-lg py-3 px-6 ml-5 hover:bg-red-600 transition'>ย้อนกลับ</Link>

        {/* หัวข้อหลัก */}
        <h1 className='text-center font-bold text-lg'>ข้อมูลรายวิชา</h1>

        {/* หมวดวิชาสมรรถนะแกนกลาง */}
        <span className='text-lg ml-5'>1.หมวดวิชาสมรรถนะแกนกลาง</span>
        <div className='ml-10'>
          <br />
          <span className='text-lg ml-5'>1.1 กลุ่มสมรรถนะภาษาและการสื่อสาร</span>
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
          <span className='text-lg ml-5'>1.2 กลุ่มสมรรถนะการคิดและการแก้ปัญหา</span>
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
          <span className='text-lg ml-5'>1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent('1.หมวดวิชาสมรรถนะแกนกลาง')}&subcategory=${encodeURIComponent('1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
            className='ml-5 text-blue-500 text-lg'
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
        </div>
        <CourseTable planid={planid} subject_groups={"1.3 กลุ่มสมรรถนะสังคมและการดำรงชีวิต"}  subject_category={"1.หมวดวิชาสมรรถนะแกนกลาง"}/>

        <div className='mt-5'>
          <span className='text-lg ml-5'>2. หมวดวิชาสมรรถนะวิชาชีพ</span>
          <div className='ml-10'>
            <br />
            <span className='text-lg ml-5'>2.1 กลุ่มสมรรถนะวิชาชีพพื้นฐาน</span>
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
            <span className='text-lg ml-5'>2.2 กลุ่มสมรรถนะวิชาชีพเฉพาะ</span>
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
          <span className='text-lg ml-5'>3.หมวดวิชาเลือกเสรี</span>
          <Link
            to={`/courseadd?category=${encodeURIComponent('3.หมวดวิชาเลือกเสรี')}&subcategory=${encodeURIComponent('')}&planid=${planid}`} // ส่ง category, subcategory และ planid ผ่าน URL parameters
            className='ml-5 text-blue-500 text-lg'
          >
            เพิ่มข้อมูลรายวิชา
          </Link>
          <CourseTable planid={planid} subject_groups={""} subject_category={"3.หมวดวิชาเลือกเสรี"} />
        </div>

        <div className='mt-5'>
          <span className='text-lg ml-5'>4.กิจกรรมเสริมหลักสูตร</span>
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