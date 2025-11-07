import "./css/PostavkeIgre.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function PostavkeIgre() {
    const navigate = useNavigate();

    const [selectedMod, setSelectedMod] = useState("mod1");
    const [selectedRjecnik, setSelectedRjecnik] = useState("1");
    const [languages, setLanguages] = useState([]);

    const handleModChange = (event) => {
    setSelectedMod(event.target.value); 
    }

    const handleRjecnikChange = (event) => {
        setSelectedRjecnik(event.target.value); 
    }

    const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/languages');
      const data = await response.json();
      setLanguages(data);
    } catch (err) { console.error("Greška pri dohvaćanju jezika:", err); }
    };

    useEffect(() => {
      fetchLanguages();
    }, []);

    const handleSubmitPostavkeIgre = (e) => {
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
      {languages.map((rj) => (
        <option key={rj.language_id} value={rj.language_id}>
          {rj.language_name}
        </option>
      ))}
      </select>

        
      <button className="submitbutton" onClick={handleSubmitPostavkeIgre}>
        Igraj
      </button>
    </div>
  );
}

export default PostavkeIgre;