import { useState } from "react";
import './App.css';

// =================================================================
// ★ 出し物リスト ★
// ここに100個まで、好きなだけ出し物を直接書き込んでください
// =================================================================
const booths = [
  "お化け屋敷", "焼きそば", "ダンス", "展示", "ゲーム",
  // ここを編集するだけでOKです！
];
// =================================================================

export default function App() {
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [isVoted, setIsVoted] = useState(false);

  const submitVote = async () => {
    if (!selected) {
      return alert("出し物を選択してください");
    }

    const res = await fetch("https://vote-system-t4tn.onrender.com/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booth: selected }),
    });

    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) {
      setIsVoted(true);
    }
  };

  if (isVoted) {
    return (
      <div className="container">
        <h1>{message}</h1>
        <p>ご協力ありがとうございました！</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>一番良かった出し物は？</h2>

      <div className="options">
        {booths.map((b) => (
          <label key={b} className="option-label">
            <input
              type="radio"

              name="booth"
              value={b}
              checked={selected === b}
              onChange={(e) => setSelected(e.target.value)}
            />
            {b}
          </label>
        ))}
      </div>

      <button onClick={submitVote} className="submit-button">
        投票する
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
}