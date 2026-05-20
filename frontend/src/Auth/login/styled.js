import styled from "styled-components";

const LoginForm = styled.div`
    width:40vw;
    height:60vh;
    border-radius:10px;
    padding:1rem;
    display:flex;
    flex-direction:column;
    align-items: center;
    position:absolute;
    top:50%;
    left:50%;
    transform: translate(-50%,-50%);
    background: linear-gradient(135deg, #ff9a9e, #fad0c4, #a18cd1, #fbc2eb);
    box-shadow:0 0 50px 1px;
`


const LoginTitle = styled.div`
    font-size:2rem;
    font-weight: bold;
    text-align:center;
    color:purple
`


const LoginBody = styled.div`
    width:100%;
    height:80%;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:2rem;
`


const LoginBound = styled.div`
    width:80%;
    height:50px;
    border-radius:10px;
    display:flex;
    align-items:center;
    position:relative;
`

const LoginInp = styled.input`
    width:100%;
    height:100%;
    border-radius:10px;
    outline:none;
    padding-left:15px;
    padding-right:40px;

`


const LoginButton = styled.button`
    width:30%;
    height:20%;
    border-radius:7px;
    color:pink;
    background:purple;
    box-shadow:0 0  10px 2px pink;
    text-transform: uppercase;
    font-weight:bold;
    font-size:1.2vw;
    padding:10px;
`

export {
    LoginForm,
    LoginBody,
    LoginTitle,
    LoginBound,
    LoginInp,
    LoginButton
}

