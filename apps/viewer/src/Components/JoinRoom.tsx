import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import styled from "styled-components";

const Main = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
`;

const TextField = styled.input`
    width: 300px;
    height: 50px;
    font-size: 1.3em;
`

function JoinRoom(props: {clientId: string;}) {
    const clientId = props.clientId;
    console.log(`JoinRoom : ${clientId}`);
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");

    function inputHandler(e: React.ChangeEvent<HTMLInputElement>) {
        setRoomId(e.target.value);
    }

    async function enterPress(e: React.KeyboardEvent) {
        if (e.key == "Enter") {
            fetch(`/joinroom?roomId=${roomId}&clientId=${clientId}`, {method: "POST"})
                .then((d) => d.json())
                .then((d) => {
                    if (d.error == 0) {
                        const state = d;
                        return navigate(`/room/${d.roomId}`);
                    } else {
                        alert("해당 ID의 방이 없습니다!");
                    }
                });
        }
    }
    return (
        <Main>
            <TextField type="text" value={roomId} onChange={inputHandler} onKeyDown={enterPress} autoFocus placeholder="방 ID를 입력하고 엔터를 누르세요"></TextField>
        </Main>
    );
}

export default JoinRoom;
