import {useNavigate} from "react-router-dom";
import React, {useEffect, useState, useRef} from "react";
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
    const navigate = useNavigate();
    const ws = props.ws;
    const fileTypes = ["JPG", "PNG", "GIF"];
    const [roomInfo, setRoomInfo] = useState({
        text: {
            id: "",
            value: "",
        },
        files: [],
        roomId: "",
        session: "",
    });

    useEffect(() => {
        const pathRoomId = window.location.pathname.replace("/room/", "");
        fetch(`/joinroom?roomId=${pathRoomId}`, {method: "POST"})
            .then((d) => d.json())
            .then((d) => {
                if (d.error == 0) {
                    setRoomInfo((prev) => {
                        const current = {...prev};
                        current.text = d.text;
                        current.roomId = d.roomId;
                        current.session = d.session;
                        return current;
                    });
                } else {
                    alert("해당 방이 없습니다!");
                    return navigate("/home");
                }
            });
        setInterval(() => {
            const ping = {
                ping: 'ping'
            }
            ws.send(JSON.stringify(ping));
        }, 1000 * 10);

        ws.onmessage = (evt) => {
            setRoomInfo((prev) => {
                const current = {...prev};
                current.text.value = evt.data;
                return current;
            });
        };
    }, []);

    const [fileList, setFileList] = useState<File[]>([]);

    function textHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setRoomInfo((prev) => {
            const current = {...prev};
            current.text.value = e.target.value;
            return current;
        });

        ws.send(JSON.stringify(roomInfo));
    }

    const handleChange = (file: File) => {
        setFileList((prev) => {
            prev.push(file);
            return prev;
        });
    };
    return (
        <Room>
            <RoomID>{roomInfo.roomId}</RoomID>
            <div>{roomInfo.session}</div>
            <TextField onChange={textHandler} value={roomInfo.text.value} />
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
