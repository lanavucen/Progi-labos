Inicijalizacija:

1. Preuzeti node.js ako nemate:

https://nodejs.org/en/download


2. Postavljanje Docker Desktop

Provjeriti imate li wsl instaliran (u terminalu upisite: wsl)
Ako nemate napisite u terminal: wsl --install

Zatim je potrebno instalirati Docker Desktop:

https://docs.docker.com/desktop/setup/install/windows-install/

Bitno je da je opcija "Use WSL 2" oznacena. Bit ce potrebno restartati racunalo


3. Instalacija paketa i postavljanje:

U terminalu otvorite folder my-react-app (cd ...\my-react-app) i upisite ove naredbe:

npm install

docker-compose up -d

docker exec -it progi-db psql -U postgres progi

CREATE TABLE users(
    name text not null,
    email text not null primary key,
    password text not null
);
INSERT INTO users(name, email, password) VALUES('testuser', 'testuser@gmail.com', 'testuser');

\q



4. Pokretanje:

Otvorite 2 terminala i s oba se locirajte u my-react-app:
U jednom napisite:
node server.js

U drugom:
npm run dev

Zatim otvorite link iz drugog terminala



5. Zatvaranje aplikacije

U terminalu s naredbom npm run dev stisni q i enter
U terminalu node server.js stisni Ctrl + C.
U prvom terminalu s naredbom docker-compose up -d zaustavi Docker kontejner naredbom:

docker-compose down




# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
