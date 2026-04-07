import { useState } from 'react'
import './App.css'
import './pages/Home.jsx'
import Home from "./pages/Home.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <Home></Home>
    </>
  )
}

export default App
