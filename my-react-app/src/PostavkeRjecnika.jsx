import "./css/PostavkeRjecnika.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function PostavkeRjecnika() {

  return (
    <div className="containerPR">
      <h1 className="headerPR">Postavke riječnika</h1>
      <div className="PR">
        <p className="naslovPR">Dodavanje riječi:</p>
        <div className="info">
          <p>Upiši riječ: </p>
          <input type="text"/>
        </div>
        <div className="info">
          <p>Upiši prijevod riječi:</p>
          <input type="text"/>
        </div>
        <div className="info">
          <p>Upiši frazu s kontekstom: </p>
          <input type="text"/>
        </div>
        <button className="dodajRijecbutton">Dodaj riječ</button>

        <p className="naslovPR">Brisanje riječi:</p>
        <div className="info">
          <p>Upiši riječ: </p>
          <input type="text"/>
        </div>
        <button className="dodajRijecbutton">Izbriši riječ</button>

        <p className="naslovPR">Izmjena riječi:</p>
        <div className="info">
          <p>Odabrana riječ: </p>
          <input type="text"/>
        </div>
        <div className="info">
          <p>Upiši riječ:</p>
          <input type="text"/>
        </div>
        <div className="info">
          <p>Upiši prijevod rijči: </p>
          <input type="text"/>
        </div>
        <div className="info">
          <p>Upiši frazu s kontekstom:</p>
          <input type="text"/>
        </div>
        <button className="dodajRijecbutton">Promijeni riječ</button>
      </div>
    </div>
  );
}

export default PostavkeRjecnika;