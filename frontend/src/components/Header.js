import React, { Component, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { LogoutOutlined, LoginOutlined } from "@ant-design/icons";
import { Button, ConfigProvider } from 'antd';
import '../styles/Header.css';

function Header(props) {
  const {isSignedIn, username, handleLogout, handleLogin} = props;
  const navigate = useNavigate();

  const getProfile = () => {
    //TODO: redirect to user profile
    navigate('/userprofile')
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          // colorBgContainer: 'rgba(0,0,0,0)',
          colorPrimary: '#000',
          colorBorder: '#fff',
          colorPrimaryBg: "#fff",
          colorPrimaryHover: "#f7b731",
          colorPrimaryActive: "#000",
          fontSize:15,
          borderRadius: 15,
        },
      }}
    >
    <header className="App-header">
      {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <a className="title" href="/" style={{"color": "black", "text-decoration": "none"}}>NYEatery</a>
        <div className="nav-info">
          {isSignedIn ? (
            <Fragment>
              <div>Hello, {username}</div>
              <Button type="primary" size={"medium"} className= "profile" onClick={getProfile}>PROFILE</Button>
              <Button type="primary" size={"medium"} className= "logout" onClick={handleLogout}>LOGOUT</Button>    
            </Fragment>       
          ):(<Button type="primary" size={"medium"} className="login" onClick={handleLogin}>LOGIN</Button>)}
        </div>
      </header>  
  </ConfigProvider>
  );
}

export default Header;