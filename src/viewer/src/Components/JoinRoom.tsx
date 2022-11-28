import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

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
                if (d.error == 0){
                    const state = d;
                    return navigate(`/room/${d.roomId}`);
                } else {
                    alert('해당 방이 없습니다!');
                    return navigate('/home');
                }

            });
    }
    return (
        <div>
            <input type="text" value={roomId} onChange={inputHandler}></input>
            <button onClick={joinRoom}>join!</button>
        </div>
    );
}

export default JoinRoom;