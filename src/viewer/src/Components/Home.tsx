import styled from "styled-components";
import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";

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


function Home() {
    const navigate = useNavigate();
    async function createRoom() {
        fetch("/room", {method: "POST"})
            .then((d) => d.json())
            .then((d) => {
                const roomInfo = d;
                if (d.roomId) {
                    return navigate(`/room/${d.roomId}`);
                } else {
                    alert('방 생성에 문제가 있습니다!');
                }
            });
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

export default Home