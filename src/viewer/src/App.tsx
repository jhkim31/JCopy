import React, {useState} from "react";
import {BrowserRouter, Routes, Route, redirect, useNavigate, useLocation} from "react-router-dom";
import "./App.css";
import styled from "styled-components";
import {FileUploader} from "react-drag-drop-files";

const Main = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: #2a9df5;
`;

const HomeBtn = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 200px;
    background: gray;
    margin: 20px;
`;

const Room = styled.div`
    width: 100%;
    height: 100%;
`;

const RoomID = styled.div`
    height: 70px;
    background: yellow;
`;

const TextField = styled.textarea`
    width: 90%;
    height: 400px;
    margin: 10px;
`;

function App() {
    const ws = new WebSocket('ws://localhost:3000');
    return (
        <Main>
            <BrowserRouter>
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/joinroom" element={<JoinRoom />} />
                    <Route path="/room/*" element={<RoomComponent />} />
                </Routes>
            </BrowserRouter>
        </Main>
    );
}

function Home() {
    const navigate = useNavigate();
    async function createRoom() {
        return navigate(`/room/${1234}`, {state : {param1: 123, param2 : 456}});
        // fetch('/room', {method: "POST"})
        // .then(d => d.json())
        // .then(d => {
        //     console.log(d);

        // })

    }

    async function joinRoom() {
        return navigate("/joinroom");
    }
    return (
        <Main>
            <HomeBtn onClick={createRoom}>방만들기</HomeBtn>
            <HomeBtn onClick={joinRoom}>참가하기</HomeBtn>
        </Main>
    );
}

function RoomComponent() {
    const location = useLocation();
    console.log(location)
    const fileTypes = ["JPG", "PNG", "GIF"];
    const [file, setFile] = useState<File>();
    const [fileList, setFileList] = useState<File[]>([])
    const handleChange = (file: File) => {
        setFile(file);
        setFileList(prev => {
            prev.push(file)
            return prev
        })
    };
    return (
        <Room>
            <RoomID>ID : 1234</RoomID>
            <TextField></TextField>
            <div id = "fileList">
                {
                    fileList.map(item => {
                        return <div key={Math.random()}>{item.toString()}</div>
                    })
                }
            </div>
            <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
        </Room>
    );
}

function JoinRoom() {
    const navigate = useNavigate();
    async function joinRoom() {
        return navigate("/room/1234");
    }
    return (
        <div>
            <input type="text"></input>
            <button onClick={joinRoom}>join!</button>
        </div>
    );
}
export default App;
