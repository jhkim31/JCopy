import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";
import RoomComponent from "./Components/RoomComponent";
import JoinRoom from "./Components/JoinRoom";
import Home from "./Components/Home";

const Main = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: #2a9df5;
`;


function App() {
    const host = window.location.host;
    let ws = new WebSocket(`ws://${host}`);

    return (
        <Main>
            <a href="https://jcopy-storage.s3.ap-northeast-2.amazonaws.com/Unknown.png" download="sample.png">download!</a>
            <BrowserRouter>
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/joinroom" element={<JoinRoom />} />
                    <Route path="/room/*" element={<RoomComponent ws={ws}/>} />
                </Routes>
            </BrowserRouter>
        </Main>
    );
}

export default App;