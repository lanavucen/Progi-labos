import "./css/Profil.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || '';

function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [activeView, setActiveView] = useState("podatci");

  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setNewName(parsedUser.name);
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
    const token = localStorage.getItem('token');
    if (!window.confirm("Jeste li sigurni da želite trajno obrisati svoj račun?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/users/${user.email}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        alert("Vaš račun je uspješno obrisan.");
        handleLogout();
      } else {
        const errorData = await response.text();
        alert(`Brisanje nije uspjelo: ${errorData}`);
      }
    } catch (err) {
      console.error(err.message);
      alert("Došlo je do greške pri komunikaciji sa serverom.");
    }
  };

  const handleNameChange = async () => {
    const token = localStorage.getItem("token");
    setMessage("");
    if (newName.length < 2 || newName.length > 50) {
      setMessage("Ime mora imati između 2 i 50 znakova.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/users/${user.email}/name`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newName })
      });

      if (response.ok) {
        const updatedFields = await response.json();

        const updatedUser = { ...user, ...updatedFields };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setMessage("Ime uspješno promijenjeno! Za provjeru promjene potrebna je ponovna prijava.");
        setTimeout(() => {
          setMessage("");
          setActiveView("podatci");
        }, 1500);
      } else {
        setMessage(`Greška: ${await response.text()}`);
      }
    } catch (err) {
      setMessage("Greška pri spajanju na server.");
    }
  };

  const handlePasswordChange = async () => {
    const token = localStorage.getItem("token");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("Lozinke se ne podudaraju!");
      return;
    }
    if (newPassword.length < 4) {
      setMessage("Lozinka mora imati barem 4 znaka.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/users/${user.email}/password`, {
        method: "PUT",
        headers: { 
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify({ newPassword })
      });
      if (response.ok) {
        setMessage("Lozinka uspješno promijenjena!");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setActiveView("podatci"), 1500);
      } else {
        setMessage(`Greška: ${await response.text()}`);
      }
    } catch (err) {
      setMessage("Greška pri spajanju na server.");
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
          Bok, {user.name}{" "}
          <span className="role-display">({isMainAdmin ? "Glavni Admin" : isAdmin ? "Admin" : "Korisnik"})</span>
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
          <p className="kategorija" onClick={() => setActiveView("podatci")} style={{ cursor: "pointer" }}>
            Podatci
          </p>
          <p className="kategorija">Statistika</p>
          <p
            className="kategorija"
            onClick={() => {
              setActiveView("ime");
              setMessage("");
            }}
            style={{ cursor: "pointer" }}>
            Promjena imena
          </p>
          <p
            className="kategorija"
            onClick={() => {
              setActiveView("lozinka");
              setMessage("");
            }}
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
              onClick={() => navigate("/PostavkeRjecnika")}
              style={{ cursor: "pointer" }}>
              Upravljaj Rječnikom
            </p>
          )}
          {isMainAdmin && (
            <p
              className="kategorija main-admin-link"
              onClick={() => navigate("/UpravljanjeUlogama")}
              style={{ cursor: "pointer" }}>
              Upravljaj Ulogama
            </p>
          )}
        </div>
        <div className="odlomak">
          {activeView === "podatci" && (
            <div>
              <h3>Vaši Podatci</h3>
              <p>
                <strong>Ime:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Uloga:</strong> {isMainAdmin ? "Glavni Admin" : isAdmin ? "Admin" : "Korisnik"}
              </p>
            </div>
          )}
          {activeView === "ime" && (
            <div className="profile-form">
              <h3>Promijeni Ime</h3>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <button onClick={handleNameChange}>Spremi Ime</button>
              {message && <p className="message">{message}</p>}
            </div>
          )}
          {activeView === "lozinka" && (
            <div className="profile-form">
              <h3>Promijeni Lozinku</h3>
              <input
                type="password"
                placeholder="Nova lozinka"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Potvrdi novu lozinku"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button onClick={handlePasswordChange}>Spremi Lozinku</button>
              {message && <p className="message">{message}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profil;