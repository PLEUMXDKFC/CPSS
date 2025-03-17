import Createstudyplan from './Page/Createstudyplan'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Intogroupinfo from './Page/Intogroupinfo'
import Groupinfo from './Page/Groupinfo'

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

export default App
