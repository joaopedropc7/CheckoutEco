import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { brl } from '../data.js'
import { checkPaymentStatus } from '../api.js'

const POLL_MS = 5000

export default function PixPayment({ charge, total, name }) {
  const [now, setNow] = useState(Date.now())
  const [copied, setCopied] = useState(false)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (paid) return
    const id = setInterval(async () => {
      try {
        if ((await checkPaymentStatus(charge.id)) === 'paid') setPaid(true)
      } catch {
        // tenta de novo no próximo ciclo
      }
    }, POLL_MS)
    return () => clearInterval(id)
  }, [charge.id, paid])

  const left = Math.max(0, Math.floor((charge.expiresAt - now) / 1000))
  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(charge.code)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = charge.code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (paid) {
    return (
      <section className="card form-card success">
        <div className="success-icon">✓</div>
        <h1>Pagamento confirmado!</h1>
        <p className="sub">Obrigado, {name}! Seu pedido já está sendo preparado para envio.</p>
      </section>
    )
  }

  return (
    <section className="card form-card pix-screen">
      <h1>Falta pouco! Pague seu PIX</h1>
      <p className="sub">Seu pedido foi reservado. Pague para garantir sua unidade.</p>
      <div className="pix-amount">{brl(total)}</div>
      <div className="expires">⏳ {left > 0 ? `Expira em ${mm}:${ss}` : 'PIX expirado'}</div>

      <div className="qr">
        <QRCodeSVG value={charge.code} size={216} level="M" />
      </div>

      <div className="pix-code">{charge.code}</div>

      <button type="button" className="btn" onClick={copy}>
        {copied ? 'Código copiado! ✓' : 'Copiar código PIX'}
      </button>

      <ol className="pix-steps">
        <li><span>1</span>Abra o app do seu banco e escolha pagar com PIX.</li>
        <li><span>2</span>Escaneie o QR Code ou use “PIX Copia e Cola” com o código acima.</li>
        <li><span>3</span>Confirme o pagamento. Esta tela atualiza sozinha em segundos.</li>
      </ol>

      <p className="waiting"><span className="spinner" />Aguardando a confirmação do pagamento...</p>
    </section>
  )
}
