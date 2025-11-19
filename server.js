import express from "express";
import cors from "cors";
import pg from "pg"; // sqlite3の代わりにpgをインポート

const ALLOWED_BOOTHS = [
  "お化け屋敷", "焼きそば", "ダンス", "展示", "ゲーム",
  // ここに30個、好きなだけ追加してください！
  "たこ焼き", "フランクフルト", "射的", "スーパーボールすくい", "わたあめ",
  "金魚すくい", "ヨーヨー釣り", "バンド演奏", "演劇", "お茶会",
  "フリーマーケット", "古本市", "プログラミング展示", "書道パフォーマンス", "華道展示",
  "写真展", "映画上映", "クイズ大会", "のど自慢大会", "eスポーツ大会"
];

const app = express();

// CORSミドルウェアを先に設定
app.use(cors({ origin: '*', methods: 'GET,POST,OPTIONS' }));
app.use(express.json());

// ---- PostgreSQLデータベースへの接続設定 ----
const pool = new pg.Pool({
  // Renderの環境変数から接続URLを取得
  connectionString: process.env.DATABASE_URL,
  // RenderのPostgreSQLに接続するために推奨される設定
  ssl: {
    rejectUnauthorized: false
  }
});

// ---- 起動時にテーブルが存在するか確認し、なければ作成する ----
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
const ADMIN_PASSWORD = "miyaneyuka";

// ---- IPアドレスを取得する関数 ----
function getClientIp(req) {
  return (req.headers["x-forwarded-for"]?.split(",").shift() || req.socket.remoteAddress);
}

// ---- APIの作成 (PostgreSQL版) ----

// (ここから追加) フロントエンドに出し物の一覧を渡すAPI
app.get("/booths", (req, res) => {
  res.json(ALLOWED_BOOTHS);
});
// (ここまで追加)

// (1) 投票を受け付けるAPI (チェック機能を追加)
app.post("/vote", async (req, res) => {
  const ip = getClientIp(req);
  const { booth } = req.body;
  if (!booth) return res.status(400).json({ error: "booth is required" });

  // (ここから追加) 許可された出し物かチェック
  if (!ALLOWED_BOOTHS.includes(booth)) {
    return res.status(400).json({ error: "Invalid booth name" });
  }
  
  try {
    // IPが既に存在するかチェック
    const checkRes = await pool.query("SELECT * FROM votes WHERE ip = $1", [ip]);
    if (checkRes.rows.length > 0) {
      return res.status(403).json({ message: "既に投票済みです" });
    }
    // 投票を記録
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