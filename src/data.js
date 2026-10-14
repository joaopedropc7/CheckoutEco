// Um checkout por kit. O caminho da URL escolhe o produto:
//   /1-unidade   /2-unidades   /3-unidades
export const products = {
  '1-unidade': {
    name: 'EcoVolt 1 unidade',
    title: 'ECOVOLT 1 UNIDADE',
    subtitle: 'Casa pequena · até 40 m²',
    image: '/imagens/imgproduto1unidade.png',
    quantity: 1,
    oldPrice: 99,
    price: 49,
  },
  '2-unidades': {
    name: 'EcoVolt 2 unidades',
    title: 'ECOVOLT 2 UNIDADES',
    subtitle: 'Casa média · 40 a 60 m²',
    image: '/imagens/2unidades.png',
    quantity: 1,
    oldPrice: 198,
    price: 97,
  },
  '3-unidades': {
    name: 'EcoVolt 3 unidades',
    title: 'ECOVOLT 3 UNIDADES',
    subtitle: 'Casa grande · acima de 60 m²',
    image: '/imagens/3unidades.png',
    quantity: 1,
    oldPrice: 297,
    price: 147,
  },
}

const DEFAULT_SLUG = '1-unidade'
const slug = window.location.pathname.replace(/^\/+|\/+$/g, '')

export const product = products[slug] || products[DEFAULT_SLUG]

export const reviews = [
  { name: 'Marcos A.', photo: '/imagens/marcos.jpeg', text: 'Pensei que era mentira, mas a conta que era 320 baixou pra 110.... indico pro pessoal' },
  { name: 'Emerso J.', photo: '/imagens/emerso.jpeg', text: 'Aqui funcionou! Se soubesse tinha comprado antes...' },
  { name: 'Anderson P.', photo: '/imagens/anderson.jpeg', text: 'Produto muito bom. Valeu a pena demais' },
  { name: 'Fatima M.', photo: '/imagens/fatima.jpeg', text: 'Gente do céu que bença esse produto!!! Chega de ser roubada!!! Muito bom e recomendo para todos!!!' },
]

export const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const inDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`
}

export const shippingOptions = [
  { id: 'gratis', name: 'Frete Grátis', price: 0, icon: 'box', eta: () => `Chega entre ${inDays(9)} e ${inDays(16)}` },
  { id: 'sedex', name: 'Frete Sedex', price: 18.52, icon: 'bolt', eta: () => `Chega até ${inDays(7)}` },
  { id: 'correios', name: 'Frete Correios', price: 14.5, icon: 'box', eta: () => `Chega entre ${inDays(6)} e ${inDays(9)}` },
]
