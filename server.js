import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();

// CORSミドルウェアを先に設定し、すべてのリクエストを許可する
app.use(cors({
  origin: '*', // すべてのオリジンを許可
  methods: 'GET,POST,OPTIONS',
  allowedHeaders: 'Content-Type'
}));

app.use(express.json());

// ---- PostgreSQLデータベースへの接続設定 ----
const isProduction = process.env.NODE_ENV === 'production';

const connectionConfig = {
  // もし本番環境なら、RenderのURLを使い、SSLを有効にする
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgresql://postgres:011430@localhost:5432/postgres',
  // もし本番環境なら、SSL設定を追加する
  ssl: isProduction ? { rejectUnauthorized: false } : false
};

const pool = new pg.Pool(connectionConfig);

// ---- 起動時にテーブルを準備する ----
const createTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS votes (
      ip TEXT PRIMARY KEY,
      booth TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  try {
    await pool.query(queryText);
    console.log("テーブルの準備ができました");
  } catch (err) {
    console.error("テーブル作成中にエラーが発生", err);
  }
};
createTable();

// ---- 管理者用のパスワード ----
const ADMIN_PASSWORD = "sundai";

// ---- IPアドレスを取得する関数 ----
function getClientIp(req) {
  return (req.headers["x-forwarded-for"]?.split(",").shift() || req.socket.remoteAddress);
}

// =================================================================
// ★ API (機能の入り口) ★
// =================================================================

// (1) 投票を受け付けるAPI
app.post("/vote", async (req, res) => {
  const ip = getClientIp(req);
  const { booth } = req.body;
  if (!booth) return res.status(400).json({ error: "booth is required" });

  try {
    const checkRes = await pool.query("SELECT * FROM votes WHERE ip = $1", [ip]);
    if (checkRes.rows.length > 0) {
      return res.status(403).json({ message: "既に投票済みです" });
    }
    await pool.query("INSERT INTO votes (ip, booth) VALUES ($1, $2)", [ip, booth]);
    res.json({ message: "投票ありがとうございました！" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データベースエラーが発生しました" });
  }
});

// (2) 集計結果を返すAPI
app.get("/admin/results", async (req, res) => {
  const { pass } = req.query;
  if (pass !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "管理者パスワードが違います" });
  }

  try {
    const results = await pool.query("SELECT booth, COUNT(*) AS count FROM votes GROUP BY booth ORDER BY count DESC");
    res.json(results.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// ---- サーバーの起動 ----
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`サーバーがポート ${PORT} で起動しました`));