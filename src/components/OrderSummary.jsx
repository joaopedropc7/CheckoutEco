import { useState } from 'react'
import { product, brl } from '../data.js'
import { ShieldCheck, Truck, Lock, Chevron } from './Icons.jsx'

export default function OrderSummary({ shipping, compact }) {
  const [open, setOpen] = useState(false)
  const subtotal = product.price * product.quantity
  const total = subtotal + shipping.price
  const off = Math.round((1 - product.price / product.oldPrice) * 100)

  return (
    <aside className={`card summary ${open ? 'open' : ''}`}>
      {/* Somente mobile: cabeçalho recolhível */}
      <button type="button" className="summary-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="toggle-thumb"><img src={product.image} alt="" /></span>
        <span className="toggle-text">
          <strong>Resumo do pedido</strong>
          <small>{product.quantity}× {product.name}</small>
        </span>
        <span className="toggle-price">{brl(total)}</span>
        <Chevron className="chevron" />
      </button>

      {/* Somente desktop */}
      <div className="summary-head">
        <h2>Resumo do pedido</h2>
        <span>{brl(total)}</span>
      </div>

      <div className="summary-body">
        <div className="product">
          <div className="product-img">
            <img src={product.image} alt={product.name} />
            <span className="qty">{product.quantity}</span>
          </div>
          <div className="product-info">
            <h3>{product.title}</h3>
            {!compact && <p className="muted">{product.subtitle}</p>}
            <div className="prices">
              <s>{brl(product.oldPrice)}</s>
              <strong>{brl(product.price)}</strong>
              <span className="off">-{off}%</span>
            </div>
          </div>
        </div>

        <div className="gift">
          <img src="/imagens/garantiavitalicia.webp" alt="Garantia Vitalícia" />
          <div>
            <span className="gift-tag">🎁 VOCÊ GANHOU UM BRINDE</span>
            <strong>Garantia Vitalícia</strong>
            <p>Incluído no seu pedido</p>
          </div>
        </div>

        <div className="lines">
          <div className="line"><span>Produto ({product.quantity})</span><span>{brl(subtotal)}</span></div>
          <div className="line">
            <span>{shipping.name}</span>
            {shipping.price ? <span>{brl(shipping.price)}</span> : <span className="free">GRÁTIS</span>}
          </div>
        </div>

        <div className="total"><span>Total</span><span>{brl(total)}</span></div>

        <ul className="perks">
          <li><ShieldCheck />60 dias de garantia: não gostou, devolvemos 100%</li>
          <li><Truck />Envio em até 24h úteis para todo o Brasil</li>
          <li><Lock />Seus dados protegidos e criptografados</li>
        </ul>
      </div>
    </aside>
  )
}
