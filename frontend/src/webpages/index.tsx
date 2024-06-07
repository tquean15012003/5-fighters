import { Routes, Route } from "react-router-dom";
import HomePage from "./chat/home";

function Webpages() {
  return (
    <div>
      <Routes>
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default Webpages;
