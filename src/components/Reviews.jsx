import { reviews } from '../data.js'

export default function Reviews() {
  return (
    <section className="card reviews">
      <h2>O que quem comprou está dizendo</h2>
      {reviews.map((r) => (
        <div className="review" key={r.name}>
          <img src={r.photo} alt={r.name} />
          <div>
            <strong>{r.name} <span className="stars">★★★★★</span></strong>
            <p>{r.text}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
