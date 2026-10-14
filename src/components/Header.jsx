export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <img src="/imagens/logoecovolt.jpg" alt="EcoVolt" className="logo" />
        <div className="secure">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          Compra 100% segura
        </div>
      </div>
    </header>
  )
}
