export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey, Authorization, Prefer, x-client-info, x-supabase-api-version');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const SUPABASE_HOST = 'npzjingjspygxinhjphzx.supabase.co';

  let path = req.url;
  if (path.startsWith('/api/proxy')) {
    path = path.substring('/api/proxy'.length);
  }
  if (!path.startsWith('/')) path = '/' + path;

  const targetUrl = `https://${SUPABASE_HOST}${path}`;

  try {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.origin;
    delete headers.referer;
    delete headers.connection;
    delete headers['content-length'];
    headers.host = SUPABASE_HOST;

    let body;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
    });

    response.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === 'content-encoding' || k === 'content-length' || k === 'transfer-encoding') return;
      res.setHeader(key, value);
    });

    res.status(response.status);
    const text = await response.text();
    res.send(text);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
