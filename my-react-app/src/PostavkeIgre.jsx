import "./css/PostavkeIgre.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function PostavkeIgre() {
    const navigate = useNavigate();

    const [selectedMod, setSelectedMod] = useState("");
    const [selectedRjecnik, setSelectedRjecnik] = useState("");

    const handleModChange = (event) => {
    setSelectedMod(event.target.value); 
    console.log(event.target.value)
    }

    const handleRjecnikChange = (event) => {
        setSelectedRjecnik(event.target.value); 
        console.log(event.target.value)
    }

  return (
    // imnena u dropdownu - trenutno placeholderi
    <div className="containerPostavkeIgre">
        <h1 className="headerPostavkeIgre">Postavke igre</h1>
        <p className="paragraphsPostavke">Odaberi mod učenja:</p>
        <select className="dropdown" value={selectedMod} onChange={handleModChange}> 
            <option value="mod1">mod1</option>
            <option value="mod2">mod2</option>
            <option value="mod3">mod3</option>
            <option value="mod4">mod4</option>
        </select>

      <p className="paragraphsPostavke">Odaberi rječnik:</p>
      <select className="dropdown" value={selectedRjecnik} onChange={handleRjecnikChange}> 
            <option value="rj1">rj1</option>
            <option value="rj2">rj2</option>
            <option value="rj3">rj3</option>
            <option value="rj4">rj4</option>
        </select>
        
      <button className="submitbutton" onClick={() => navigate("/Igra")}>
        Igraj
      </button>
    </div>
  );
}

export default PostavkeIgre;