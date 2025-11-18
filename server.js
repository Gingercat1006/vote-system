import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// ---- DB（データベース）の設定 ----
const db = new sqlite3.Database("./votes.db"); // DBファイル名を変更

// 投票テーブルを作成（IPアドレスを記録する形式に）
db.run(`
  CREATE TABLE IF NOT EXISTS votes (
    ip TEXT PRIMARY KEY,
    booth TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ---- 管理者用のパスワード ----
const ADMIN_PASSWORD = "admin-pass-123"; // ★必ず後で変えてください

// ---- リクエストからIPアドレスを取得する関数 ----
function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",").shift() || req.socket.remoteAddress
  );
}

// ---- API（機能の入り口）の作成 ----

// (1) 投票を受け付けるAPI
app.post("/vote", (req, res) => {
  const ip = getClientIp(req);
  const { booth } = req.body;

  if (!booth) {
    return res.status(400).json({ error: "booth is required" });
  }

  // IPアドレスが既に投票済みかチェック
  db.get("SELECT * FROM votes WHERE ip = ?", [ip], (err, row) => {
    if (row) {
      return res.status(403).json({ message: "既に投票済みです" });
    }

    // 初めてのIPなら、投票内容を記録
    db.run("INSERT INTO votes (ip, booth) VALUES (?, ?)", [ip, booth], (err) => {
      if (err) {
        return res.status(500).json({ error: "データベースエラーが発生しました" });
      }
      res.json({ message: "投票ありがとうございました！" });
    });
  });
});

// (2) 集計結果を返すAPI (変更なし)
app.get("/admin/results", (req, res) => {
  const { pass } = req.query;
  if (pass !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "管理者パスワードが違います" });
  }

  db.all(
    "SELECT booth, COUNT(*) AS count FROM votes GROUP BY booth ORDER BY count DESC",
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    }
  );
});

// ---- サーバーの起動 ----
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`サーバーがポート ${PORT} で起動しました`));