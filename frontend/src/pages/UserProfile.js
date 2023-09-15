import React, { Fragment } from "react";
import { useEffect, useState } from "react";
import '../styles/UserProfile.css'
import { Card, Button } from 'antd';
import {CaretLeftOutlined, CaretRightOutlined} from "@ant-design/icons";

const UserProfile = props => {
    const { username } = props
    const [restsInfo, setRestsInfo] = useState([]);
    const { Meta } = Card;

    let sliderIdx = 0

    useEffect(() => {
        console.log("Loading User Profile")
        fetchCollection();
    }, []);

    const fetchCollection = () => {
        fetch('/api/saved')
            .then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        setRestsInfo(data)
                        console.log(restsInfo)
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
    }

    const moveSliderRight = () => {
        const card_ele = document.querySelector('.cards')
        const num_ele = card_ele.clientWidth / (240+60)
        if (sliderIdx < 10 / num_ele + 3) {
            sliderIdx += 1;
        }
        const sliderWidth = card_ele.clientWidth / num_ele
        card_ele.style.transform = `translate(${-sliderWidth*sliderIdx - 20}px)` 
        console.log(sliderIdx)
    }

    const moveSliderLeft = () => {
        if (sliderIdx > 0) {
            sliderIdx -= 1;
        }
        const card_ele = document.querySelector('.cards')
        const num_ele = card_ele.clientWidth / (240+60)
        const sliderWidth = card_ele.clientWidth / num_ele
        card_ele.style.transform = `translate(${-sliderWidth*sliderIdx - 20}px)` 
        console.log(sliderIdx)
    }


    const handleClick = (rest) => {
        console.log(rest)
        props.handleNavigate(rest)
    }

    const handleDelete = (restId) => {
        console.log(restId)
        fetch(`/api/saved/${restId}`, {
            method: 'DELETE',
        })
        .then(response => {
            console.log("delete restaurant: ", response)
            if (response.ok) {
                console.log('restaurant deleted successfully')
            }
        })
        .catch(error => {
            console.error(error)
        })
    }
    return (
        <Fragment >
            <div className="user-container">
                <h1 >Welcome, {username}!</h1>
                <div className="saved-container">
                    <h2>My Collection</h2>
                    <div className="saved-card-container">
                        <div><CaretLeftOutlined style={{fontSize: '40px'}} onClick={moveSliderLeft}/></div>
                            <div className="carousel-wrapper">
                                <div className="cards">
                                    {restsInfo.map((rest) => (
                                        <div key={rest.id} id={rest.name} className="card" onClick={() => handleClick(rest)}>
                                            <Card
                                                hoverable
                                                style={{
                                                    width: 240,
                                                }}
                                                cover={<img src={`data:image/png;base64,${rest.img}`} />}    
                                            >
                                                <Meta title={rest.name} description={`Rating: ${rest.rating}`} />
                                                <div className="button-container">
                                                    <Button className="delete-btn" type="primary" danger onClick={() => handleDelete(rest.id)}>
                                                        DELETE
                                                    </Button>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        <div><CaretRightOutlined style={{fontSize: '40px'}} onClick={moveSliderRight}/></div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default UserProfile;