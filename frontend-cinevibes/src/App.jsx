import { useState, useEffect } from 'react'
import {Routes, Route} from "react-router-dom";
import './App.css'
import './pages/Home.jsx'
import Home from "./pages/Home.jsx";
import MovieDetail from "./pages/MovieDetails.jsx"
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ChatWidget from "./components/ChatWidget.jsx";

function App() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedCineVibesUser')
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON)
            setUser(user)
        }
    }, [])
  return (
      <>
          <Header user={user} setUser={setUser} />
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetail user={user}/>} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/signup" element={<Signup />} />
          </Routes>
          <Footer />
          <ChatWidget />
      </>
  )
}

export default App
