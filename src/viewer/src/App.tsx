import React, {useEffect, useState} from "react";
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
    const ws = new WebSocket("ws://localhost:3000");
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

function Home() {
    const navigate = useNavigate();
    async function createRoom() {
        fetch("/room", {method: "POST"})
            .then((d) => d.json())
            .then((d) => {

                const roomInfo = d;
                return navigate(`/room/${d.roomId}`, {state: roomInfo});
            });
        // return navigate(`/room/1234`, {state: {}});
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

function RoomComponent(props: {ws: WebSocket}) {
    const location = useLocation();
    const ws = props.ws;
    const fileTypes = ["JPG", "PNG", "GIF"];
    const [text, setText] = useState([location.state.text.value, true]);
    const [localText, setLocalText] = useState(location.state.text.value);


    useEffect(() => {
        setInterval(() => {
            if (text[1]){
                const msg = {
                    textId: location.state.text.id,
                    textValue: text[0]
                }
                ws.send(JSON.stringify(msg));
                setText(prevText => {
                    prevText[1] = false;
                    return prevText;
                });
            }
        }, 1000);

        ws.onmessage = (evt) => {
            setLocalText(evt.data);
            setText(prevText => {
                prevText[0] = evt.data;
                prevText[1] = false;
                return prevText;
            });

        }
    }, [])

    const [fileList, setFileList] = useState<File[]>([]);

    function textHandler(e: React.ChangeEvent<HTMLTextAreaElement>){
        setLocalText(e.target.value);
        setText(prevText => {
            prevText[0] = e.target.value;
            prevText[1] = true;
            return prevText
        });
    }

    const handleChange = (file: File) => {
        setFileList((prev) => {
            prev.push(file);
            return prev;
        });
    };
    return (
        <Room>
            <RoomID>{location.state.roomId}</RoomID>
            <TextField onChange={textHandler} value={localText}/>
            <div id="fileList">
                {fileList.map((item) => {
                    return <div key={Math.random()}>{item.toString()}</div>;
                })}
            </div>
            <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
        </Room>
    );
}

function JoinRoom() {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");

    function inputHandler(e: React.ChangeEvent<HTMLInputElement>) {
        setRoomId(e.target.value);
    }
    async function joinRoom() {
        fetch(`/joinroom?roomId=${roomId}`, {method: "POST"})
            .then((d) => d.json())
            .then((d) => {
                const state = d;
                return navigate(`/room/${d.roomId}`, {state: state});
            });
        // return navigate(`/room/1234`, {state: {}});
    }
    return (
        <div>
            <input type="text" value={roomId} onChange={inputHandler}></input>
            <button onClick={joinRoom}>join!</button>
        </div>
    );
}
export default App;
