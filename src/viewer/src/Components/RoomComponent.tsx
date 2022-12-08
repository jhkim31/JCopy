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
    interface iRoomInfo {
        send: boolean;
        text: {
            id: String;
            value: String;
        };
        files: String[];
        roomId: String;
        session: String;
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
    const [files, setFiles] = useState<string[]>([]);
    const [uploadFiles, setUploadFiles] = useState<string[]>([]);

    useEffect(() => {
        const pathRoomId = window.location.pathname.replace("/room/", "");
        fetch(`/joinroom?roomId=${pathRoomId}`, {method: "POST"})
            .then((d) => d.json())
            .then((d) => {
                if (d.error == 0) {
                    setTextValue(d.text.value);
                    setRoomId(d.roomId);
                    setSession(d.session);
                    setFiles(d.files);

                    roomInfo.current.text = d.text;
                    roomInfo.current.session = d.session;
                    roomInfo.current.roomId = d.roomId;
                    roomInfo.current.files = d.files;
                } else {
                    alert("해당 방이 없습니다!");
                    return navigate("/home");
                }
            });

        setInterval(() => {
            const heartbeat = {
                type: "heartbeat",
            };
            ws.send(JSON.stringify(heartbeat));
        }, 1000 * 10);

        setInterval(() => {
            if (roomInfo.current.send && roomInfo.current.roomId != "") {
                // text change event
                ws.send(
                    JSON.stringify({
                        type: "text",
                        roomId: roomInfo.current.roomId,
                        textId: roomInfo.current.text.id,
                        textValue: roomInfo.current.text.value,
                    })
                );
                roomInfo.current.send = false;
            }
        }, 1000);

        ws.onmessage = (evt) => {
            const msg = JSON.parse(evt.data);
            switch (msg.type) {
                case "text":
                    setTextValue(msg.msg);
                    roomInfo.current.text.value = msg.msg;
                    break;
                case "file":
                    setFiles(msg.fileIds);
                    setUploadFiles(oldArr => {
                        const tmp = new Set(oldArr);
                        for(const file of msg.fileIds){
                            tmp.delete(file);
                        }
                        const newArr = Array.from(tmp);
                        return newArr;
                    });
                    roomInfo.current.files = msg.fileIds;
                    break;
            }
        };
    }, []);

    function textHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setTextValue(e.target.value);
        roomInfo.current.text.value = e.target.value;
        roomInfo.current.send = true;
    }

    const handleChange = (file: File) => {
        const form = new FormData();
        form.append("file", file);
        const url = `http://${window.location.host}/upload?room=${roomId}&name=${file.name}`
        setUploadFiles((oldArr) => {
            const newArr = [...oldArr];
            newArr.push(file.name);
            return newArr;
        });

        fetch(url, {
            method: "PUT",
            body: form,
        });
    };

    function deleteFile (filename:String){
        const url = `http://${window.location.host}/file?room=${roomId}&name=${filename}`;
        fetch(url, {
            method: "DELETE"
        })
        .then(d => console.log(d));
    }
    return (
        <Room>
            <RoomID>
                <div>{roomId}</div>
                <div>{session}</div>
            </RoomID>
            <TextField onChange={textHandler} value={textValue} />
            <div id="fileList">
                <div>업로드중 ...</div>
                {uploadFiles.map((item) => {
                    return (
                        <div>
                            <a>{item}</a>
                        </div>
                    );
                })}
                <hr/>
                <div>공유됨</div>
                {files.map((item) => {
                    const url = `https://jcopy-storage.s3.ap-northeast-2.amazonaws.com/${roomId}/${item}`;
                    return (
                        <div>
                            <span onClick={() => deleteFile(item)}>x </span>
                            <a href={url} key={Math.random()} download>
                                {item}
                            </a>
                        </div>
                    );
                })}
                <hr/>
            </div>
            <FileUploader handleChange={handleChange} name="file" />
        </Room>
    );
}

export default RoomComponent;
