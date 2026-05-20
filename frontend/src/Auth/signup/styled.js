import styled from "styled-components";

const RegisterForm = styled.div`
    width:40vw;
    min-height:70vh;
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

const RegisterTitle = styled.div`
    font-size:2rem;
    font-weight: bold;
    text-align:center;
    color:purple
`

const RegisterBody = styled.div`
    width:100%;
    height:80%;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:2rem;
`

const RegisterBound = styled.div`
    width:80%;
    height:50px;
    border-radius:10px;
    display:flex;
    align-items:center;
    position:relative;
`

const RegisterInp = styled.input`
    width:100%;
    height:100%;
    border-radius:10px;
    outline:none;
    padding-left:15px;
`

const RegisterButton = styled.button`
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

const LoginBack = styled.div`
    display:flex;
    gap:0.5rem;
    align-items:center;
    position:absolute;
    left:1em;
    padding:0.5rem;
    background:pink;
    border-radius:5px;
    color:purple;
    border:1px solid purple;
`

export {
    RegisterForm,
    RegisterBody,
    RegisterTitle,
    RegisterBound,
    RegisterInp,
    RegisterButton,
    LoginBack
}
