import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "progi",
  password: "bazepodataka",
  port: 5433
});

app.post("/api/registracija", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await pool.query("INSERT INTO users (name, email, password) VALUES($1, $2, $3) RETURNING *", [
      name,
      email,
      password
    ]);
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);

    if (err.code === "23505") {
      return res.status(409).send("Email adresa već se koristi.");
    }

    res.status(500).send("Došlo je do greške na serveru.");
  }
});

app.post("/api/prijava", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(401).json("Korisnik ne postoji");
    }

    if (user.rows[0].password !== password) {
      return res.status(401).json("Pogrešna lozinka");
    }

    res.json({ message: "Prijava uspješna", user: user.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Greška na serveru");
  }
});

app.delete("/api/users/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const deleteUser = await pool.query("DELETE FROM users WHERE email = $1", [email]);

    // Provjeravamo je li ijedan redak obrisan
    if (deleteUser.rowCount === 0) {
      return res.status(404).json("Korisnik nije pronađen.");
    }

    res.json("Korisnik je uspješno obrisan.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Greška na serveru");
  }
});

app.listen(port, () => {
  console.log(`Server sluša na portu ${port}`);
});