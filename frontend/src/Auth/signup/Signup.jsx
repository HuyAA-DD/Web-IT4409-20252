import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faKey, faLock, faUser, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import {
    RegisterForm,
    RegisterBody,
    RegisterTitle,
    RegisterBound,
    RegisterInp,
    RegisterButton,
    LoginBack
} from './styled.js'
import { useState } from "react";
import AuthBackground from "../../../Components/AuthBackground/AuthBackground.jsx";

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToggle, setPasswordToggle] = useState(false);

  return (
    <div className = "w-full h-screen">
      <AuthBackground />
      <RegisterForm>
        <LoginBack> <FontAwesomeIcon className = "cursor-pointer" icon={faArrowLeft} /> Đăng nhập</LoginBack>
        <RegisterBody>
          <RegisterTitle>Đăng ký</RegisterTitle>

          <RegisterBound>
            <RegisterInp
              id="username"
              type="text"
              required
              className="peer"
              onChange={(e) => { setUsername(e.target.value) }}
            />
            <label
              htmlFor="username"
              className={`absolute left-2 peer-focus:scale-[0.8] peer-focus:-translate-y-7 duration-300 ${username !== "" ? "scale-[0.8] -translate-y-7" : ""}`}
            >
              <FontAwesomeIcon icon={faUser} /> Tên đăng nhập
            </label>
          </RegisterBound>

          <RegisterBound>
            <RegisterInp
              id="email"
              type="email"
              required
              className="peer"
              onChange={(e) => { setEmail(e.target.value) }}
            />
            <label
              htmlFor="email"
              className={`absolute left-2 peer-focus:scale-[0.8] peer-focus:-translate-y-7 duration-300 ${email !== "" ? "scale-[0.8] -translate-y-7" : ""}`}
            >
              <FontAwesomeIcon icon={faEnvelope} /> Email
            </label>
          </RegisterBound>

          <RegisterBound>
            <RegisterInp
              id="password"
              type={`${passwordToggle ? "text" : "password"}`}
              required
              className="peer"
              onChange={(e) => { setPassword(e.target.value) }}
            />
            <label
              htmlFor="password"
              className={`absolute left-2 peer-focus:scale-[0.8] peer-focus:-translate-y-7 duration-300 ${password !== "" ? "scale-[0.8] -translate-y-7" : ""}`}
            >
              <FontAwesomeIcon icon={faKey} /> Mật khẩu
            </label>
            <FontAwesomeIcon
              className="absolute right-2"
              icon={faEye}
              onClick={() => { setPasswordToggle(!passwordToggle) }}
            />
          </RegisterBound>

          <RegisterBound>
            <RegisterInp
              id="confirmPassword"
              type="password"
              required
              className="peer"
              onChange={(e) => { setConfirmPassword(e.target.value) }}
            />
            <label
              htmlFor="confirmPassword"
              className={`absolute left-2 peer-focus:scale-[0.8] peer-focus:-translate-y-7 duration-300 ${confirmPassword !== "" ? "scale-[0.8] -translate-y-7" : ""}`}
            >
              <FontAwesomeIcon icon={faLock} /> Nhập lại mật khẩu
            </label>
          </RegisterBound>

        <RegisterButton>Đăng ký</RegisterButton>
        </RegisterBody>
      </RegisterForm>
      
    </div>
  )
}

export default Signup
