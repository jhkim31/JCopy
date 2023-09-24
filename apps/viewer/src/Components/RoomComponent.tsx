import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { FileUploader } from "react-drag-drop-files";

const Room = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
`;

const RoomID = styled.div`
    height: 100px;
    font-size: 1.5em;
    font-weight:bold;
`;

const TextField = styled.textarea`
    width: 95%;
    height: 400px;
    margin: 10px;
`;

const FileRow = styled.div`
    &:hover {
        background: gray;
    }
`
const FileDeleteButton = styled.span`
    cursor: pointer;
    &:hover {
        color: red;
    }
`

function RoomComponent(props: { ws: WebSocket | null; clientId: string; }) {
    const navigate = useNavigate();
    const ws = props.ws;
    const clientId = props.clientId;
    interface iRoomInfo {
        send: boolean;
        text: {
            id: String;
            value: String;
        };
        files: String[];
        roomId: String;
    }
    const roomInfo = useRef<iRoomInfo>({
        send: false,
        text: {
            id: "",
            value: "",
        },
        files: [],
        roomId: "",
    });
    let expireTime = useRef<any>({
        time: Number
    });
    const [textValue, setTextValue] = useState<string>("");
    const [roomId, setRoomId] = useState<string>("");
    const [leftStorage, setLeftStorage] = useState(10_000_000);
    const [leftTime, setLeftTime] = useState(0);
    const [files, setFiles] = useState<string[]>([]);
    const [uploadFiles, setUploadFiles] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [file: string]: number }>({});

    useEffect(() => {
        const pathRoomId = window.location.pathname.replace("/room/", "");
        fetch(`/joinroom?roomId=${pathRoomId}&clientId=${clientId}`, { method: "POST" })
            .then((d) => d.json())
            .then((d) => {
                if (d.error == 0) {
                    setTextValue(d.text.value);
                    setRoomId(d.roomId);
                    setFiles(d.files);
                    setLeftStorage(d.leftStorage);
                    console.log(d.expireTime);
                    console.log(new Date(d.expireTime));
                    const t = new Date(d.expireTime).getTime();
                    expireTime.current.time = t;
                    setLeftTime(expireTime.current.time - new Date().getTime());
                    roomInfo.current.text = d.text;
                    roomInfo.current.roomId = d.roomId;
                    roomInfo.current.files = d.files;
                } else {
                    alert("해당 방이 없습니다!");
                    return navigate("/home");
                }
            });

        setInterval(() => {
            const leftTime = expireTime.current.time - new Date().getTime();
            setLeftTime(leftTime);
            if (leftTime > 0 && roomInfo.current.send && roomInfo.current.roomId != "") {
                ws?.send(
                    JSON.stringify({
                        type: "text",
                        roomId: roomInfo.current.roomId,
                        textId: roomInfo.current.text.id,
                        textValue: roomInfo.current.text.value,
                    })
                );
                roomInfo.current.send = false;
            }
            if (leftTime < 0) {
                alert("제한시간이 만료되었습니다.");
                window.location.href = "/home";
            }
        }, 1000);
        try {
            ws!.onmessage = (evt) => {
                const msg = JSON.parse(evt.data);
                switch (msg.type) {
                    case "text":
                        setTextValue(msg.msg);
                        roomInfo.current.text.value = msg.msg;
                        break;
                    case "file":
                        setFiles(msg.fileIds);
                        setLeftStorage(msg.leftStorage);
                        setUploadFiles((oldArr) => {
                            const tmp = new Set(oldArr);
                            for (const file of msg.fileIds) {
                                tmp.delete(file);
                            }
                            const newArr = Array.from(tmp);
                            return newArr;
                        });
                        roomInfo.current.files = msg.fileIds;
                        break;
                }
            };
        } catch (e) {
            console.error(e);
        }

    }, []);

    function textHandler(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setTextValue(e.target.value);
        roomInfo.current.text.value = e.target.value;
        roomInfo.current.send = true;

    }

    const handleChange = async (file: File) => {
        fetch(`/uploadable?roomId=${roomId}&size=${file.size}`)
            .then((d) => d.json())
            .then((d) => {
                if (d.res == 1) {
                    var xhr = new XMLHttpRequest();
                    const form = new FormData();
                    form.append("file", file);
                    const url = `/upload?room=${roomId}&name=${file.name}`;
                    setUploadFiles((oldArr) => {
                        const newArr = [...oldArr];
                        newArr.push(file.name);
                        return newArr;
                    });

                    xhr.onload = (e) => {
                        const d = JSON.parse(xhr.response);
                        if (d.error != 0) {
                            alert(`${d.file} : ${d.msg}`);
                        }
                        setUploadFiles((oldArr) => {
                            const tmp = new Set(oldArr);
                            tmp.delete(d.file);
                            const newArr = Array.from(tmp);
                            return newArr;
                        });
                    };

                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            var percentComplete = Math.floor((e.loaded / e.total) * 100);
                            console.log(percentComplete);
                            setUploadProgress((prev) => {
                                const newJson = { ...prev };
                                newJson[file.name] = percentComplete;
                                return newJson;
                            });
                        }
                    };

                    xhr.open("PUT", url);

                    xhr.send(form);
                    setUploadProgress((prev) => {
                        const newJson = { ...prev };
                        newJson[file.name] = 0;
                        return newJson;
                    });
                } else {
                    alert(d.msg);
                }
            });

    };

    function deleteFile(filename: String) {
        const url = `/file?room=${roomId}&name=${filename}`;
        fetch(url, {
            method: "DELETE",
        }).then((d) => console.log(d));
    }
    return (
        <Room>
            <RoomID>
                <div>공유 ID : <span onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("공유 URL이 복사되었습니다!");
                }}>{roomId}</span></div>
                <div>남은 용량 : {(leftStorage / 1_000_000).toFixed(1)}MB</div>
                <div>남은 시간 : {(leftTime / 1000) > 60 ? Math.floor((leftTime / 1000) / 60) + "분 " : ""}{leftTime > 0 ? Math.round(leftTime / 1000) % 60 : 0}초</div>
            </RoomID>
            <TextField placeholder="공유할 텍스트를 입력하세요" onChange={textHandler} value={textValue} />
            <div id="fileList">
                <div>업로드중 ...</div>
                {uploadFiles.map((item) => {
                    return (
                        <div>
                            <a>
                                {item} {uploadProgress[item]} %
                            </a>
                        </div>
                    );
                })}
                <hr />
                <div>공유됨</div>
                {files.map((item) => {
                    const url = `https://jcopy-bucket.s3.ap-northeast-2.amazonaws.com/${roomId}/${item}`;
                    return (
                        <FileRow>
                            <FileDeleteButton onClick={() => deleteFile(item)} >x </FileDeleteButton>
                            <a href={url} key={Math.random()} download>
                                {item}
                            </a>
                        </FileRow>
                    );
                })}
                <hr />
            </div>
            <FileUploader handleChange={handleChange} maxSize={10} name="file" />
        </Room>
    );
}

export default RoomComponent;
