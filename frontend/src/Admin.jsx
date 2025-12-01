import { useState } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchResults = async () => {
    setError("");
    if (!password) return setError("パスワードを入力してください");

    try {
      const res = await fetch(`https://vote-api-final.onrender.com/admin/results?pass=${password}`);
      const data = await res.json();

      if (!res.ok) {
        setResults([]); // エラー時は結果を空にする
        return setError(data.error || "データの取得に失敗しました");
      }
      
      setResults(data);
      const total = data.reduce((sum, item) => sum + parseInt(item.count, 10), 0);
      setTotalVotes(total);

    } catch (err) {
      setError("サーバーとの通信エラー");
    }
  };

  // ★ 変更点1：一番外側のdivに className="container" を追加
  return (
    <div className="container"> 
      <h2>管理者用ダッシュボード</h2>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', justifyContent: 'center' }}>
        <input
          type="password"
          placeholder="管理者パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="code-input"
        />
        <button onClick={fetchResults} className="admin-button">集計結果を表示</button>
      </div>

      {error && <p className="message" style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        // text-align: left を追加して、グラフのラベルが左揃えになるように
        <div style={{ textAlign: 'left' }}>
          <h3>投票結果 (合計: {totalVotes}票)</h3>
          {results.map((item) => (
            <div key={item.booth} style={{ marginBottom: '10px' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>{item.booth}</strong>: {item.count} 票</p>
              <div style={{ background: '#e9ecef', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  // ★ 変更点2：totalVotesが0でないことを確認してから割り算する
                  width: totalVotes > 0 ? `${(parseInt(item.count, 10) / totalVotes) * 100}%` : '0%',
                  height: '24px',
                  background: '#007bff',
                  borderRadius: '5px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '8px',
                  boxSizing: 'border-box',
                  transition: 'width 0.5s ease-in-out' // グラフが伸びるアニメーションを追加
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