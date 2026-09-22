import express from 'express';
import cookieParser from 'cookie-parser';
import * as trpcExpress from '@trpc/server/adapters/express';
import fs from 'fs';
import path from 'path';
import { appRouter } from '../routers.ts';
import { createContext } from './context.ts';
import { ENV } from './env.ts';
import { getDB } from '../db.ts';

export const app = express();

const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Static file serving for uploads (receipts, barcodes, documents)
app.use('/uploads', express.static(UPLOADS_DIR));

// Direct upload API for receipts and QR codes
app.post('/api/upload', (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'بيانات الصورة مطلوبة (base64Data)' });
    }

    // Strip header if data URI
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    const ext = (filename && path.extname(filename)) || '.png';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, safeName);

    fs.writeFileSync(targetPath, buffer);
    const publicUrl = `/uploads/${safeName}`;

    return res.json({ success: true, url: publicUrl, filename: safeName });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'فشل رفع الملف' });
  }
});

// CORS & Security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Health checks
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'MADAR SaaS Marriage Bureau',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/ready', async (req, res) => {
  try {
    await getDB();
    res.json({ status: 'ready', database: 'connected' });
  } catch (err: any) {
    res.status(500).json({ status: 'unready', error: err.message });
  }
});

// tRPC API Endpoint
app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// If started directly with node or tsx
if (process.env.NODE_ENV === 'production' && !process.env.VITE_DEV_MODE) {
  const path = await import('path');
  const distDir = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

export function startServer(port = ENV.PORT) {
  return app.listen(port, '0.0.0.0', () => {
    console.log(`[MADAR] Server listening on port ${port}`);
  });
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
