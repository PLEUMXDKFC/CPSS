import Createstudyplan from './Page/Createstudyplan'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Createstudyplan />} />
      </Routes>
    </Router>
  )
}

export default App
