import express from "express";
import cors from "cors";
import pg from "pg";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import session from "express-session";
import "dotenv/config";
import { verifyToken } from './authMiddleware.js';
import multer from 'multer';

const { Pool } = pg;
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

/*const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "progi",
  password: "bazepodataka",
  port: 5433
});*/

const upload = multer({ storage: multer.memoryStorage() });

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const pool = new Pool({
  connectionString: IS_PRODUCTION ? process.env.DATABASE_URL : `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
  
  ssl: IS_PRODUCTION ? { rejectUnauthorized: false } : false
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/api/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails } = profile;
    const email = emails[0].value;

    try {
      let userResult = await pool.query("SELECT * FROM users WHERE google_id = $1", [id]);

      if (userResult.rows.length > 0) {
        return done(null, userResult.rows[0]);
      }

      userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

      if (userResult.rows.length > 0) {
        const updatedUser = await pool.query(
          "UPDATE users SET google_id = $1 WHERE email = $2 RETURNING *",
          [id, email]
        );
        return done(null, updatedUser.rows[0]);
      }

      const newUser = await pool.query(
        "INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING *",
        [displayName, email, id]
      );
      return done(null, newUser.rows[0]);

    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length > 0) {
      done(null, userResult.rows[0]);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err, null);
  }
});

app.get('/api/auth/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email']
  })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${FRONTEND_URL}/Prijava`,
    session: false
  }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign({ email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
  }
);


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
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json("Korisnik ne postoji");
    }

    const user = userResult.rows[0];

    if (user.password !== password) {
      return res.status(401).json("Pogrešna lozinka");
    }

    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      message: "Prijava uspješna", 
      token: token, 
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      } 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Greška na serveru");
  }
});

app.delete("/api/users/:email", verifyToken, async (req, res) => {
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

app.get("/api/admin/dashboard", verifyToken, async (req, res) => {
  try {
    const userRole = req.user.role; 

    if (userRole < 1) {
      return res.status(403).send("Pristup odbijen. Potrebna su administratorska prava.");
    }

    const result = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = result.rows[0].count;

    res.json({ message: `Dobrodošao na admin dashboard, ${req.user.name}!`, totalUsers: totalUsers });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Greška na serveru");
  }
});

app.get("/api/stats", verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;

    const statsQuery = `
      SELECT
        -- Ukupna statistika (postojeća)
        COUNT(*) AS total_words,
        COUNT(CASE WHEN razina > 0 THEN 1 END) AS learned_words,
        COUNT(CASE WHEN razina >= 5 THEN 1 END) AS mastered_words,
        SUM(tocni) AS total_correct,
        SUM(netocni) AS total_incorrect,

        -- Dnevna statistika (broji samo odgovore od danas)
        SUM(tocni) FILTER (WHERE zadnji_pokusaj >= date_trunc('day', NOW())) AS daily_correct,
        SUM(netocni) FILTER (WHERE zadnji_pokusaj >= date_trunc('day', NOW())) AS daily_incorrect,

        -- Tjedna statistika (broji samo odgovore u zadnjih 7 dana)
        SUM(tocni) FILTER (WHERE zadnji_pokusaj >= NOW() - INTERVAL '7 days') AS weekly_correct,
        SUM(netocni) FILTER (WHERE zadnji_pokusaj >= NOW() - INTERVAL '7 days') AS weekly_incorrect

      FROM learning_progress
      WHERE user_email = $1;
    `;

    const result = await pool.query(statsQuery, [userEmail]);

    const stats = {
      total_words: parseInt(result.rows[0].total_words) || 0,
      learned_words: parseInt(result.rows[0].learned_words) || 0,
      mastered_words: parseInt(result.rows[0].mastered_words) || 0,
      total_correct: parseInt(result.rows[0].total_correct) || 0,
      total_incorrect: parseInt(result.rows[0].total_incorrect) || 0,
      daily_correct: parseInt(result.rows[0].daily_correct) || 0,
      daily_incorrect: parseInt(result.rows[0].daily_incorrect) || 0,
      weekly_correct: parseInt(result.rows[0].weekly_correct) || 0,
      weekly_incorrect: parseInt(result.rows[0].weekly_incorrect) || 0,
    };

    res.json(stats);

  } catch (err) {
    console.error("Greška pri dohvaćanju statistike:", err.message);
    res.status(500).send("Greška na serveru pri dohvaćanju statistike.");
  }
});


