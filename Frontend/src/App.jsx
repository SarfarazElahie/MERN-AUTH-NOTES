import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/test")
      .then((res) => res.json())
      .then((json) => {
        console.log("✅ Backend responded:", json);
        setData(json);
      })
      .catch((err) => {
        console.error("❌ Fetch failed:", err);
        setError(err.message);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Frontend ↔ Backend Test</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;