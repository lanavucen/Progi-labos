import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/PostavkeRjecnika.css"; 

function UpravljanjeUlogama() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchUsers = async (admin) => {
    try {
      const response = await fetch(`/api/admin/users?adminEmail=${admin.email}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Nije moguće dohvatiti korisnike.');
      }
      const data = await response.json();
      setAllUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (!userDataString) {
      alert("Morate biti prijavljeni za pristup ovoj stranici.");
      navigate("/Prijava");
      return;
    }

    const user = JSON.parse(userDataString);
    setCurrentUser(user);

    if (user.role !== 2) {
      alert("Samo Glavni Administrator ima pristup ovoj stranici.");
      navigate("/");
      return;
    }

    fetchUsers(user);
  }, [navigate]);

  const handleChangeRole = async (targetEmail, newRole) => {
    if (!window.confirm(`Jeste li sigurni da želite promijeniti ulogu korisniku ${targetEmail}?`)) return;

    try {
      const response = await fetch(`/api/users/${targetEmail}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole, adminEmail: currentUser.email })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Promjena uloge nije uspjela.');
      }
      
      alert('Uloga uspješno promijenjena!');
      fetchUsers(currentUser);

    } catch (err) {
      alert(err.message);
    }
  };

  if (error) {
    return <div className="containerPR"><p>{error}</p></div>;
  }
  
  if (!currentUser) {
    return <div>Učitavanje...</div>
  }

  return (
    <div className="containerPR">
      <h1 className="headerPR">Upravljanje Ulogama</h1>
      <div className="PR">
        <button className="Button" style={{float: 'right', marginBottom: '20px', marginLeft: '100px'}} onClick={() => navigate(-1)}>
          Natrag
        </button>
        <table className="user-table">
          <thead>
            <tr>
              <th>Ime</th>
              <th>Email</th>
              <th>Uloga</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((user) => (
              <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role === 2 ? 'Glavni Admin' : user.role === 1 ? 'Admin' : 'Korisnik'}</td>
                <td>
                  {currentUser.email !== user.email && (
                    <>
                      {user.role === 0 && (
                        <button className="gumb_uloga promocija" onClick={() => handleChangeRole(user.email, 1)}>
                          Postavi za Admina
                        </button>
                      )}
                      {user.role === 1 && (
                        <button className="gumb_uloga democija" onClick={() => handleChangeRole(user.email, 0)}>
                          Ukloni Admina
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UpravljanjeUlogama;