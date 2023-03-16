import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import styled from "styled-components";
import RoomComponent from "./Components/RoomComponent";
import JoinRoom from "./Components/JoinRoom";
import Home from "./Components/Home";
import "./App.css";

const Wrapper = styled.div`
    height:100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #2a9df5;
`
const MainPage = styled.div`
    width:100%;
    flex: 1;
`;

const Footer = styled.footer`
    height: 100px;
`;

const Header = styled.header`
    height: 100px;
`

function App() {
    const host = window.location.host;
    let ws;

    if (window.location.protocol == "https:"){
        ws = new WebSocket(`wss://${window.location.host}`);
    } else {
        ws = new WebSocket(`ws://${window.location.host}`);
    }


    return (
        <Wrapper>
            <MainPage>
                <BrowserRouter>
                    <Routes>
                        <Route path="/home" element={<Home />} />
                        <Route path="/joinroom" element={<JoinRoom />} />
                        <Route path="/room/*" element={<RoomComponent ws={ws} />} />
                    </Routes>
                </BrowserRouter>
            </MainPage>
            <Footer>Copyright 김재현</Footer>
        </Wrapper>
    );
}

export default App;
