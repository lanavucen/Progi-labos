
import "./css/App.css";
import Naslov from "./components/Tekst";
import Opis from "./components/Opis";

function App() {
  return (
  <div className="container">
    <div className="header">
      <h1 className="naslov"><Naslov/></h1>
    </div>
    <p className="opis"><Opis/></p>
    <button className="profilbutton" >KLIKNI</button>
  </div>);
}

export default App;
