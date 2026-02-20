export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString();
  if (!body) {
    return {};
  }
  try {
    return JSON.parse(body);
  } catch {
    throw createHttpError(400, "Invalid JSON payload");
  }
}

export function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

export function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}
