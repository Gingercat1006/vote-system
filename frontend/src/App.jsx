import { useState, useEffect } from "react"; // useEffectを追加
import './App.css';

export default function App() {
  // boothsをstateで管理するように変更
  const [booths, setBooths] = useState([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [isVoted, setIsVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を追加

  // ★ ページ読み込み時に、バックエンドから出し物一覧を取得する
  useEffect(() => {
    const fetchBooths = async () => {
      try {
        // RenderサーバーのURLに/boothsを追加
        const res = await fetch("https://vote-system-t4tn.onrender.com/booths");
        const data = await res.json();
        setBooths(data); // 取得した一覧をstateに保存
      } catch (err) {
        setMessage("出し物一覧の取得に失敗しました。");
      } finally {
        setIsLoading(false); // ローディング完了
      }
    };

    fetchBooths();
  }, []); // 空の配列を渡すことで、初回読み込み時に1回だけ実行される

  // submitVote関数は変更なし
  const submitVote = async () => {
    // ... (この中のコードは以前と同じ)
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
  
  // isVoted時の表示も変更なし
  if (isVoted) {
    // ... (この中のコードは以前と同じ)
  }

  // ★ ローディング中の表示を追加
  if (isLoading) {
    return <div className="container"><h2>読み込み中...</h2></div>;
  }

  return (
    <div className="container">
      <h2>一番良かった出し物は？</h2>

      <div className="options">
        {/* ここが動的に変わる！ */}
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