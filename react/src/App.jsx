import Createstudyplan from './Page/Createstudyplan'
import Redirectmohou from './Page/Redirectmohou'
import Intomohou from './Page/Intomohou'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Createstudyplan />} />
        <Route path="/Intomohou" element={<Intomohou />} />   
        <Route path="/Redirectmohou/:planid" element={<Redirectmohou />} />
      </Routes>
    </Router>
  )
}

export default App
