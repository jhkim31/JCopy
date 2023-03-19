import styled from "styled-components";

const Container = styled.div`
    width: 100%;
`;

const Logo = styled.a`
    font-size: 2em;
    text-decoration: none;
    color: #1A9DF5;
    &:visited{
        color: #1A9DF5;
    }
    &:active{
        color: #1A9DF5;
    }

`



export default function Header() {
    return (
        <Container>
            <Logo href="/home">
                JCopy v1.0.1
            </Logo>
            <hr/>
        </Container>
    );
}
