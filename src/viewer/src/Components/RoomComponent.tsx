import {BrowserRouter, Routes, Route, redirect, useNavigate, useLocation} from "react-router-dom";
import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {FileUploader} from "react-drag-drop-files";

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

function RoomComponent(props: {ws: WebSocket}) {
    const reactLocation = useLocation();
    const navigate = useNavigate();
    const ws = props.ws;
    const fileTypes = ["JPG", "PNG", "GIF"];
    const [textId, setTextId] = useState('');
    const [text, setText] = useState('');
    const [roomId, setRoomId] = useState('');
    const [roomInfo, setRoomInfo] = useState({});
    const [session, setSession] = useState('');

    useEffect(() => {
        const pathRoomId = window.location.pathname.replace('/room/', '');
        fetch(`/joinroom?roomId=${pathRoomId}`, {method: "POST"})
        .then(d => d.json())
        .then(d => {
            if (d.error == 0){
                setTextId(d.text.id);
                setText(d.text.value);
                setRoomId(d.roomId);
                setSession(d.session)
            } else {
                alert('해당 방이 없습니다!');
                return navigate('/home');
            }
        })

        ws.onmessage = (evt) => {
            setText(evt.data);
        }
    }, [])

    const [fileList, setFileList] = useState<File[]>([]);

    function textHandler(e: React.ChangeEvent<HTMLTextAreaElement>){
        setText(e.target.value);
        const msg = {
            roomId: roomId,
            textId: textId,
            textValue: e.target.value
        }
        ws.send(JSON.stringify(msg));
    }

    const handleChange = (file: File) => {
        setFileList((prev) => {
            prev.push(file);
            return prev;
        });
    };
    return (
        <Room>
            <RoomID>{roomId}</RoomID>
            <div>{session}</div>
            <TextField onChange={textHandler} value={text}/>
            <div id="fileList">
                {fileList.map((item) => {
                    return <div key={Math.random()}>{item.toString()}</div>;
                })}
            </div>
            <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
        </Room>
    );
}

export default RoomComponent;