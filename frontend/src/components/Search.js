import React, { Component, Fragment } from "react";
import { useEffect, useState } from "react";
import '../styles/Searchbar.css'
import { AutoComplete, Input, ConfigProvider} from 'antd';
import { SearchOutlined } from '@ant-design/icons';

function Search(props) {
    // const restsInfo = props.restsNames
    // const [options, setOptions] = useState([]);
    // const [value, setValue] = useState('');
    // const [anotherOptions, setAnotherOptions] = useState([]);


    const onSelect = (data) => {
        console.log(data)
        props.onSelect(data)
    };
    
    return (
        <ConfigProvider
            theme={{
                token: {
                colorPrimary: '#000',
                colorBorder: '#fff',
                colorPrimaryBg: "#fff",
                colorPrimaryActive: "#000",
                fontSize:15,
                borderRadius: 15,
                },
            }}
        >
            <div className="search-bar">
                {/* <SearchBar placeholder="Search restaurant by name"/> */}
                <SearchOutlined />
                <AutoComplete
                    options={props.restsNames}
                    style={{
                        width: '100%',
                    }}
                    onSelect={onSelect}
                    filterOption={(inputValue, option) =>
                        option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                    placeholder = "Search Restaurant by Name"
                >
                    
                </AutoComplete>
                
            </div>  
        </ConfigProvider>
    )
}

export default Search