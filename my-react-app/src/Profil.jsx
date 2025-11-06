import "./css/Profil.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      alert("Morate biti prijavljeni da biste vidjeli ovu stranicu.");
      navigate("/Prijava");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    alert("Uspješno ste odjavljeni.");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Jeste li sigurni da želite trajno obrisati svoj račun?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.email}`, {
        method: "DELETE"
      });

      if (response.ok) {
        alert("Vaš račun je uspješno obrisan.");
        handleLogout();
      } else {
        const errorData = await response.json();
        alert(`Brisanje nije uspjelo: ${errorData}`);
      }
    } catch (err) {
      console.error(err.message);
      alert("Došlo je do greške pri komunikaciji sa serverom.");
    }
  };

  if (!user) {
    return <div>Učitavanje...</div>;
  }

  const isUser = user && user.role === 0;
  const isAdmin = user && user.role === 1;
  const isMainAdmin = user && user.role === 2;

  return (
    <div className="containerprofil">
      <div className="headerprofila">
        <h1>
          Bok, {user.name} 
          <span className="role-display"> ({isMainAdmin ? "Glavni Admin" : isAdmin ? "Admin" : "Korisnik"})</span>
        </h1>
        <div className="gumbi">
          <button className="buttonpocetna" onClick={() => navigate("/")}>
            Pocetna
          </button>
          <button className="buttonigraj" onClick={() => navigate("/Igra")}>
            Igraj
          </button>
        </div>
      </div>
      <div className="dno">
        <div className="lista">
          <p className="kategorija">Podatci</p>
          <p className="kategorija">Statistika</p>
          <p
            className="kategorija"
            onClick={() => setIsChangePasswordVisible(!isChangePasswordVisible)}
            style={{ cursor: "pointer" }}>
            Promjena lozinke
          </p>
          <p className="kategorija" onClick={handleDeleteAccount} style={{ cursor: "pointer", color: "red" }}>
            Brisanje profila
          </p>
          <p className="kategorija" onClick={handleLogout} style={{ cursor: "pointer" }}>
            Odjavi se
          </p>

          {(isAdmin || isMainAdmin) && (
            <p
              className="kategorija admin-link"
              // *** OVDJE JE PROMJENA ***
              onClick={() => navigate('/PostavkeRjecnika')}
              style={{cursor: 'pointer'}}
            >
              Upravljaj Rječnikom
            </p>
          )}

          {isMainAdmin && (
            <p
              className="kategorija main-admin-link"
              // *** OVDJE JE PROMJENA ***
              onClick={() => navigate('/UpravljanjeUlogama')}
              style={{ cursor: "pointer" }}
            >
              Upravljaj Ulogama
            </p>
          )}
        </div>
        <div className="odlomak">
          <p>Ovdje možete vidjeti svoje podatke.</p>
          <p>Email: {user.email}</p>
        </div>
      </div>
    </div>
  );
}

export default Profil;