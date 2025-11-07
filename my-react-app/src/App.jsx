import styles from "./css/App.module.css";
import "./css/global.css";
import Naslov from "./components/Tekst";
import Opis from "./components/Opis";
import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.naslov}>
          <Naslov />
        </h1>
      </div>
      <p className={styles.opis}>
        <Opis />
      </p>
      <button className={styles.profilbutton} onClick={() => navigate("/Prijava")}>
        PRIJAVI SE
      </button>
      <button className={styles.profilbutton} onClick={() => navigate("/PostavkeIgre")}>
        IGRAJ
      </button>
      <div className={styles.uputstva}>
        <div className={styles.upute}>
          <h1>OPIS</h1>
          <p>
            Ovo je nas opisdsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
            ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
          </p>
        </div>
        <div className={styles.upute}>
          <h1>KAKO IGRATI</h1>
          <p>Ovo je nas opis</p>
        </div>
      </div>
    </div>
  );
}