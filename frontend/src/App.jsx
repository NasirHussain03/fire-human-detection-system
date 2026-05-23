import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar         from './components/Navbar'
import Home           from './pages/Home'
import Upload         from './pages/Upload'
import LiveMonitoring from './pages/LiveMonitoring'
import Dashboard      from './pages/Dashboard'
import History        from './pages/History'
import About          from './pages/About'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />}           />
        <Route path="/upload"    element={<Upload />}         />
        <Route path="/live"      element={<LiveMonitoring />} />
        <Route path="/dashboard" element={<Dashboard />}      />
        <Route path="/history"   element={<History />}        />
        <Route path="/about"     element={<About />}          />
      </Routes>
    </BrowserRouter>
  )
}
