import AuthForm from "./Components/AuthForm";
import "regenerator-runtime/runtime";
import Menu1 from "./Components/Menu1";
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

export default function Root(props) {
  return(
    <>
    {/* <AuthForm/>
    <Menu1/> */}
    <Router>
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Navigate to="/Register"/>}/>
        <Route path="/Register" element={<AuthForm />} />
        <Route path="/Dashboard" element={<Menu1 />} />
      </Routes>
    </Router>
    </>
  )
}
