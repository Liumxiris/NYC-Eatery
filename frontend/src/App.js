import React, { useState, useEffect} from "react";
import { useNavigate } from 'react-router-dom';
import './App.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import DashBoard from "./pages/DashBoard";
import UserProfile from "./pages/UserProfile";
import Restaurant from "./pages/Restaurant";
// import { Footer } from "antd/es/layout/layout";
import Footer from "./components/Footer"

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  // const [restInfo, setRestInfo] = useState([])
  // const [restPageID, setRestPageID] = useState("")
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Loading App for the first time");
    // TODO: Need to modify
    // make a fetch request to our /api/user
    // set isSignedIn & user based on the response
    fetch('/api/user')
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            setIsSignedIn(true)
            setUser(data)
          })
        } else {
          setIsSignedIn(false)
        }
      })
  }, []);

  const handleNavigate = (rest) => {
    if (rest) {
      // const id = rest[0]
      const id = rest.id
      navigate(`/restaurant/${id}`);
    }
  }

  const logout = () => {
    fetch("/api/logout", {
      method: 'POST'
    }).then(response => {
      if (response.ok) {
        window.alert("You've logged out!");
        window.location.href = '/'
      }
    })
  }

  const login = () => {
    fetch("/api/login/github").then(response => {
      if (response.ok) {
        response.json().then(data => {
          const redirectedURL = data.redirected
          console.log("redirected:", redirectedURL)
          window.location.href = redirectedURL
        })
      }
    })
  }

  return (
    <div>
      <Header isSignedIn={isSignedIn} username={user?.githubName ?? null} handleLogout={logout} handleLogin={login}/>
      <Routes>
        <Route exact path="/" element={<DashBoard isSignedIn={isSignedIn} handleNavigate={handleNavigate}/>} />
        <Route path="/restaurant/:restaurantID" element={<Restaurant user={user} isSignedIn={isSignedIn}/> } />
        <Route path="/userprofile" element={<UserProfile username={user?.githubName} handleNavigate={handleNavigate}/>}/>

        {/* <Route
          path="/user"
          element={
            <UserProfile
              onLogin={() => {
                setIsSignedIn(true);
              }}
            />
          }
        /> */}
        
      </Routes>
      <Footer />
    </div>
  )
}

export default App;
