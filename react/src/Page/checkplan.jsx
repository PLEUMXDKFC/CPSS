import { useSearchParams } from 'react-router-dom';
import Checkplan from '../components/Checkplan';
import CheckplanPVS from '../components/CheckplanPVS';
import CheckplanPVSS from '../components/CheckplanPVSS';

function CheckplanPage() {
  const [searchParams] = useSearchParams();
  const planid = searchParams.get('planid');
  const course = searchParams.get('course');

  if (!planid) {
    return <div>ไม่พบ planid ใน URL</div>;
  }

  if (course === 'หลักสูตรประกาศนียบัตรวิชาชีพ') {
    return <Checkplan planid={planid} />;
  } else if (course === 'หลักสูตรประกาศนียบัตรวิชาชีพขั้นสูง') {
    return <CheckplanPVS planid={planid} />;
  } else if (course === 'หลักสูตรประกาศนียบัตรวิชาชีพขั้นสูง (ม.6)') {
    return <CheckplanPVSS planid={planid} />;
  } else {
    return (
      <div>
        <h2>ไม่พบข้อมูลของหลักสูตร</h2>
        <p>กรุณาลองใหม่อีกครั้ง</p>
      </div>
    );
  }
}

export default CheckplanPage;
