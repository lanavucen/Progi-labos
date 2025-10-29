
import "./css/Prijava.css";
import { useNavigate } from "react-router-dom";

function Prijava() {
  const navigate=useNavigate();
  return (
  <div className="containerprijava">
    <h1 className="headerprijava">APLIKACIJA</h1>
    <p>Nemaš račun? </p>
    <p>Registriraj se besplatno</p>
    <button className="signinbutton" onClick={() => navigate("/Registracija")}>Sign up</button>
    <p>Imaš račun? Prijavi se</p>
  
    <input className="podatci" type="email" placeholder="email"/>
    <input className="podatci" type="password" placeholder="Password"/>
    <button className="submitbutton">Submit</button>
  </div>);
}

export default Prijava;
