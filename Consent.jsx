import './css/Consent.css';

const Consent = ({ onAccept, onDecline }) => {
  return (
    <div className="consent-overlay">
      <div className="consent-modal">
        <h2 className="consent-title">Privola za prikupljanje podataka</h2>
        <p className="consent-text">
          Dozvoljavam sustavu da koristi moje osobne podatke.
        </p>
        <div className="consent-buttons">
          <button onClick={onDecline} className="consent-decline">
            Odbijam
          </button>
          <button onClick={onAccept} className="consent-accept">
            Prihvaćam
          </button>
        </div>
      </div>
    </div>
  );
};

export default Consent;