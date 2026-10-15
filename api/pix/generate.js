// Função serverless (Vercel): repassa o pedido para a API de PIX
// adicionando a api-key no header. A chave roda só no servidor, nunca no navegador.
const UPSTREAM = 'https://apipix-delta.vercel.app/api/pix2/generate'
const API_KEY = process.env.PIX_API_KEY || 'efde980e48a34504ada0a1f856992487'

// A primeira geração de uma cobrança pode levar vários segundos
export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify(req.body),
    })
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.send(await upstream.text())
  } catch {
    return res.status(502).json({ error: 'Falha ao contatar a API de PIX' })
  }
}
