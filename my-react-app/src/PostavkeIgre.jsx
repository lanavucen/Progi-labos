import "./css/PostavkeIgre.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function PostavkeIgre() {
    const navigate = useNavigate();
    const [selectedMod, setSelectedMod] = useState(localStorage.getItem("selectedMod") || "");
    const [selectedRjecnik, setSelectedRjecnik] = useState(localStorage.getItem("selectedRjecnik") || "");
    const [languages, setLanguages] = useState([]);
    const [error, setError] = useState("");

    const handleModChange = (event) => {
        setSelectedMod(event.target.value);
        localStorage.setItem("selectedMod", event.target.value);
    }

    const handleRjecnikChange = (event) => {
        setSelectedRjecnik(event.target.value);
        localStorage.setItem("selectedRjecnik", event.target.value);
    }

    const fetchLanguages = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Niste prijavljeni.");
            return;
        }

        try {
            const response = await fetch('/api/languages', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Greška pri dohvaćanju jezika");
            }
            const data = await response.json();
            setLanguages(data);
        } catch (err) {
            setError("Došlo je do pogreške pri dohvaćanju podataka.");
            console.error("Greška:", err);
        }
    };

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            alert("Morate biti prijavljeni da biste postavili igru.");
            navigate('/Prijava');
            return;
        }

        const savedMod = localStorage.getItem("selectedMod");
        const savedRjecnik = localStorage.getItem("selectedRjecnik");
        
        setSelectedMod(savedMod || "");
        setSelectedRjecnik(savedRjecnik || "");
        fetchLanguages();
    }, [navigate]);

    const handleSubmitPostavkeIgre = (e) => {
        e.preventDefault();

        if (!selectedMod || !selectedRjecnik) {
            setError("Molimo odaberite mod i rječnik!");
            return;
        }

        setError("");
        navigate("/igra", {
            state: { mod: selectedMod, rjecnik: selectedRjecnik }
        });
    };

    return (
        <div className="containerPostavkeIgre">
            <h1 className="headerPostavkeIgre">Postavke igre</h1>
            <p className="paragraphsPostavke">Odaberi mod učenja:</p>
            <select className="dropdown" value={selectedMod} onChange={handleModChange}> 
                <option value="">Odaberite mod</option>
                <option value="mod1">Engleska riječ → Hrvatski prijevod</option>
                <option value="mod2">Hrvatska riječ → Engleski prijevod</option>
                <option value="mod3">Izgovor → Pisanje riječi</option>
                <option value="mod4">Engleska riječ → Izgovor</option>
            </select>

            <p className="paragraphsPostavke">Odaberi rječnik:</p>
            <select className="dropdown" value={selectedRjecnik} onChange={handleRjecnikChange}>
                <option value="">Odaberite rječnik</option>
                {languages.map((rj) => (
                    <option key={rj.language_id} value={rj.language_id}>
                        {rj.language_name}
                    </option>
                ))}
            </select>

            {error && <p className="error">{error}</p>}

            <button className="submitbutton" onClick={handleSubmitPostavkeIgre}>
                Igraj
            </button>
        </div>
    );
}

export default PostavkeIgre;
