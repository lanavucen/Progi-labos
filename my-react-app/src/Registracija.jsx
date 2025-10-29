
import "./css/Registracija.css";

import { useNavigate } from "react-router-dom";

function Registracija() {
  const navigate=useNavigate();
  return (
  <div className="containerprijava">
    <h1 className="headerprijava">APLIKACIJA</h1>
    <input className="podatci" type="text" placeholder="Ime"/>
    <input className="podatci" type="text" placeholder="Prezime"/>
    <input className="podatci" type="email" placeholder="email"/>
    <input className="podatci" type="password" placeholder="Password"/>
    <button className="submitbutton">Submit</button>
    <p>Ipak imaš račun? </p>
    <button className="prijavisebutton" onClick={() => navigate("/Prijava")}>Sign in</button>
  </div>);
}

export default Registracija;
