import { useState } from "react";
import './App.css';

// =================================================================
// ★ 出し物リスト（バリデーション用） ★
// 01から55までの有効な番号リストを生成
// =================================================================
const validBooths = Array.from({ length: 55 }, (_, i) => String(i + 1).padStart(2, '0'));
// =================================================================

export default function App() {
  // ★ 変更点1: 新しいstateを追加
  const [inputValue, setInputValue] = useState(""); // テンキーで入力された値 (例: "0", "08")
  const [selected, setSelected] = useState("");     // 確定した投票番号 (例: "08")
  const [message, setMessage] = useState("");
  const [isVoted, setIsVoted] = useState(false);

  // ★ 変更点2: テンキーのボタンが押されたときの処理
  const handleNumberClick = (number) => {
    // すでに2桁入力されていたら、それ以上は入力しない
    if (inputValue.length >= 2) return;
    setInputValue(prev => prev + number);
  };

  // ★ 変更点3: クリアボタンの処理
  const handleClear = () => {
    setInputValue("");
    setSelected("");
  };

  // ★ 変更点4: OKボタンの処理
  const handleConfirm = () => {
    // 入力された番号が、有効なリストに含まれているかチェック
    if (validBooths.includes(inputValue)) {
      setSelected(inputValue); // 有効なら、それを選択済みにする
      setMessage(""); // エラーメッセージを消す
    } else {
      setSelected(""); // 無効なら、選択を解除
      setMessage(`'${inputValue}' は無効な番号です。01～55の間で入力してください。`);
    }
  };
  
  // 投票送信のロジックは変更なし
  const submitVote = async () => {
    if (!selected) {
      return alert("番号を確定（OKボタン）してください");
    }
    // ... (以降のfetch処理は以前と同じ)
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

  // 投票完了画面は変更なし
  if (isVoted) {
    // ... (以前と同じ)
  }

  return (
    <div className="container">
      <h2>一番良かった出し物の番号を、入力してください。</h2>

      {/* ★ 変更点5: 新しいUIの骨格 */}
      <div className="keypad-container">
        <div className="display">
          {/* 選択が確定したら緑色で表示 */}
          <span className={`display-text ${selected ? 'confirmed' : ''}`}>
            {selected || inputValue || "00"}
          </span>
        </div>

        <div className="keypad">
          {/* 1から9までの数字ボタン */}
          {[...Array(9)].map((_, i) => {
            const number = String(i + 1);
            return <button key={number} onClick={() => handleNumberClick(number)} className="keypad-button">{number}</button>;
          })}
          {/* クリア、0、OKボタン */}
          <button onClick={handleClear} className="keypad-button wide">C</button>
          <button onClick={() => handleNumberClick('0')} className="keypad-button">0</button>
          <button onClick={handleConfirm} className="keypad-button wide confirm">OK</button>
        </div>
      </div>

      {/* 投票ボタンは、選択が確定されたら押せるように */}
      <button onClick={submitVote} className="submit-button" disabled={!selected}>
        {selected ? `'${selected}' に投票する` : "番号を入力してOKで確定してください。"}
      </button>

      {message && <p className="message">{message}</p>}
    </div>
  );
}