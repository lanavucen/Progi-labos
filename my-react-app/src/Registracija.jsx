import styles from "./css/Registracija.module.css";
import "./css/global.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Registracija() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (name.length < 2 || name.length > 50) {
      newErrors.name = "Ime mora imati između 2 i 50 znakova.";
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Email nije u ispravnom formatu.";
    } else if (email.length > 255) {
      newErrors.email = "Email adresa je predugačka.";
    }

    if (password.length < 4 || password.length > 100) {
      newErrors.password = "Lozinka mora imati između 4 i 100 znakova.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const body = { name, email, password };
      const response = await fetch("/api/registracija", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert("Registracija uspješna!");
        navigate("/Prijava");
      } else {
        const errorData = await response.text();
        setErrors({ server: errorData });
      }
    } catch (err) {
      console.error(err.message);
      setErrors({ server: "Došlo je do greške pri spajanju na server." });
    }
  };

  return (
    <div className={styles.containerprijava}>
      <h1 className={styles.headerprijava}>APLIKACIJA</h1>

      <input className={styles.podatci} type="text" placeholder="Ime" value={name} onChange={(e) => setName(e.target.value)} />
      {errors.name && <p className="error-message">{errors.name}</p>}

      <input
        className={styles.podatci}
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <p className="error-message">{errors.email}</p>}

      <input
        className={styles.podatci}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && <p className="error-message">{errors.password}</p>}

      <button className={styles.submitbutton} onClick={handleSubmit}>
        Submit
      </button>

      {errors.server && <p className="error-message">{errors.server}</p>}

      <p>Ipak imaš račun? </p>
      <button className={styles.prijavisebutton} onClick={() => navigate("/Prijava")}>
        Sign in
      </button>
    </div>
  );
}

export default Registracija;