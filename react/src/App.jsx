import Createstudyplan from './Page/Createstudyplan'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Intogroupinfo from './Page/Intogroupinfo'
import Groupinfo from './Page/Groupinfo'

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
    <Router>
      <Routes>
        <Route path="/" element={<Createstudyplan />} />
        <Route path="/Intogroupinfo" element={<Intogroupinfo />} />
        <Route path="/Groupinfo/:planid" element={<Groupinfo />} />
      </Routes>
    </Router>
  )
}

export default App;
