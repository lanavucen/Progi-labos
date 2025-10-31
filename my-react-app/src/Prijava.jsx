import "./css/Prijava.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
      const response = await fetch("http://localhost:3001/api/prijava", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Prijava uspješna!");

        localStorage.setItem("user", JSON.stringify(data.user));

        navigate("/Profil");
      } else {
        setError(data);
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
    </div>
  );
}

export default Prijava;