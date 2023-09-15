import React, { Component, Fragment } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Card } from 'antd';
import { Button, ConfigProvider } from 'antd';
import { Input } from 'antd';
import star from "../star.png"
import '../styles/Restaurant.css'

function Restaurant(props) {
    const { user } = props
    const { isSignedIn } = props
    const { Meta } = Card;
    const { TextArea } = Input;
    
    const [restId, setRestId] = useState("")
    const [comments, setComments] = useState([]);
    const [restInfo, setRestInfo] = useState({});
    const navigate = useNavigate();

    useEffect(()=> {
        //fetching detailed restaurant info
        const path = window.location.pathname.split('/')
        fetch(`/api/restaurant/${path[2]}`).then(response => {
            if (response.ok){
                response.json().then(data => {
                    setRestInfo(data)
                    setRestId(data.id)
                })
            }
        })
        fetchingComments()
    },[])

    const fetchingComments = () => {
        //Fetch all comments from the database
        const path = window.location.pathname.split('/')
        fetch(`/api/comments/${path[2]}`).then(response => {
            if (response.ok) {
                response.json().then(data => {
                console.log(data)
                setComments([...data])
              })
            } else {
                throw new Error ("Comment Fetching failed")
            }
        }).catch(error => {
            throw(error)
        })
    }

    const saveRest = (restId) => {
        console.log(restId)
        fetch(`/api/saved/${restId}`, {
            method: 'POST',
        })
        .then(response => {
            console.log("save restaurant: ", response)
            if (response.ok) {
                console.log('restaurant saved successfully')
            }
        })
        .catch(error => {
            console.error(error)
        })
        navigate("/userprofile")
    }

    const addComments = () => {
        const val = document.getElementById('comment-input').value
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const date = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const timestamp = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
        //API call to add comments
        fetch(`/api/comments/${restId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({content: val, restaurantID: restId, time:timestamp, user:user})
          }).then(response => {
            if (response.ok) {
              console.log("created new comment!")
              fetchingComments()
            } else {
                window.alert("You are not logged in");
                window.location.href = window.location.pathname
                throw new Error ("Comment creation failed")
            }
        }).catch(error => {
            throw(error)
        })
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
        <Fragment>
            <div className = "rest-container">
                <div id = "rest-info">
                    <div id ="rest-image">
                        <h1>{restInfo.name}</h1>
                         <Card
                            style={{ width: 400 }}
                            cover={
                            <img
                                id="rest-page-img" 
                                src={`data:image/png;base64,${restInfo.img}`}
                            />
                            }
                            >
                            <Meta
                            avatar={<Avatar src={star} width="20" />}
                            title="Rating"
                            description={`${restInfo.rating}`}
                            />
                        </Card>
                        <br></br>
                        {isSignedIn && (<Button type="primary" id="save-btn" size={"large"} onClick={() => saveRest(restInfo.id)}>SAVE TO COLLECTION</Button>) }
                    </div>
                    <div id="rest-comments">
                        <h1>COMMENTS</h1>
                        <TextArea rows={4} id="comment-input" placeholder="Leave your comments" maxLength={200} />
                        <Button type="primary" id="submit-btn" size={"large"} onClick={addComments}>SUBMIT</Button>
                        <div id="comments">
                            {comments.map((comment) => (
                                <div key={comment.restaurantID} className="comments-card">
                                    <Card title={`${comment.user}`} bordered={false}>
                                        <p>{comment.time}</p>
                                        <p>{comment.content}</p>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* <div id="rest-detailed-info">
                        <h1>DETAIL</h1>
                    </div> */}
                </div>
            </div>
        </Fragment>
        </ConfigProvider>
    )
}

export default Restaurant