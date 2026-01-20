import "./css/PostavkeIgre.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || '';

function PostavkeIgre() {
    const navigate = useNavigate();
    const [selectedMod, setSelectedMod] = useState("");
    const [selectedRjecnik, setSelectedRjecnik] = useState("");
    const [languages, setLanguages] = useState([]);
    const [error, setError] = useState("");
    const [selectedLanguageName, setSelectedLanguageName] = useState("");

    const handleModChange = (event) => {
        setSelectedMod(event.target.value);
    }

    const handleRjecnikChange = (event) => {
        const languageId = event.target.value;
        setSelectedRjecnik(languageId);

        const language = languages.find(lang => lang.language_id.toString() === languageId);
        setSelectedLanguageName(language ? language.language_name : "");

        setSelectedMod("");
    }

    const fetchLanguages = async () => {
        const token = localStorage.getItem("token");
        //if (!token) {
        //    setError("Niste prijavljeni.");
        //    return;
        //}

        try {
            const response = await fetch(`${API_URL}/api/languages`, {
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

    const loadSettings = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_URL}/api/usersettings`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return;

        const data = await response.json();

        setSelectedMod(data?.selected_mod || "");
        setSelectedRjecnik(
            data?.selected_language_id != null ? String(data.selected_language_id) : ""
        );
    };

    useEffect(() => {
        setSelectedRjecnik("");
        setSelectedMod("");
        setSelectedLanguageName("");

        const initializePage = async () => {
            const user = localStorage.getItem("user");
            if (!user) {
                alert("Morate biti prijavljeni.");
                navigate('/Prijava');
                return;
            }

            const fetchedLanguages = await fetchLanguages();
            if (!fetchedLanguages) return;

            const savedSettings = await loadSettings();

            if (savedSettings && savedSettings.selected_language_id) {
                const langId = String(savedSettings.selected_language_id);
                const language = fetchedLanguages.find(lang => lang.language_id.toString() === langId);

                if (language) {
                    setSelectedRjecnik(langId);
                    setSelectedLanguageName(language.language_name);
                    setSelectedMod(savedSettings.selected_mod || "");
                }
            }
        };

        initializePage();
    }, [navigate]);


    const handleSubmitPostavkeIgre = async (e) => {
        e.preventDefault();

        if (!selectedMod || !selectedRjecnik) {
            setError("Molimo odaberite mod i rječnik!");
            return;
        }

        setError("");

        const token = localStorage.getItem("token");

        await fetch(`${API_URL}/api/usersettings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            selected_language_id: Number(selectedRjecnik),
            selected_mod: selectedMod,
        }),
        });
        navigate("/igra", {
            state: { mod: selectedMod, rjecnik: selectedRjecnik }
        });
    };
    
    const languageNameBase = selectedLanguageName ? selectedLanguageName.replace(/i$/, '') : "Strana";


    return (
        <div className="containerPostavkeIgre">
            <h1 className="headerPostavkeIgre">Postavke igre</h1>
            
            <p className="paragraphsPostavke">1. Odaberi rječnik:</p>
            <select className="dropdown" value={selectedRjecnik} onChange={handleRjecnikChange}>
                <option value="">Odaberite rječnik</option>
                {languages.map((rj) => (
                    <option key={rj.language_id} value={rj.language_id}>
                        {rj.language_name}
                    </option>
                ))}
            </select>

            <p className="paragraphsPostavke">2. Odaberi mod učenja:</p>
            <select 
                className="dropdown" 
                value={selectedMod} 
                onChange={handleModChange}
                disabled={!selectedRjecnik}
            > 
                <option value="">{selectedRjecnik ? "Odaberite mod" : "Prvo odaberite rječnik"}</option>
                <option value="mod1">{languageNameBase}a riječ → Hrvatski prijevod</option>
                <option value="mod2">Hrvatska riječ → {languageNameBase}i prijevod</option>
                <option value="mod3">Izgovor → Pisanje riječi</option>
                <option value="mod4">{languageNameBase}a riječ → Izgovor</option>
            </select>

            {error && <p className="error">{error}</p>}

            <div className="buttonContainer">
                <button className="submitbutton" onClick={handleSubmitPostavkeIgre}>
                    Igraj
                </button>
                <button className="submitbutton" onClick={() => navigate("/")}>
                    Natrag
                </button>
            </div>

        </div>
    );
}

export default PostavkeIgre;
