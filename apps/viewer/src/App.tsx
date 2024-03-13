import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [clientId, setClientId] = useState("");

    useEffect(() => {
        let newWs;
        if (window.location.protocol == "https:") {
            newWs = new WebSocket(`wss://${window.location.host}/ws`);
        } else {
            newWs = new WebSocket(`ws://${window.location.host}/ws`);
        }
        newWs.onopen = (e) => {
            console.log("open");
        }

        newWs.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            console.log(msg.clientId);
            if (msg.type == "init") {
                setClientId(msg.clientId);
            }
        }

        setWs(newWs);
    }, [])

    return (
        <Wrapper>

            <Header />
            {clientId != "" && <MainPage>
                <BrowserRouter>
                    <Routes>
                        <Route path="/home" element={<Home clientId={clientId} />} />
                        <Route path="/joinroom" element={<JoinRoom clientId={clientId} />} />
                        <Route path="/room/*" element={<RoomComponent ws={ws} clientId={clientId} />} />
                    </Routes>
                </BrowserRouter>
            </MainPage>}

            <Footer />
        </Wrapper>
    );
}

export default App;
