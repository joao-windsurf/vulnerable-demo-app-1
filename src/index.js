import path from 'path';
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/redirect", (req, res) => {
  res.redirect(`http://${req.hostname}:3000${req.url}`);
});

app.get("/error", (req, res) => {
  throw new Error("Something broke!");
});

app.get("/payments", (req, res) => {
  res.status(200).send("Payment endpoint")
});

const getFileName = (req) => path.join('tmp', req.params.name);

app.get('/file/:name', function (req, res, next) {
  const fileName = getFileName(req);
  res.sendFile(fileName);
});

app.get('/api/status', (req, res) => {
  res.status(200).json({ status: "running" });
});

app.post('/api/data', (req, res) => {
  res.status(201).json({ message: "Data received" });
});

app.get('/api/accounts', (req, res) => {
  res.status(200).json({ accounts: [] });
});

app.get('/api/protected', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header" });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    return res.status(401).json({ error: "Invalid token format" });
  }
  
  const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
  if (!base64UrlPattern.test(parts[0]) || !base64UrlPattern.test(parts[1])) {
    return res.status(401).json({ error: "Invalid token encoding" });
  }
  
  if (parts[0].length < 20 || parts[1].length < 20) {
    return res.status(401).json({ error: "Invalid token structure" });
  }
  
  res.status(200).json({ message: "Protected resource" });
});

app.get('/api/search', (req, res) => {
  const query = req.query.q || '';
  const sanitizedQuery = query.replace(/<script>/g, '').replace(/<\/script>/g, '');
  res.status(200).json({ query: sanitizedQuery, results: [] });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