app.put("/api/users/:targetEmail/role", verifyToken, async (req, res) => {
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

app.get('/api/admin/users', verifyToken, async (req, res) => {
  try {
    const { adminEmail } = req.query;

    if (!adminEmail) {
      return res.status(400).send("Nedostaje email administratora.");
    }

    const adminResult = await pool.query("SELECT role FROM users WHERE email = $1", [adminEmail]);
    if (adminResult.rows.length === 0 || adminResult.rows[0].role !== 2) {
      return res.status(403).send("Samo Glavni Administrator može vidjeti listu korisnika.");
    }

    const allUsers = await pool.query("SELECT name, email, role FROM users ORDER BY name");
    
    res.json(allUsers.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Greška na serveru");
  }
});

app.get("/api/languages", verifyToken, async (req, res) => {
  try {
    const allLanguages = await pool.query("SELECT * FROM languages ORDER BY language_name");
    res.json(allLanguages.rows);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.post("/api/languages", verifyToken, async (req, res) => {
  try {
    const { language_name } = req.body;
    const newLanguage = await pool.query(
      "INSERT INTO languages (language_name) VALUES ($1) RETURNING *",
      [language_name]
    );
    res.status(201).json(newLanguage.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.delete("/api/languages/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM languages WHERE language_id = $1", [id]);
    res.json("Jezik uspješno obrisan.");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.get("/api/words/:id/pronunciation", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT pronounciation FROM words WHERE word_id = $1", [id]);
    
    if (result.rows.length > 0 && result.rows[0].pronounciation) {
      res.set('Content-Type', 'audio/mpeg');
      res.send(result.rows[0].pronounciation);
    } else {
      res.status(404).send("Audio zapis nije pronađen za ovu riječ.");
    }
  } catch (err) 
  {
    console.error("Greška pri dohvaćanju izgovora:", err.message);
    res.status(500).json({ error: "Greška na serveru pri dohvaćanju zvuka." });
  }
});

app.get("/api/words", verifyToken, async (req, res) => {
  try {
    const { language_id, mod, word_id } = req.query;
    let words;
    if(!word_id){
      if(mod == "mod1"){
        words = await pool.query("SELECT word_id, word_text FROM words WHERE language_id = $1 ORDER BY word_text", [language_id]);
      } else if (mod == "mod2"){
        words = await pool.query("SELECT word_id, translation_to_croatian FROM words WHERE language_id = $1 ORDER BY word_text", [language_id]);
      } else {
        words = await pool.query("SELECT * FROM words WHERE language_id = $1 ORDER BY word_text", [language_id]);
      }
      res.json(words.rows);
    } else{
      if (mod == "mod1") {
        const targetWordRes = await pool.query("SELECT translation_to_croatian FROM words WHERE language_id = $1 AND word_id = $2", [language_id, word_id]);
        const targetWord = targetWordRes.rows[0];
        const potentialDistractorsRes = await pool.query("SELECT translation_to_croatian FROM words WHERE language_id = $1 AND word_id != $2", [language_id, word_id]);
        const distractors = potentialDistractorsRes.rows.sort(() => Math.random() - 0.5).slice(0, 3);
        const choicesRandom = [...distractors.map(d => d.translation_to_croatian), targetWord.translation_to_croatian].sort(() => Math.random() - 0.5);
        res.json(choicesRandom );
      }else {
        const targetWordRes = await pool.query("SELECT word_text FROM words WHERE language_id = $1 AND word_id = $2", [language_id, word_id]);
        const targetWord = targetWordRes.rows[0];
        const potentialDistractorsRes = await pool.query("SELECT word_text FROM words WHERE language_id = $1 AND word_id != $2", [language_id, word_id]);
        const distractors = potentialDistractorsRes.rows.sort(() => Math.random() - 0.5).slice(0, 3);
        const choicesRandom = [...distractors.map(d => d.word_text), targetWord.word_text].sort(() => Math.random() - 0.5);
        res.json(choicesRandom);
      }
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});


app.get("/api/words/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { language_id, mod} = req.query;
    const word = await pool.query("SELECT * FROM words WHERE language_id = $1 AND word_id = $2", [language_id, id]);
    let ans;
    if(mod == "mod1"){
      ans = word.rows[0].translation_to_croatian;
    } else{
      ans = word.rows[0].word_text;
    }
    res.json(ans);
    
  } catch (err) {
    res.status(500).json(err.message);
  }
});


app.post("/api/words", verifyToken, async (req, res) => {
  try {
    let { word_text, language_id, translation_to_croatian, phrases } = req.body;

    const langResult = await pool.query("SELECT language_name FROM languages WHERE language_id = $1", [language_id]);
    const languageName = langResult.rows.length > 0 ? langResult.rows[0].language_name : '';

    if (languageName.toLowerCase() === 'engleski') {
      console.log(`[FreeDictionaryAPI] Jezik je Engleski, pokušavam dohvatiti fraze za riječ: ${word_text}`);
      const dictionaryResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word_text}`);

      if (!dictionaryResponse.ok) {
        if (dictionaryResponse.status === 404) {
          return res.status(404).send(`Riječ '${word_text}' ne postoji u engleskom rječniku.`);
        }
        throw new Error('Free Dictionary API nije uspio.');
      }

      const data = await dictionaryResponse.json();
      let foundExamples = [];
      if (data && data[0]?.meanings) {
        for (const meaning of data[0].meanings) {
          for (const definition of meaning.definitions) {
            if (definition.example) {
              foundExamples.push(definition.example);
            }
          }
        }
      }

      if (foundExamples.length > 0) {
        phrases = foundExamples.slice(0, 3);
        console.log(`[FreeDictionaryAPI] Uspješno dohvaćeno ${phrases.length} fraza.`);
      } else {
        phrases = [];
      }
    }
    
    const newWordResult = await pool.query(
      "INSERT INTO words (word_text, language_id, translation_to_croatian, phrases) VALUES ($1, $2, $3, $4) ON CONFLICT (word_text, language_id) DO NOTHING RETURNING *",
      [word_text, language_id, translation_to_croatian, phrases]
    );

    if (newWordResult.rows.length === 0) {
        return res.status(200).json({ message: "Riječ već postoji, preskačem TTS." });
    }
    
    const newWord = newWordResult.rows[0];

    const ttsUrl = `https://voicerss-text-to-speech.p.rapidapi.com/?key=${process.env.VOICERSS_API_KEY}&hl=en-us&c=MP3&f=44khz_16bit_stereo&src=${encodeURIComponent(word_text)}`;
    const ttsOptions = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.TTS_RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'voicerss-text-to-speech.p.rapidapi.com'
      }
    };
    
    const ttsResponse = await fetch(ttsUrl, ttsOptions);
    
    if (ttsResponse.ok) {
      const audioArrayBuffer = await ttsResponse.arrayBuffer();
      const audioHexString = Buffer.from(audioArrayBuffer).toString('hex');
      await pool.query(
        "UPDATE words SET pronounciation = decode($1, 'hex') WHERE word_id = $2",
        [audioHexString, newWord.word_id]
      );
      console.log(`Audio (preko decode('hex')) spremljen u bazu za riječ: ${word_text}`);
    } else {
      console.error(`TTS API greška za riječ '${word_text}'.`);
    }

    res.status(201).json(newWord);

  } catch (err) {
    console.error("Greška u /api/words endpointu:", err.message, err.stack);
    res.status(500).json({ error: "Interna greška servera." });
  }
});

app.delete("/api/words/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM words WHERE word_id = $1", [id]);
    res.json("Riječ uspješno obrisana.");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.put("/api/words/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { word_text, translation_to_croatian, phrases } = req.body;
    const updatedWord = await pool.query(
      "UPDATE words SET word_text = $1, translation_to_croatian = $2, phrases = $3 WHERE word_id = $4 RETURNING *",
      [word_text, translation_to_croatian, phrases, id]
    );
    res.json(updatedWord.rows[0]);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

app.put('/api/users/:email/name', verifyToken, async (req, res) => {
  try {
    const targetEmail = req.params.email;
    const requesterEmail = req.user.email;

    if (requesterEmail !== targetEmail && req.user.role !== 2) {
      return res.status(403).send("Zabranjeno: Nemate dopuštenje za izmjenu ovog korisnika.");
    }

    const { newName } = req.body;
    if (!newName || newName.length < 2 || newName.length > 50) {
      return res.status(400).send("Ime mora imati između 2 i 50 znakova.");
    }

    const updateUser = await pool.query(
      "UPDATE users SET name = $1 WHERE email = $2 RETURNING name, email, role",
      [newName, targetEmail]
    );

    if (updateUser.rowCount === 0) {
      return res.status(404).json("Korisnik nije pronađen.");
    }

    res.json(updateUser.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Greška na serveru");
  }
});

app.put('/api/users/:email/password', verifyToken, async (req, res) => {
  try {
    const targetEmail = req.params.email;
    const requesterEmail = req.user.email;

    if (requesterEmail !== targetEmail) {
      return res.status(403).send("Zabranjeno: Možete promijeniti samo vlastitu lozinku.");
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4 || newPassword.length > 100) {
      return res.status(400).send("Lozinka mora imati između 4 i 100 znakova.");
    }

    const updateUser = await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [newPassword, targetEmail]
    );

    if (updateUser.rowCount === 0) {
      return res.status(404).json("Korisnik nije pronađen.");
    }

    res.json("Lozinka je uspješno promijenjena.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Greška na serveru");
  }
});


app.post("/api/pronunciation/check", verifyToken, upload.single('audio'), async (req, res) => {
  const { word_text } = req.body;
  const audioFile = req.file;

  if (!word_text || !audioFile) {
    return res.status(400).send("Nedostaje tekst riječi ili audio zapis.");
  }
  
  try {
    const audioBase64 = audioFile.buffer.toString('base64');
    const requestBody = {
      audio_base64: audioBase64,
      expected_text: word_text,
      audio_format: "webm" 
    };
    const rapidApiOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'scripted-speech-assessment1.p.rapidapi.com',
        'x-rapidapi-key': process.env.PRONUNCIATION_API_KEY
      },
      body: JSON.stringify(requestBody)
    };

    const rapidApiResponse = await fetch('https://scripted-speech-assessment1.p.rapidapi.com/speech-assessment/scripted/us', rapidApiOptions);
    
    if (!rapidApiResponse.ok) {
      const errorBody = await rapidApiResponse.text();
      console.error("RapidAPI greška (Pronunciation):", { status: rapidApiResponse.status, body: errorBody });
      throw new Error("RapidAPI nije dostupan.");
    }

    const scoreData = await rapidApiResponse.json();
    
    if (scoreData && scoreData.pronunciation && scoreData.pronunciation.overall_score !== undefined) {
      res.json({ score: scoreData.pronunciation.overall_score / 10 });
    } else {
      console.error("API nije vratio očekivanu strukturu. Primljen objekt:", scoreData);
      throw new Error("API nije vratio očekivanu 'pronunciation.overall_score' ocjenu.");
    }

  } catch (err) {
    console.error("Greška pri spajanju na API za provjeru izgovora:", err.message);
    res.status(503).json({ error: "Nemogućnost spajanja sa servisom RapidAPI, igra se nastavlja bez ocjene izgovora." });
  }
});


app.get("/api/usersettings", verifyToken, async (req, res) => {

  const email = req.user.email;

  const r = await pool.query(
    "SELECT selected_language_id, selected_mod FROM user_settings WHERE user_email = $1",
    [email]
  );

  res.json(r.rows[0] || null);
});


app.post("/api/usersettings", verifyToken, async (req, res) => {

  const email = req.user.email;
  const { selected_language_id, selected_mod } = req.body;

  await pool.query(`
    INSERT INTO user_settings (user_email, selected_language_id, selected_mod)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_email)
    DO UPDATE SET
      selected_language_id = EXCLUDED.selected_language_id,
      selected_mod = EXCLUDED.selected_mod
  `, [email, selected_language_id, selected_mod]);

  res.sendStatus(200);

});


app.post("/api/progress/init", verifyToken, async (req, res) => {
  const email = req.user.email;
  const { language_id } = req.body;

  if (!language_id) return res.status(400).json({ error: "language_id is required" });

  try {
    const q = `
      INSERT INTO learning_progress (user_email, language_id, word_id, razina, sljedeci_datum, zadnji_pokusaj, tocni, netocni)
      SELECT $1, $2, w.word_id, 0, NOW(), NULL, 0, 0
      FROM words w
      WHERE w.language_id = $2
      ON CONFLICT (user_email, language_id, word_id)
      DO NOTHING
    `;
    const r = await pool.query(q, [email, Number(language_id)]);

    res.json({ inserted: r.rowCount });
  } catch (err) {
    console.error("progress/init error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/api/progress/due", verifyToken, async (req, res) => {
  const email = req.user.email;
  const language_id = Number(req.query.language_id);
  const limit = Number(req.query.limit || 100);

  if (!language_id) return res.status(400).json({ error: "language_id is required" });

  try {
    const q = `
      SELECT
        lp.word_id,
        lp.razina,
        lp.sljedeci_datum,
        lp.tocni,
        lp.netocni,
        w.*
      FROM learning_progress lp
      JOIN words w
        ON w.word_id = lp.word_id AND w.language_id = lp.language_id
      WHERE lp.user_email = $1
        AND lp.language_id = $2
        AND lp.sljedeci_datum <= NOW()
      ORDER BY lp.sljedeci_datum ASC
      LIMIT $3
    `;
    const r = await pool.query(q, [email, language_id, limit]);
    res.json(r.rows);
  } catch (err) {
    console.error("progress/due error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



function nextDays(level) {
  const arr = [0, 1, 2, 4, 7, 14, 30];
  return arr[Math.min(level, arr.length - 1)];
}

app.post("/api/progress/answer", verifyToken, async (req, res) => {
  const email = req.user.email;
  const { language_id, word_id, correct } = req.body;

  if (!language_id || !word_id || typeof correct !== "boolean") {
    return res.status(400).json({ error: "language_id, word_id, correct(boolean) required" });
  }

  const langId = Number(language_id);
  const wordId = Number(word_id);

  const client = await pool.connect();
  try {
    await pool.query("BEGIN");

    const cur = await client.query(
      `SELECT razina
       FROM learning_progress
       WHERE user_email=$1 AND language_id=$2 AND word_id=$3
       FOR UPDATE`,
      [email, langId, wordId]
    );

    if (cur.rowCount === 0) {
      await client.query(
        `INSERT INTO learning_progress (user_email, language_id, word_id, razina, sljedeci_datum, zadnji_pokusaj, tocni, netocni)
         VALUES ($1,$2,$3,0,NOW(),NULL,0,0)
         ON CONFLICT (user_email, language_id, word_id) DO NOTHING`,
        [email, langId, wordId]
      );
    }

    const cur2 = await client.query(
      `SELECT razina
       FROM learning_progress
       WHERE user_email=$1 AND language_id=$2 AND word_id=$3
       FOR UPDATE`,
      [email, langId, wordId]
    );

    const oldLevel = cur2.rows[0].razina;

    let newLevel;
    let nextDateExpr;

    if (correct) {
      newLevel = Math.min(oldLevel + 1, 6);
      const days = nextDays(newLevel);
      nextDateExpr = `NOW() + INTERVAL '${days} days'`;
    } else {
      newLevel = 0;
      nextDateExpr = `NOW() + INTERVAL '10 minutes'`;
    }

    const upd = await client.query(
      `
      UPDATE learning_progress
      SET
        razina = $4,
        sljedeci_datum = ${nextDateExpr},
        zadnji_pokusaj = NOW(),
        tocni = tocni + CASE WHEN $5 THEN 1 ELSE 0 END,
        netocni = netocni + CASE WHEN $5 THEN 0 ELSE 1 END
      WHERE user_email=$1 AND language_id=$2 AND word_id=$3
      RETURNING user_email, language_id, word_id, razina, sljedeci_datum, tocni, netocni, zadnji_pokusaj
      `,
      [email, langId, wordId, newLevel, correct]
    );

    await client.query("COMMIT");
    res.json(upd.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("progress/answer error:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
});


app.listen(port, () => {
  console.log(`Server sluša na portu ${port}`);
});