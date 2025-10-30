
import "./css/App.css";
import Naslov from "./components/Tekst";
import Opis from "./components/Opis";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate=useNavigate();
  
  return (
  <div className="container">
    <div className="header">
      <h1 className="naslov"><Naslov/></h1>
    </div>
    <p className="opis"><Opis/></p>
    <button className="profilbutton" onClick={() => navigate("/Prijava")}>PRIJAVI SE</button>
    <button className="profilbutton" onClick={() => navigate("/Igra")}>IGRAJ</button>
    <div className="uputstva">
      <div className="upute">
        <h1>OPIS</h1>
        <p>Ovo je nas opisdsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
          ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
        </p>
      </div>
      <div className="upute">
        <h1>KAKO IGRATI</h1>
        <p>Ovo je nas opis</p>
      </div>
    </div>
  </div>);
}


