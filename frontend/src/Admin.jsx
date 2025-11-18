import { useState } from "react";
import './App.css';

export default function Admin() {
  const [password, setPassword] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchResults = async () => {
    setError("");
    if (!password) return setError("パスワードを入力してください");

    try {
      // ★注意： 'localhost:3001' の部分は、公開時にはサーバーのURLに変えます
      const res = await fetch(`http://localhost:3001/admin/results?pass=${password}`);
      const data = await res.json();

      if (!res.ok) return setError(data.error || "データの取得に失敗しました");
      
      setResults(data);
      // 合計票数を計算
      const total = data.reduce((sum, item) => sum + item.count, 0);
      setTotalVotes(total);

    } catch (err) {
      setError("サーバーとの通信エラー");
    }
  };

  return (
    <div className="container">
      <h2>管理者用ダッシュボード</h2>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
        <input
          type="password"
          placeholder="管理者パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="code-input"
        />
        <button onClick={fetchResults} className="submit-button">集計結果を表示</button>
      </div>

      {error && <p className="message" style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        <div>
          <h3>投票結果 (合計: {totalVotes}票)</h3>
          {results.map((item) => (
            <div key={item.booth} style={{ marginBottom: '10px' }}>
              <p style={{ margin: 0 }}><strong>{item.booth}</strong>: {item.count} 票</p>
              <div style={{ background: '#f0f0f0', borderRadius: '5px' }}>
                <div style={{
                  width: `${(item.count / totalVotes) * 100}%`,
                  background: '#007bff',
                  height: '20px',
                  borderRadius: '5px',
                  color: 'white',
                  textAlign: 'right',
                  paddingRight: '5px',
                  boxSizing: 'border-box'
                }}>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}