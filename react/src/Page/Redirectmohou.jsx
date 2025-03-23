import React from 'react'
import { useSearchParams } from 'react-router-dom';
import Mohou from '../components/Mohou';
import MohouPVS from '../components/MohouPVS';

function Redirectmohou() {
    const [searchParams] = useSearchParams();
    const course = searchParams.get('course');
  console.log(course);

  // ตรวจสอบค่า course แล้ว render component ที่ต้องการ
  if (course === 'หลักสูตรประกาศณียบัตรวิชาชีพ') {
    return <Mohou />;
  } else if (course === 'หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง' || course === 'หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง ม.6') {
    return <MohouPVS />;
  } else {
    return (
      <div>
        <h2>ไม่พบข้อมูลของหลักสูตร</h2>
        <p>กรุณาลองใหม่อีกครั้ง</p>
      </div>
    );
  }
}

export default Redirectmohou
