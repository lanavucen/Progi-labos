Inicijalizacija:

1. Preuzeti node.js ako nemate:

https://nodejs.org/en/download


2. Postavljanje Docker Desktop

Provjeriti imate li wsl instaliran (u terminalu upisite: wsl)
Ako nemate napisite u terminal: wsl --install

Zatim je potrebno instalirati Docker Desktop:

https://docs.docker.com/desktop/setup/install/windows-install/

Bitno je da je opcija "Use WSL 2" oznacena. Bit ce potrebno restartati racunalo.
Prije sljedeceg koraka otvoriti aplikajiju Docker Desktop.


3. Instalacija paketa, postavljanje i pokretanje:

U terminalu otvorite folder my-react-app (cd ...\my-react-app) i upisite ove naredbe:

npm install

docker-compose up -d

docker exec -it progi-db psql -U postgres progi

(ako ne radi ctrl + V probaj stisnut desni klik misa)

CREATE TABLE users(
    name text not null,
    email text not null primary key,
    password text,
    role smallint default 0 not null,
    google_id text unique
);
INSERT INTO users(name, email, password, role) VALUES('koradmin', 'koradmin@gmail.com', 'koradmin', 2);
INSERT INTO users(name, email, password, role) VALUES('admin', 'admin@gmail.com', 'admin', 1);
INSERT INTO users(name, email, password, role) VALUES('user', 'user@gmail.com', 'user', 0);


CREATE TABLE languages (
    language_id SERIAL PRIMARY KEY,
    language_name TEXT NOT NULL UNIQUE
);

CREATE TABLE words (
    word_id SERIAL PRIMARY KEY,
    word_text TEXT NOT NULL,
    language_id INT NOT NULL,
    translation_to_croatian TEXT,
    phrases TEXT[],
    pronounciation BYTEA,

    CONSTRAINT fk_language
      FOREIGN KEY(language_id) 
      REFERENCES languages(language_id)
      ON DELETE CASCADE,

    UNIQUE (word_text, language_id)
);

CREATE TABLE learning_progress (
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  language_id INT NOT NULL REFERENCES languages(language_id) ON DELETE CASCADE,
  word_id INT NOT NULL REFERENCES words(word_id) ON DELETE CASCADE,
  razina SMALLINT NOT NULL DEFAULT 0,
  sljedeci_datum TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  zadnji_pokusaj TIMESTAMPTZ,
  tocni INT NOT NULL DEFAULT 0,
  netocni INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_email, language_id, word_id)
);

CREATE TABLE user_settings (
  user_email TEXT PRIMARY KEY REFERENCES users(email) ON DELETE CASCADE,
  selected_language_id INT REFERENCES languages(language_id),
  selected_mod TEXT NOT NULL DEFAULT 'mod1'
);

INSERT INTO languages (language_name) VALUES ('Engleski');
INSERT INTO languages (language_name) VALUES ('Njemački');
INSERT INTO languages (language_name) VALUES ('Španjolski');

\q



npm run dev

Zatim otvorite link iz terminala


5. Zatvaranje aplikacije

Naredbom: q + enter zatvarate aplikaciju
Naredbom: docker-compose down zatvarate bazu u Docker kontejneru
Naredbom: docker-compose down -v brisete bazu u Docker kontejneru



6. OAuth

Kreirajte u my-react-app textualnu datoteku ".env" i zalijepite u nju sljedeci tekst:

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=a_random_secret_string_for_sessions
JWT_SECRET=another_random_secret_for_jwt

DB_USER=postgres
DB_PASSWORD=bazepodataka
DB_HOST=localhost
DB_PORT=5433
DB_DATABASE=progi


Ako ste kreirali bazu iz trenutne verzije ovih uputa preskočite ove korake i idite na 6.1
Potrebno je malo prepraviti bazu.
U terminalu upisite: docker exec -it progi-db psql -U postgres progi
Zatim zalijepite ove naredbe:

ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;



6.1. Idite na Google Cloud Console
(https://www.google.com/url?sa=E&q=https%3A%2F%2Fconsole.cloud.google.com%2F). 
Prijavite se sa svojim Google računom.



6.2. Na vrhu stranice, kliknite na padajući izbornik za projekte (pored "Google Cloud" loga) i odaberite "New Project". Nazovite ga npr. "React Aplikacija".

6.3. Nakon što je projekt stvoren, provjerite da je odabran.

6.4. U lijevom navigacijskom meniju (ili preko tražilice na vrhu), pronađite "APIs & Services" i kliknite na "Credentials".

6.5. Kliknite na veliki plavi gumb "+ CREATE CREDENTIALS" i odaberite "OAuth client ID".

6.6. Prvi put ćete morati konfigurirati "OAuth consent screen" (ekran za pristanak).
	- Upišite App name (npr. "Moja Aplikacija").
	- Upišite User support email (vaš email).
	- Odaberite "External" i kliknite "Create".
	- Scrollajte dolje i upišite Developer contact information (opet vaš email).
	- Kliknite "Save and Continue" kroz sve korake (Scopes, Test Users). Ne trebate ništa dodavati za sada. Na kraju kliknite "Back to Dashboard".

6.7. Vratite se na "Credentials" tab, ponovno kliknite "+ CREATE CREDENTIALS" -> "OAuth client ID".

6.8. Sada popunite formu:
	- Application type: Odaberite "Web application".
	- Name: Može ostati "Web client 1".
	- Authorized redirect URIs (kopiraj točno ovo): 

http://localhost:3001/api/auth/google/callback

	- Authorized JavaScript origins (kopiraj točno ovo): 

http://localhost:5173


6.9. Kliknite "Create". Pojavit će se prozorčić s vašim ključevima! Kopirajte vrijednosti za "Your Client ID" i "Your Client Secret". To su vrijednosti koje trebate zalijepiti u svoju .env datoteku.


7.0. Stavite u .env datoteku ove ključeve, u slučaju da ne rade, probajte sami doći do tih ključeva na ovim linkovima:
voicerss_api: https://rapidapi.com/voicerss/api/text-to-speech-1
pronunciation_api_key: https://rapidapi.com/language-confidence-language-confidence-default/api/scripted-speech-assessment1


TTS_RAPIDAPI_KEY=6448e15eefmsh981de6c7f7dbf44p1bc01bjsn36347a821c0f
VOICERSS_API_KEY=59359c880552423aa85703867d74a14f
PRONUNCIATION_API_KEY=6448e15eefmsh981de6c7f7dbf44p1bc01bjsn36347a821c0f




Stranica na internetu:

https://progi-frontend-jgmz.onrender.com/

profili za testiranje:
Korijenski administrator:

email: koradmin@gmail.com 
password: koradmin


Administrator:

email: admin@gmail.com
password: admin


Korisnik:

email: user@gmail.com
password: user






# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
