import React, { Component, Fragment } from "react";
import { useEffect, useState } from "react";
import Search from "../components/Search";
import '../styles/Dashboard.css'
import { Card } from 'antd';
import {CaretLeftOutlined, CaretRightOutlined} from "@ant-design/icons";

const BASE_URL = "https://maps.googleapis.com/maps/api/place"
const PHOTO_HEIGHT=200
const PHOTO_WIDTH=200

function DashBoard(props) {
    const [selectedRest, setSelectedRest] = useState("")
    const [restsInfo, setRestsInfo] = useState([])
    const [restsNames, setRestsNames] = useState([])
    const [restsDict, setRestsDic] = useState({})
    
    const { Meta } = Card;

    let sliderIdx = 0

    useEffect(() => {
        fetch('/api/allrestaurants')
          .then(response => {
            if (response.ok) {
              response.json().then(data => {
                if (restsInfo.length == 0) {
                    setRestsInfo([...data])
                    setRestsNames(getAllNames([...data]))
                }
              })
            } 
          })
      }, []);
      
      useEffect(() => {
        fetch(`/api/search/${selectedRest}`)
            .then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        console.log(data)
                        props.handleNavigate(data)
                    })
                }
            })
        // const selectedInfo = restsDict[selectedRest]
        // if (selectedInfo){
        //     props.handleNavigate(selectedInfo)
        //     console.log(selectedInfo)
        // }
      }, [selectedRest])

    const getAllNames = (restsInfo) => {
        const names = []
        restsInfo.forEach(rest => {
            const option = {
                value: rest.name,
                id: rest.id
            }
            names.push(option)
            addNewPair(rest.name, [rest.id, rest.rating, rest.name, rest.img])
        });
        return names
    }

    const addNewPair = (key, value) => {
        setRestsDic(prevState => {
          return { ...prevState, [key]: value };
        });
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
    //     const selectedInfo = restsDict[event.currentTarget.id]
    //     console.log(selectedInfo)
    //     props.handleNavigate(selectedInfo)
        // console.log(event.currentTarget.id)
        console.log(rest)
        props.handleNavigate(rest)
    }

    return (
        <Fragment>
            <div className="dash-container">
                <Search restsNames={restsNames} onSelect={setSelectedRest}/>
                <div className="rest-info-container">
                    <h2>Picked For You</h2>
                        <div className="rest-card-container">
                            <div><CaretLeftOutlined style={{fontSize: '40px'}} onClick={moveSliderLeft}/></div>
                            <div className="carousel-wrapper">
                                <div className="cards">
                                    {/* only displaying 10 restaurants */}
                                    {restsInfo.slice(0, 10).map((rest) => (
                                        <div key={rest.id} id={rest.name} className="card" onClick={() => handleClick(rest)}>
                                            <Card
                                                hoverable
                                                style={{
                                                    width: 240,
                                                }}
                                                cover={<img src={`data:image/png;base64,${rest.img}`} />}    
                                            >
                                                <Meta title={rest.name} description={`Rating: ${rest.rating}`} />
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

export default DashBoard;