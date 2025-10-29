import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
import SignalsTable from "./Pages/SignalsTable";
import "regenerator-runtime/runtime";


export default function Root(props) {
  return(
    <>
    <Router>
      <Routes>
        <Route path="/Signals" element={<SignalsTable />} />
      </Routes>
    </Router>
    </>

  );
}
