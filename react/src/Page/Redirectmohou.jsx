import React from 'react'
import { useSearchParams } from 'react-router-dom';
import Mohou from '../components/Mohou';
import MohouPVS from '../components/MohouPVS';
import MohouPVSS from '../components/MohouPVSS';

function Redirectmohou() {
    const [searchParams] = useSearchParams();
    const course = searchParams.get('course');

  // ตรวจสอบค่า course แล้ว render component ที่ต้องการ
  if (course === 'หลักสูตรประกาศณียบัตรวิชาชีพ') {
    return <Mohou />;
  } else if (course === 'หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง') {
    return <MohouPVS />;
  } else if (course === 'หลักสูตรประกาศณียบัตรวิชาชีพขั้นสูง (ม.6)') {
    return <MohouPVSS />;
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
