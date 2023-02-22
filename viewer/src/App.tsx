import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";
import RoomComponent from "./Components/RoomComponent";
import JoinRoom from "./Components/JoinRoom";
import Home from "./Components/Home";
import "./App.css"

const Main = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: #2a9df5;
`;


function App() {
    const host = window.location.host;
    let ws = new WebSocket(`wss://${host}`);

    return (
        <Main>
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