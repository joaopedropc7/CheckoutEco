import { useState } from 'react'
import TopBar from './components/TopBar.jsx'
import Header from './components/Header.jsx'
import OrderSummary from './components/OrderSummary.jsx'
import CheckoutForm from './components/CheckoutForm.jsx'
import Reviews from './components/Reviews.jsx'
import Footer from './components/Footer.jsx'
import { shippingOptions } from './data.js'

export default function App() {
  const [shipping, setShipping] = useState(shippingOptions[0])
  const [compact, setCompact] = useState(false)

  return (
    <>
      <TopBar />
      <Header />
      <main className="container layout">
        <OrderSummary shipping={shipping} compact={compact} />
        <div className="main-col">
          <CheckoutForm shipping={shipping} onShippingChange={setShipping} onPixScreen={setCompact} />
          {!compact && <Reviews />}
        </div>
      </main>
      <Footer />
    </>
  )
}
