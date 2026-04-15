import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey,faEye,faUser } from "@fortawesome/free-solid-svg-icons";
import {
    LoginForm,
    LoginBody,
    LoginTitle,
    LoginBound,
    LoginInp,
    LoginButton
} from './styled.js'
import { useState } from "react";
import AuthBackground from "../../../Components/AuthBackground/AuthBackground.jsx";

const Login = () => {
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [passwordToggle,setPasswordToggle] = useState(false);

  
  return (
    <div className ="w-full h-screen">
    <AuthBackground></AuthBackground>
    <LoginForm>
      <LoginBody>
        <LoginTitle>Đăng nhập</LoginTitle>
        <LoginBound>
           <LoginInp id = "username" type = "text" required className = "peer" onChange={(e)=>{setUsername(e.target.value)}}></LoginInp>
            <label htmlFor = "username"  id = "label-username" className ={`absolute left-2 peer-focus:scale-[0.8] peer-focus:-translate-y-7  duration-300 ${username !== "" ? "scale-[0.8] -translate-y-7" : ""} `}><FontAwesomeIcon icon={faUser} />Tài khoản</label>
        </LoginBound>

        <LoginBound>
          <LoginInp  id = "password" type ={`${passwordToggle ? "text" : "password"}`} required className = "peer" onChange ={(e)=>{setPassword(e.target.value)}}></LoginInp>
          <label  htmlFor="password" id = "lable-password" className = {`absolute left-2 peer-focus:scale-[0.8] peer-focus:-translate-y-7 duration-300 ${password !== "" ? "scale-[0.8] -translate-y-7" : ""}`}><FontAwesomeIcon icon={faKey} />Mật khẩu</label>
          <FontAwesomeIcon className = "absolute right-2" icon={faEye} onClick = {()=>{setPasswordToggle(!passwordToggle)}}/>

        </LoginBound>

        <div className="w-full flex justify-around text-sm text-purple-600 mb-3">
          <a href="#" className="hover:text-purple-800 transition-colors">Tạo tài khoản</a>
          <a href="#" className="hover:text-purple-800 transition-colors">Bạn quên mật khẩu?</a>
        </div>
      </LoginBody>

      <LoginButton>Đăng nhập</LoginButton>
    </LoginForm>
    </div>
  )
}

export default Login
