const NEWSAPI_KEY = "1166beef1aa84f75a093800d1f3cb03d";

module.exports = async function handler(req, res) {
  try {
    const url = `https://newsapi.org/v2/everything?q=%EC%86%8C%EC%8B%9D&language=ko&sortBy=publishedAt&pageSize=10&apiKey=${NEWSAPI_KEY}`;
    const upstream = await fetch(url);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ status: "error", message: err.message });
  }
}
