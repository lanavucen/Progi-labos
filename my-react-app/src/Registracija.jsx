import "./css/Registracija.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Registracija() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const body = { name, email, password };
      const response = await fetch("http://localhost:3001/api/registracija", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert("Registracija uspješna!");
        navigate("/Prijava");
      } else {
        const errorData = await response.text();
        alert(`Registracija nije uspjela: ${errorData}`);
      }
    } catch (err) {
      console.error(err.message);
      alert("Došlo je do greške.");
    }
  };

  return (
    <div className="containerprijava">
      <h1 className="headerprijava">APLIKACIJA</h1>

      <input
        className="podatci"
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
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

      <button className="submitbutton" onClick={handleSubmit}>
        Submit
      </button>

      <p>Ipak imaš račun? </p>
      <button className="prijavisebutton" onClick={() => navigate("/Prijava")}>
        Sign in
      </button>
    </div>
  );
}

export default Registracija;