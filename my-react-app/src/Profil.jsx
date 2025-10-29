
import "./css/Profil.css";

import { useNavigate } from "react-router-dom";

function App() {
  const navigate=useNavigate();
  return (
  <div className="containerprofil">
    <div className="headerprofila">
      
      <h1>Bok, TI</h1>
      <div className="gumbi">
        <button className="buttonpocetna" onClick={() => navigate("/")}>Pocetna</button>
        <button className="buttonigraj" onClick={() => navigate("/Igra")}>Igraj</button>
      </div>
    </div>
    <div className="dno">
      <div className="lista">
        <p className="kategorija">Podatci</p>
        <p className="kategorija">Statistika</p>
        <p className="kategorija">Promjena lozinke</p>
        <p className="kategorija">Brisanje profila</p>
        <p className="kategorija">Odjavi se</p>
      </div>
      <div className="odlomak">
        <p>odlomakk</p>

      </div>
    </div>
  </div>);
}

export default App;
