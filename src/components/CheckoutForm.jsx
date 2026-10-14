import { useRef, useState } from 'react'
import { product, brl, shippingOptions } from '../data.js'
import { createPixCharge, fetchAddress } from '../api.js'
import { Box, Bolt, Check, Lock } from './Icons.jsx'
import PixPayment from './PixPayment.jsx'

const STEPS = ['Identificação', 'Entrega', 'Pagamento']

const digits = (v) => v.replace(/\D/g, '')

const masks = {
  telefone: (v) => {
    const d = digits(v).slice(0, 11)
    if (d.length <= 2) return d.length ? `(${d}` : ''
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  },
  cep: (v) => {
    const d = digits(v).slice(0, 8)
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
  },
  cpf: (v) => {
    const d = digits(v).slice(0, 11)
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  },
  uf: (v) => v.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase(),
}

function isValidCpf(value) {
  const c = digits(value)
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false
  const calc = (len) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(c[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return calc(9) === Number(c[9]) && calc(10) === Number(c[10])
}

const validators = {
  1: (f) => ({
    nome: f.nome.trim().split(/\s+/).length < 2 && 'Informe seu nome completo',
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) && 'Informe um e-mail válido',
    telefone: digits(f.telefone).length < 10 && 'Informe um celular válido',
  }),
  2: (f) => ({
    cep: digits(f.cep).length !== 8 && 'Informe um CEP válido',
    rua: !f.rua.trim() && 'Informe a rua',
    numero: !f.numero.trim() && 'Informe o número',
    bairro: !f.bairro.trim() && 'Informe o bairro',
    cidade: !f.cidade.trim() && 'Informe a cidade',
    uf: f.uf.length !== 2 && 'UF inválida',
  }),
  3: (f) => ({
    cpf: !isValidCpf(f.cpf) && 'Informe um CPF válido',
  }),
}

const initial = {
  nome: '', email: '', telefone: '',
  cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', ibge: '',
  cpf: '',
}

export default function CheckoutForm({ shipping, onShippingChange, onPixScreen }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [loadingCep, setLoadingCep] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [charge, setCharge] = useState(null)
  const cepRequest = useRef(null)

  const total = product.price * product.quantity + shipping.price
  const firstName = form.nome.trim().split(/\s+/)[0]

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: masks[name] ? masks[name](value) : value }))
    setErrors((e) => ({ ...e, [name]: false }))
  }

  const goTo = (n) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onCep = async (value) => {
    set('cep', value)
    setForm((f) => ({ ...f, ibge: '' }))
    const cep = digits(value)
    cepRequest.current?.abort()
    if (cep.length !== 8) {
      setLoadingCep(false)
      return
    }

    const controller = new AbortController()
    cepRequest.current = controller
    setLoadingCep(true)
    try {
      const address = await fetchAddress(cep, controller.signal)
      if (!address) {
        setForm((f) => ({ ...f, rua: '', bairro: '', cidade: '', uf: '', ibge: '' }))
        setErrors((e) => ({ ...e, cep: 'CEP não encontrado' }))
        return
      }
      setForm((f) => ({ ...f, ...address }))
      setErrors((e) => ({ ...e, rua: false, bairro: false, cidade: false, uf: false }))
      // CEP de cidade pequena vem sem rua: foca nela; senão, vai direto para o número
      const next = address.rua ? 'numero' : 'rua'
      requestAnimationFrame(() => document.querySelector(`input[name=${next}]`)?.focus())
    } catch (err) {
      if (err.name === 'AbortError') return
      setErrors((e) => ({ ...e, cep: 'Não conseguimos buscar o CEP. Preencha o endereço manualmente.' }))
    } finally {
      if (cepRequest.current === controller) setLoadingCep(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = validators[step](form)
    setErrors(found)
    if (Object.values(found).some(Boolean)) return
    if (step < 3) return goTo(step + 1)

    setSubmitting(true)
    try {
      const result = await createPixCharge({
        cliente: form,
        produto: product,
        frete: { id: shipping.id, nome: shipping.name, valor: shipping.price },
        total,
      })
      setCharge(result)
      onPixScreen(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setErrors({ cpf: 'Não foi possível gerar o PIX. Tente novamente.' })
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name, label, props = {}) => {
    const { className = '', ...rest } = props
    return (
      <label className={`field ${className}`}>
        <span>{label}</span>
        <input
          name={name}
          value={form[name]}
          onChange={(e) => (name === 'cep' ? onCep(e.target.value) : set(name, e.target.value))}
          className={errors[name] ? 'invalid' : ''}
          {...rest}
        />
        {errors[name] && <em className="err">{errors[name]}</em>}
      </label>
    )
  }

  if (charge) {
    return <PixPayment charge={charge} total={total} name={firstName} />
  }

  return (
    <section className="card form-card">
      <ol className="steps">
        {STEPS.map((label, i) => {
          const n = i + 1
          const state = n === step ? 'active' : n < step ? 'done' : ''
          return (
            <li key={label} className={`step-wrap ${n > 1 ? 'with-bar' : ''}`}>
              {n > 1 && <span className={`bar ${n <= step ? 'filled' : ''}`} />}
              <button type="button" className={`step ${state}`} disabled={n >= step} onClick={() => goTo(n)}>
                <span className="num">{n < step ? <Check /> : n}</span>
                <span className="label">{label}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <form onSubmit={submit} noValidate>
        {step === 1 && (
          <>
            <h1>Identificação</h1>
            <p className="sub">Preencha seus dados para o envio do pedido.</p>
            {field('nome', 'Nome completo', { placeholder: 'Como está no seu documento', autoComplete: 'name' })}
            {field('email', 'E-mail', { type: 'email', placeholder: 'voce@email.com', autoComplete: 'email' })}
            <label className="field">
              <span>Celular / WhatsApp</span>
              <div className="phone">
                <span className="ddi">+55</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="(11) 99999-9999"
                  autoComplete="tel-national"
                  value={form.telefone}
                  onChange={(e) => set('telefone', e.target.value)}
                  className={errors.telefone ? 'invalid' : ''}
                />
              </div>
              {errors.telefone && <em className="err">{errors.telefone}</em>}
            </label>
            <button type="submit" className="btn">Ir para entrega →</button>
            <p className="note">🔒 Seus dados estão seguros e só são usados para entregar seu pedido.</p>
          </>
        )}

        {step === 2 && (
          <>
            <h1>Entrega</h1>
            <p className="sub">
              Enviar para {firstName} · <button type="button" className="link" onClick={() => goTo(1)}>alterar dados</button>
            </p>
            {field('cep', 'CEP', {
              className: `cep ${loadingCep ? 'loading' : ''}`, inputMode: 'numeric', placeholder: '00000-000', autoComplete: 'postal-code',
            })}
            {field('rua', 'Rua / Avenida', { autoComplete: 'address-line1' })}
            <div className="row">
              {field('numero', 'Número', { className: 'grow' })}
              {field('complemento', 'Complemento (opcional)', { className: 'grow', autoComplete: 'address-line2' })}
            </div>
            {field('bairro', 'Bairro')}
            <div className="row">
              {field('cidade', 'Cidade', { className: 'grow', autoComplete: 'address-level2' })}
              {field('uf', 'UF', { className: 'uf', autoComplete: 'address-level1' })}
            </div>

            <h2 className="section-title">Escolha o frete</h2>
            <div className="options">
              {shippingOptions.map((o) => (
                <label key={o.id} className={`option ${shipping.id === o.id ? 'selected' : ''}`}>
                  <input type="radio" name="frete" checked={shipping.id === o.id} onChange={() => onShippingChange(o)} />
                  <span className="radio" />
                  <span className="opt-icon">{o.icon === 'bolt' ? <Bolt /> : <Box />}</span>
                  <div><strong>{o.name}</strong><small>{o.eta()}</small></div>
                  {o.price ? <span className="opt-price">{brl(o.price)}</span> : <span className="free">GRÁTIS</span>}
                </label>
              ))}
            </div>

            <button type="submit" className="btn">Ir para pagamento →</button>
            <button type="button" className="back" onClick={() => goTo(1)}>← Voltar</button>
          </>
        )}

        {step === 3 && (
          <>
            <h1>Pagamento</h1>
            <p className="sub">Pague com PIX e receba a confirmação na hora.</p>
            {field('cpf', 'CPF do comprador', { inputMode: 'numeric', placeholder: '000.000.000-00', className: 'no-gap' })}
            <p className="hint">Necessário para emitir o PIX e a nota do pedido.</p>

            <div className="pix-box">
              <span className="pix-logo"><i>PIX</i></span>
              <div>
                <strong>PIX <span className="badge">Aprovação imediata</span></strong>
                <p>Você verá o QR Code na próxima tela. Abra o app do seu banco e pague em segundos.</p>
              </div>
            </div>

            <div className="guarantee">
              <img src="/imagens/garantiavitalicia.webp" alt="" />
              <p>
                <strong>Garantia de 60 dias.</strong> Teste sem risco: se não perceber diferença na sua conta de luz,
                devolvemos 100% do valor.
              </p>
            </div>

            <button type="submit" className="btn btn-icon" disabled={submitting}>
              <Lock />
              {submitting ? 'Gerando PIX...' : `Finalizar compra · ${brl(total)}`}
            </button>
            <p className="note">Ao finalizar, você concorda com os termos de uso e a política de privacidade.</p>
            <button type="button" className="back" onClick={() => goTo(2)}>← Voltar</button>
          </>
        )}
      </form>
    </section>
  )
}
