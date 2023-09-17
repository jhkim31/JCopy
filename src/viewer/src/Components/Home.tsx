import styled from "styled-components";
import {useNavigate} from "react-router-dom";

const Main = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
`;

const HomeBtn = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 200px;
    height: 100px;
    background: white;

    margin: 20px;
    &:hover {
        background-color: gray;
    }
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
                    alert("방 생성에 문제가 있습니다!");
                }
            });
    }

    async function joinRoom() {
        return navigate("/joinroom");
    }
    return (
        <Main>
            <HomeBtn onClick={createRoom}>공유하기</HomeBtn>
            <HomeBtn onClick={joinRoom}>공유받기</HomeBtn>
        </Main>
    );
}

export default Home;
