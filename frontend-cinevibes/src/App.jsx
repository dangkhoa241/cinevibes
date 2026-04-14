import { useState } from 'react'
import {Routes, Route} from "react-router-dom";
import './App.css'
import './pages/Home.jsx'
import Home from "./pages/Home.jsx";
import MovieDetail from "./pages/MovieDetails.jsx"

function App() {
  const [count, setCount] = useState(0)

  return (
    // <>
    //     <Home></Home>
    // </>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
      </Routes>
  )
}

export default App
