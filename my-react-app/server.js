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

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("Email nije u ispravnom formatu (npr. ime@domena.com)");
  }

  if (name.length < 2 || name.length > 50) {
    return res.status(400).send("Ime mora imati između 2 i 50 znakova.");
  }
  if (email.length > 255) {
    return res.status(400).send("Email adresa je predugačka.");
  }
  if (password.length < 4 || password.length > 100) {
    return res.status(400).send("Lozinka mora imati između 4 i 100 znakova.");
  }

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
    const user = await pool.query("SELECT name, email, password, role FROM users WHERE email = $1", [email]);

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

    if (deleteUser.rowCount === 0) {
      return res.status(404).json("Korisnik nije pronađen.");
    }

    res.json("Korisnik je uspješno obrisan.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Greška na serveru");
  }
});

app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const userResult = await pool.query("SELECT role FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0 || userResult.rows[0].role < 1) {
      return res.status(403).send("Pristup odbijen. Potrebna su administratorska prava.");
    }
    res.json({ message: "Dobrodošao na admin dashboard!", totalUsers: 150 });
  } catch (err) {
    res.status(500).send("Greška na serveru");
  }
});

app.put("/api/users/:targetEmail/role", async (req, res) => {
  try {
    const { targetEmail } = req.params;
    const { newRole, adminEmail } = req.body;

    const adminResult = await pool.query("SELECT role FROM users WHERE email = $1", [adminEmail]);
    if (adminResult.rows.length === 0 || adminResult.rows[0].role !== 2) {
      return res.status(403).send("Samo Glavni Administrator može mijenjati uloge.");
    }

    const updateUser = await pool.query("UPDATE users SET role = $1 WHERE email = $2", [newRole, targetEmail]);

    if (updateUser.rowCount === 0) {
      return res.status(404).json("Ciljani korisnik nije pronađen.");
    }

    res.json("Uloga korisnika je uspješno promijenjena.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Greška na serveru");
  }
});

app.listen(port, () => {
  console.log(`Server sluša na portu ${port}`);
});