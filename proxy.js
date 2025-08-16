export default async function handler(req, res) {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Faltou a URL" });
  }

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");

    res.setHeader("Content-Type", contentType || "application/octet-stream");
    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar stream", details: err.message });
  }
}