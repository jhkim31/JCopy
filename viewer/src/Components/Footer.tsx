import styled from "styled-components";

const Container = styled.div`
    width: 90%;
    height: 100px;
    text-align: center;
`;

export default function Footer() {
    return (
        <Container>
            <div>
            <hr/>
                Copyright <a href="https://github.com/jhkim31">jhkim31</a>
            </div>
            <div>
                <a href="https://github.com/jhkim31/JCopy/blob/J165-10-UI-Improve/License">License</a>
            </div>
        </Container>
    );
}
