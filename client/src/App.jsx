import { Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Signin from "./Signin"; // rename Login to Signin if needed
import Signup from "./Signup";

document.documentElement.setAttribute("data-theme", "light");

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
