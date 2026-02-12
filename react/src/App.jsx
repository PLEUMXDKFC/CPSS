import { Routes, Route } from 'react-router-dom';

import Test from './Page/Test';
import LoginPage from './Page/LoginPage';
import Createstudyplan from './Page/Createstudyplan';
import Groupinfo from './Page/Groupinfo';
import StudyPlan from './Page/study-plan';
import Plan from './Page/plan';
import Plansubject from './Page/add-subject';
import Intogroupinfo from './Page/Intogroupinfo';
import Intoplan from './Page/Intoplan';
import Intoprintplan from './Page/intoprintplan';
import Printplan from './Page/printplan';
import Courseinfo from './Page/Courseinfo';
import Courseadd from './Page/Courseadd';
import Redirectmohou from './Page/Redirectmohou';
import Intomohou from './Page/Intomohou';
import Makeplan from './Page/makeplan';
import Intocheckplan from './Page/intocheckplan';
import Checkplan from './Page/checkplan';
import Intoviewplan from './Page/intoviewplan';
import Viewplan from './Page/view-plan';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Test />} />
      <Route path="/Createstudyplan" element={<Createstudyplan />} />
      <Route path="/LoginPage" element={<LoginPage />} />
      <Route path="/Groupinfo/:planid" element={<Groupinfo />} />
      <Route path="/study-plan/:planid" element={<StudyPlan />} />
      <Route path="/plan/:infoid" element={<Plan />} />
      <Route path="/add-subject" element={<Plansubject />} />
      <Route path="/intogroupinfo" element={<Intogroupinfo />} />
      <Route path="/intoplan" element={<Intoplan />} />
      <Route path="/intoprintplan" element={<Intoprintplan />} />
      <Route path="/printplan" element={<Printplan />} />
      <Route path="/Courseinfo" element={<Courseinfo />} />
      <Route path="/Courseinfo/:planid" element={<Courseinfo />} />
      <Route path="/Courseadd" element={<Courseadd />} />
      <Route path="/Intomohou" element={<Intomohou />} />
      <Route path="/Redirectmohou/:planid" element={<Redirectmohou />} />
      <Route path="/makeplan" element={<Makeplan />} />
      <Route path="/intocheckplan" element={<Intocheckplan />} />
      <Route path="/checkplan" element={<Checkplan />} />
      <Route path="/intoviewplan" element={<Intoviewplan />} />
      <Route path="/view-plan" element={<Viewplan />} />
    </Routes>
  );
}

export default App;
