import { useState } from "react";
import './App.css';

// 出し物の選択肢
const booths = ["お化け屋敷", "焼きそば", "ダンス", "展示", "ゲーム"];

export default function App() {
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [isVoted, setIsVoted] = useState(false);

  const submitVote = async () => {
    if (!selected) {
      return alert("出し物を選択してください");
    }

    // バックエンドに選択した出し物だけを送る
    const res = await fetch("http://localhost:3001/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booth: selected }), // codeを削除
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

      {/* コード入力欄を削除 */}

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