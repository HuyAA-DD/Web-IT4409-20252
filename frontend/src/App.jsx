
import './App.css'
import Login from './Auth/login/Login';
import Signup from './Auth/signup/Signup';
import NotFoundPage from './Components/NotFoundPage/NotFoundPage';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
function App() {
  return (
   <>
    <BrowserRouter>
      <Routes>
        <Route path = '/login' element = {<Login></Login>}></Route>
        <Route path = '/signup' element = {<Signup></Signup>}></Route>
        <Route path = '*' element = {<NotFoundPage></NotFoundPage>}></Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
