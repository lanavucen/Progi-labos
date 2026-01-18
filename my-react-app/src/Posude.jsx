const interval = {
  0: 0,     //odmah
  1: 1440,  //1 dan, za probu prebacite na 10 ili 5 minuta pa da vidite kad se vrate pitanja 
  2: 2880,  //2 dana
  3: 5760,  //4 dana 
  4: 10080, //7 dana 
  5: 20160, //14 dana  
};

const API_URL = import.meta.env.VITE_API_URL || "";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function progressInit(language_id) {
  const res = await fetch(`${API_URL}/api/progress/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ language_id }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function progressDue(language_id, limit = 100) {
  const res = await fetch(
    `${API_URL}/api/progress/due?language_id=${language_id}&limit=${limit}`,
    { headers: { ...authHeaders() } }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function progressAnswer(language_id, word_id, correct) {
  const res = await fetch(`${API_URL}/api/progress/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ language_id, word_id, correct }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export {interval};