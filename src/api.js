import { getTrackingParameters } from './tracking.js'

const PIX_EXPIRATION_MS = 30 * 60 * 1000
const PIX_REQUEST_TIMEOUT_MS = 40 * 1000

const digits = (v) => v.replace(/\D/g, '')

// Gera a cobrança PIX. A chamada passa pelo nosso servidor (/api/pix/generate),
// que adiciona a api-key — ela nunca fica exposta no navegador.
export async function createPixCharge({ cliente, total }) {
  const body = {
    amount: Number(total.toFixed(2)),
    client: {
      name: cliente.nome.trim(),
      document: digits(cliente.cpf),
      phoneNumber: digits(cliente.telefone),
      email: cliente.email.trim(),
      address: {
        codIbge: cliente.ibge,
        street: cliente.rua.trim(),
        number: cliente.numero.trim(),
        zipCode: cliente.cep,
        neighborhood: cliente.bairro.trim(),
        city: cliente.cidade.trim(),
        state: cliente.uf,
      },
    },
    trackingParameters: getTrackingParameters(),
  }

  const res = await fetch('/api/pix/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(PIX_REQUEST_TIMEOUT_MS),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok || data?.response !== 'OK' || !data.paymentCode) {
    throw new Error(`Falha ao gerar PIX (${res.status})`)
  }

  return {
    id: data.idTransaction,
    code: data.paymentCode,
    expiresAt: Date.now() + PIX_EXPIRATION_MS,
  }
}

export async function checkPaymentStatus(chargeId) {
  // TODO: consultar o status da transação quando houver um endpoint para isso.
  // Deve retornar 'paid' quando o pagamento for confirmado.
  return 'pending'
}

// Busca o endereço pelo CEP no ViaCEP (https://viacep.com.br).
// Retorna null quando o CEP não existe e lança erro quando o serviço não responde.
export async function fetchAddress(cep, signal) {
  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal })
  if (!res.ok) throw new Error(`ViaCEP respondeu ${res.status}`)
  const data = await res.json()
  if (data.erro) return null
  return {
    rua: data.logradouro || '',
    bairro: data.bairro || '',
    cidade: data.localidade || '',
    uf: data.uf || '',
    ibge: data.ibge || '',
  }
}
