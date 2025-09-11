// package.json: "type": "module"
// npm i express mysql2 @aws-sdk/rds-signer
import fs from "fs";
import path from "path";
import express from "express";
import mysql from "mysql2/promise";
import { Signer } from "@aws-sdk/rds-signer";

const app = express();
const PORT = process.env.PORT || 3000;

// ====== DB & TLS 설정 ======
const DB_HOST   = process.env.DB_HOST;   // yourcluster.cluster-xxxx.ap-northeast-2.rds.amazonaws.com
const DB_PORT   = Number(process.env.DB_PORT || 3306);
const DB_USER   = process.env.DB_USER;   // AWSAuthenticationPlugin으로 만든 사용자
const DB_NAME   = process.env.DB_NAME || "appdb";
const DB_REGION = process.env.AWS_REGION || process.env.DB_REGION || "ap-northeast-2";

// RDS CA 번들 경로 (글로벌 번들을 기본값으로 사용)
const DEFAULT_CA_PATH = "/etc/ssl/certs/rds-global-bundle.pem";
const CA_PATH = process.env.DB_SSL_CA_PATH || process.env.RDS_CA_BUNDLE || DEFAULT_CA_PATH;

// CA 파일 로드 (필수)
let CA_CONTENT;
try {
  CA_CONTENT = fs.readFileSync(path.resolve(CA_PATH), "utf8");
  if (!CA_CONTENT?.trim()) {
    throw new Error("CA bundle file is empty.");
  }
  console.log(`[startup] Loaded RDS CA bundle from: ${CA_PATH}`);
} catch (e) {
  console.error(
    `[startup] Failed to load RDS CA bundle at "${CA_PATH}". ` +
    `Set DB_SSL_CA_PATH or mount the file in the image.\n` +
    `Error: ${e?.message || e}`
  );
  process.exit(1);
}

async function getConnection() {
  // 1) IAM 토큰 생성 (유효 15분)
  const signer = new Signer({
    region: DB_REGION,
    hostname: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
  });
  const token = await signer.getAuthToken({});

  // 2) 토큰으로 MySQL 접속 (ssl.ca 지정이 핵심)
  return mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    database: DB_NAME,
    password: token,
    ssl: {
      ca: CA_CONTENT,             // ← RDS 신뢰 번들 지정
      rejectUnauthorized: true,   // 서버 인증서 검증 활성화
    },
    // IAM 인증은 클리어 텍스트 플러그인이 필요
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(token + "\0"),
    },
  });
}

// 헬스 체크
app.get("/health", async (_req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT 1 AS ok");
    await conn.end();
    res.json({ ok: rows[0]?.ok === 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// 현재 시간
app.get("/now", async (_req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT NOW() AS now");
    await conn.end();
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

// 샘플 부트스트랩
app.get("/bootstrap", async (_req, res) => {
  try {
    const conn = await getConnection();
    await conn.query(`CREATE TABLE IF NOT EXISTS items(
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await conn.query(`INSERT INTO items(name) VALUES ('hello'), ('aurora'), ('eks')`);
    const [rows] = await conn.query("SELECT id, name, created_at FROM items ORDER BY id DESC LIMIT 10");
    await conn.end();
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => console.log(`listening on :${PORT}`));
