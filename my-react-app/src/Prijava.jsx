import "./css/Prijava.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || '';

function Prijava() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const body = { email, password };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/prijava`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || "Prijava nije uspjela.");
        return;
      }

      const data = await response.json();

      if (data.token && data.user) {
        alert("Prijava uspješna!");

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        navigate("/Profil");
      } else {
        setError("Odgovor servera nije ispravan.");
      }
    } catch (err) {
      console.error(err.message);
      setError("Nije moguće spojiti se na server.");
    }
  };

  return (
    <div className="containerprijava">
      <h1 className="headerprijava">APLIKACIJA</h1>
      <p>Nemaš račun? </p>
      <p>Registriraj se besplatno</p>
      <button className="signinbutton" onClick={() => navigate("/Registracija")}>
        Sign up
      </button>
      <p>Imaš račun? Prijavi se</p>

      <input
        className="podatci"
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="podatci"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="error-message">{error}</p>}

      <button className="submitbutton" onClick={handleSubmit}>
        Submit
      </button>

      <button className="googlebutton" onClick={() => {window.location.href = "http://localhost:3001/api/auth/google";}}>
        Prijavi se s Googleom
      </button>

      
    </div>
  );
}

export default Prijava;