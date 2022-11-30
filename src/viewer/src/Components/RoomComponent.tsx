import {useNavigate} from "react-router-dom";
import React, {useEffect, useState, useRef} from "react";
import styled from "styled-components";
import {FileUploader} from "react-drag-drop-files";

const Room = styled.div`
    width: 100%;
    height: 100%;
`;

const RoomID = styled.div`
    height: 50px;
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
    interface iRoomInfo {
        send: boolean,
        text: {
            id: String,
            value: String
        },
        files: String[],
        roomId: String,
        session: String
    }
    const roomInfo = useRef<iRoomInfo>({
        send: false,
        text: {
            id: "",
            value: "",
        },
        files: [],
        roomId: "",
        session: "",
    });
    const [textValue, setTextValue] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [session, setSession] = useState<string>("");
    const [files,setFiles] = useState<string[]>([]);

    useEffect(() => {
        const pathRoomId = window.location.pathname.replace("/room/", "");
        fetch(`/joinroom?roomId=${pathRoomId}`, {method: "POST"})
            .then((d) => d.json())
            .then((d) => {
                if (d.error == 0) {
                    setTextValue(d.text.value);
                    setRoomId(d.roomId);
                    setSession(d.session);
                    roomInfo.current.text = d.text;
                    roomInfo.current.session = d.session;
                    roomInfo.current.roomId = d.roomId;
                } else {
                    alert("해당 방이 없습니다!");
                    return navigate("/home");
                }
            });

        setInterval(() => {
            const ping = {
                ping: "ping",
            };
            ws.send(JSON.stringify(ping));
        }, 1000 * 10);

        setInterval(() => {
            if (roomInfo.current.send){
                ws.send(JSON.stringify(roomInfo.current));
                roomInfo.current.send = false;
            }
        }, 1000);

        ws.onmessage = (evt) => {
            setTextValue(evt.data);
            roomInfo.current.text.value = evt.data;
        };
    }, []);

    const [fileList, setFileList] = useState<File[]>([]);

    function textHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setTextValue(e.target.value);
        roomInfo.current.text.value = e.target.value;
        roomInfo.current.send = true;
    }

    const handleChange = (file: File) => {
        setFileList((prev) => {
            prev.push(file);
            return prev;
        });
    };
    return (
        <Room>
            <RoomID>
                <div>
                    {roomId}
                </div>
                <div>{session}</div>
            </RoomID>
            <TextField onChange={textHandler} value={textValue} />
            <div id="fileList">
                {fileList.map((item) => {
                    return <div key={Math.random()}>{item.toString()}</div>;
                })}
            </div>
            {/* <FileUploader handleChange={handleChange} name="file" types={fileTypes} /> */}
        </Room>
    );
}

export default RoomComponent;
