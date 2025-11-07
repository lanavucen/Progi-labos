import "./css/PostavkeIgre.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function PostavkeIgre() {
    const navigate = useNavigate();

    const [selectedMod, setSelectedMod] = useState("mod1");
    const [selectedRjecnik, setSelectedRjecnik] = useState("1");

    const handleModChange = (event) => {
    setSelectedMod(event.target.value); 
    }

    const handleRjecnikChange = (event) => {
        setSelectedRjecnik(event.target.value); 
    }

    const handleSubmitPostavke = (e) => {
      e.preventDefault();
      navigate("/igra", {
        state: { mod: selectedMod, rjecnik: selectedRjecnik }
      });
    };

  return (

    <div className="containerPostavkeIgre">
        <h1 className="headerPostavkeIgre">Postavke igre</h1>
        <p className="paragraphsPostavke">Odaberi mod učenja:</p>
        <select className="dropdown" value={selectedMod} onChange={handleModChange}> 
            <option value="mod1">Engleska riječ → Hrvatski prijevod</option>
            <option value="mod2">Hrvatska riječ → Engleski prijevod</option>
            <option value="mod3">Izgovor → Pisanje riječi</option>
            <option value="mod4">Engleska riječ → Izgovor</option>
        </select>

      <p className="paragraphsPostavke">Odaberi rječnik:</p>
      <select className="dropdown" value={selectedRjecnik} onChange={handleRjecnikChange}> 
            <option value="1">rj1</option>
            <option value="2">rj2</option>
            <option value="3">rj3</option>
            <option value="4">rj4</option>
        </select>
        
      <button className="submitbutton" onClick={handleSubmitPostavke}>
        Igraj
      </button>
    </div>
  );
}

export default PostavkeIgre;