import { useState } from "react";
import './App.css';

// =================================================================
// ★ 出し物リスト ★
// 01から55までの番号を自動で生成
// =================================================================
const booths = Array.from({ length: 55 }, (_, i) => String(i + 1).padStart(2, '0'));
// =================================================================

export default function App() {
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [isVoted, setIsVoted] = useState(false);

  const submitVote = async () => {
    if (!selected) {
      return alert("出し物を選択してください");
    }

    const res = await fetch("https://vote-api-final.onrender.com/vote", {
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

      {/* ここからが変更点！ options-grid というクラス名に変更 */}
      <div className="options-grid">
        {booths.map((b) => (
          // ★ ラベルの構造を変更し、選択されたら 'selected' クラスが付くように
          <label key={b} className={`option-button ${selected === b ? 'selected' : ''}`}>
            {/* ラジオボタン自体は裏方に隠す */}
            <input
              type="radio"
              name="booth"
              value={b}
              checked={selected === b}
              onChange={(e) => setSelected(e.target.value)}
            />
            {/* ユーザーにはこの数字が見える */}
            <span>{b}</span>
          </label>
        ))}
      </div>
      {/* 変更点ここまで */}

      <button onClick={submitVote} className="submit-button" disabled={!selected}>
        投票する
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
}