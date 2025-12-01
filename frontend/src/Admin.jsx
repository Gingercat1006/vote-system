import { useState, useEffect } from "react"; // useEffect をインポート
import './App.css'; 

export default function Admin() {
  const [password, setPassword] = useState("");
  // ★ 変更点1: resultsはAPIからの生データ、sortedResultsが表示用データ
  const [results, setResults] = useState([]);
  const [sortedResults, setSortedResults] = useState([]); 
  const [error, setError] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);

  // ★ 変更点2: 現在の並び替え方法を記憶するためのstateを追加
  // 'count_desc' = 票の多い順, 'count_asc' = 票の少ない順
  // 'name_asc' = 番号昇順, 'name_desc' = 番号降順
  const [sortMethod, setSortMethod] = useState('count_desc'); 

  const fetchResults = async () => {
    setError("");
    if (!password) return setError("パスワードを入力してください");

    try {
      const res = await fetch(`https://vote-api-final.onrender.com/admin/results?pass=${password}`);
      const data = await res.json();

      if (!res.ok) {
        setResults([]);
        return setError(data.error || "データの取得に失敗しました");
      }
      
      setResults(data); // ★ APIからの生データはここに保存
      setSortMethod('count_desc'); // データを再取得したら、デフォルトの「票の多い順」に戻す
      const total = data.reduce((sum, item) => sum + parseInt(item.count, 10), 0);
      setTotalVotes(total);

    } catch (err) {
      setError("サーバーとの通信エラー");
    }
  };

  // ★ 変更点3: 並び替えを実行するためのuseEffectを追加
  useEffect(() => {
    // results（生データ）のコピーを作成して、並び替える
    let newSortedResults = [...results];

    switch (sortMethod) {
      case 'count_asc': // 票の少ない順
        newSortedResults.sort((a, b) => parseInt(a.count) - parseInt(b.count));
        break;
      case 'name_asc': // 番号の昇順 (01, 02, ...)
        newSortedResults.sort((a, b) => a.booth.localeCompare(b.booth));
        break;
      case 'name_desc': // 番号の降順 (55, 54, ...)
        newSortedResults.sort((a, b) => b.booth.localeCompare(a.booth));
        break;
      default: // 票の多い順 (count_desc)
        newSortedResults.sort((a, b) => parseInt(b.count) - parseInt(a.count));
        break;
    }

    setSortedResults(newSortedResults); // 並び替えた結果を表示用stateに保存
  }, [results, sortMethod]); // resultsかsortMethodが変更されたら、この処理が実行される

  return (
    <div className="container"> 
      <h2>管理者用ダッシュボード</h2>

      {/* ... パスワード入力部分は変更なし ... */}
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

      {/* results.length を sortedResults.length に変更 */}
      {sortedResults.length > 0 && (
        <div style={{ textAlign: 'left' }}>
          <h3>投票結果 (合計: {totalVotes}票)</h3>

          {/* ★ 変更点4: 並び替えボタンのUIを追加 */}
          <div className="sort-buttons">
            <button onClick={() => setSortMethod('count_desc')} className={`sort-button ${sortMethod === 'count_desc' ? 'active' : ''}`}>票の多い順</button>
            <button onClick={() => setSortMethod('count_asc')} className={`sort-button ${sortMethod === 'count_asc' ? 'active' : ''}`}>票の少ない順</button>
            <button onClick={() => setSortMethod('name_asc')} className={`sort-button ${sortMethod === 'name_asc' ? 'active' : ''}`}>番号順 (昇順)</button>
            <button onClick={() => setSortMethod('name_desc')} className={`sort-button ${sortMethod === 'name_desc' ? 'active' : ''}`}>番号順 (降順)</button>
          </div>

          {/* ★ 変更点5: results.map を sortedResults.map に変更 */}
          {sortedResults.map((item) => (
            <div key={item.booth} style={{ marginBottom: '10px' }}>
              {/* ... この中のグラフ表示部分は変更なし ... */}
              <p style={{ margin: '0 0 4px 0' }}><strong>{item.booth}</strong>: {item.count} 票</p>
              <div style={{ background: '#e9ecef', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: totalVotes > 0 ? `${(parseInt(item.count, 10) / totalVotes) * 100}%` : '0%',
                  height: '24px',
                  background: '#007bff',
                  // ... (以下略)
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