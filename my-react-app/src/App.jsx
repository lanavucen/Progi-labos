import "./css/App.css";
import Naslov from "./components/Tekst";
import Opis from "./components/Opis";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function App() {
  const navigate = useNavigate();


  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
      const userLoggedIn = localStorage.getItem('user') !== null;
      setLoggedIn(userLoggedIn);
    }, []);

  return (
    <div className="container">
      <div className="header">
        <h1 className="naslov">
          <Naslov />
        </h1>
      </div>
      <p className="opis">
        <Opis />
      </p>
      {loggedIn ? (
        <button className="profilbutton" onClick={() => navigate("/Profil")}>
          PROFIL
        </button>
      ) : (
        <button className="profilbutton" onClick={() => navigate("/Prijava")}>
          PRIJAVI SE
        </button>
      )}
      <button className="profilbutton" onClick={() => navigate("/PostavkeIgre")}>
        IGRAJ
      </button>
      <div className="uputstva">
        <div className="uputeOpis">
          <h1>OPIS</h1>
          <p>
            FlipMemo je aplikacija za učenje stranih jezika koja koristi metodu
            ponavljanja s odmakom. Riječi koje znaš pojavljuju se rjeđe, a one koje
            još učiš češće, kako bi ih dugoročno zapamtio. Aplikacija se prilagođava
            tvom znanju i pomaže ti da postupno izgradiš bogat vokabular.
          </p>
        </div>
        <div className="upute">
          <h1>KAKO IGRATI</h1>

          <ol>
            <li>Prijavi se u aplikaciju.</li>
            <li>Odaberi rječnik koji želiš učiti.</li>
            <li>
              Odaberi mod učenja:
              <ul>
                <li>engleska riječ → hrvatski prijevod</li>
                <li>hrvatska riječ → engleski prijevod</li>
                <li>izgovor → pisanje riječi</li>
                <li>tekst → izgovor riječi</li>
              </ul>
            </li>
            <li>Aplikacija će ti postavljati pitanja vezana uz riječi iz odabranog rječnika.</li>
            <li>Na svako pitanje odaberi ili upiši točan odgovor.</li>
            <li>Ako odgovoriš točno, riječ se pomiče u višu razinu i pojavljivat će se rjeđe.</li>
            <li>Ako pogriješiš, riječ se vraća na početnu razinu i ponavljat će se češće.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}