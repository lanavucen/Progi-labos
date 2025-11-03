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

Ako u pgadminu imate pasword koji se razlikuje od "bazepodataka" promijenite u:
server.js linija 16:  "password: "bazepodataka","
docker-compose.yml linija 8: "- POSTGRES_PASSWORD=bazepodataka"

U terminalu otvorite folder my-react-app (cd ...\my-react-app) i upisite ove naredbe:

npm install

docker-compose up -d

docker exec -it progi-db psql -U postgres progi

CREATE TABLE users(
    name text not null,
    email text not null primary key,
    password text not null,
    role smallint default 0 not null
);
INSERT INTO users(name, email, password, role) VALUES('koradmin', 'koradmin@gmail.com', 'koradmin', 2);
INSERT INTO users(name, email, password, role) VALUES('admin', 'admin@gmail.com', 'admin', 1);
INSERT INTO users(name, email, password, role) VALUES('user', 'user@gmail.com', 'user', 0);
\q


npm run dev

Zatim otvorite link iz terminala


5. Zatvaranje aplikacije

Naredbom: q + enter zatvarate aplikaciju
Naredbom: docker-compose down zatvarate bazu u Docker kontejneru
Naredbom: docker-compose down -v brisete bazu u Docker kontejneru





# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
