import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import styled from "styled-components";
import RoomComponent from "./Components/RoomComponent";
import JoinRoom from "./Components/JoinRoom";
import Home from "./Components/Home";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import "./App.css";

const Wrapper = styled.div`
    height:100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #bbb;
`
const MainPage = styled.div`
    width:90%;
    flex: 1;
`;

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
            <Header/>
            <MainPage>
                <BrowserRouter>
                    <Routes>
                        <Route path="/home" element={<Home />} />
                        <Route path="/joinroom" element={<JoinRoom />} />
                        <Route path="/room/*" element={<RoomComponent ws={ws} />} />
                    </Routes>
                </BrowserRouter>
            </MainPage>
            <Footer/>
        </Wrapper>
    );
}

export default App;
