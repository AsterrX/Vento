import { useEffect, useState } from 'react'
import { MODELS, PROCESS, PAINTS, FINISHES, WHEELS, RIM_FINISHES, CALIPERS, LEATHERS, ACCENTS } from './content'
import Configurator from './Configurator'

const mm = (n) => n.toLocaleString('en-US').replace(',', ' ')

// Technical-drawing overlay: length, wheelbase and height drawn over the studio side view.
function Dimensions({ d, specs }) {
  const W = 1600, H = 900
  const X = (u) => u * W, Y = (v) => v * H
  const yWb = Y(d.ground + 0.07), yLen = Y(d.ground + 0.15), xH = X(d.x1 + 0.045)
  const tick = (x, y) => <line x1={x} y1={y - 12} x2={x} y2={y + 12} />
  return (
    <svg className="dims" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g className="dims-ext">
        <line x1={X(d.x0)} y1={Y(d.ground)} x2={X(d.x0)} y2={yLen + 16} />
        <line x1={X(d.x1)} y1={Y(d.ground)} x2={X(d.x1)} y2={yLen + 16} />
        <line x1={X(d.wr)} y1={Y(d.ground) + 8} x2={X(d.wr)} y2={yWb + 16} />
        <line x1={X(d.wf)} y1={Y(d.ground) + 8} x2={X(d.wf)} y2={yWb + 16} />
        <line x1={X(d.x1) + 10} y1={Y(d.top)} x2={xH + 16} y2={Y(d.top)} />
        <line x1={X(d.x1) + 10} y1={Y(d.ground)} x2={xH + 16} y2={Y(d.ground)} />
      </g>
      <g className="dims-line">
        <line x1={X(d.wr)} y1={yWb} x2={X(d.wf)} y2={yWb} />{tick(X(d.wr), yWb)}{tick(X(d.wf), yWb)}
        <line x1={X(d.x0)} y1={yLen} x2={X(d.x1)} y2={yLen} />{tick(X(d.x0), yLen)}{tick(X(d.x1), yLen)}
        <line x1={xH} y1={Y(d.top)} x2={xH} y2={Y(d.ground)} />
        <line x1={xH - 12} y1={Y(d.top)} x2={xH + 12} y2={Y(d.top)} />
        <line x1={xH - 12} y1={Y(d.ground)} x2={xH + 12} y2={Y(d.ground)} />
      </g>
      <g className="dims-label">
        <text x={(X(d.wr) + X(d.wf)) / 2} y={yWb - 12}>{mm(specs.wheelbase)}</text>
        <text x={(X(d.x0) + X(d.x1)) / 2} y={yLen - 12}>{mm(specs.length)}</text>
        <text x={xH + 14} y={(Y(d.top) + Y(d.ground)) / 2} className="v">{mm(specs.height)}</text>
      </g>
    </svg>
  )
}

function Lightbox({ shot, onClose }) {
  useEffect(() => {
    if (!shot) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [shot, onClose])
  if (!shot) return null
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={shot[1]} onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={`./img/${shot[0]}.jpg`} alt={shot[1]} />
        <figcaption><span>{shot[1]}</span><button onClick={onClose} autoFocus>Close</button></figcaption>
      </figure>
    </div>
  )
}

function Model({ m, onConfigure, onOpen }) {
  return (
    <article className="model" id={m.id} style={{ '--tint': m.tint }}>
      <figure className="model-hero">
        <img src={`./img/${m.hero}.jpg`} alt={`${m.full} on location`} loading="lazy" />
        <figcaption>
          <span className="model-no">{m.no} / 03</span>
          <h3 className="model-name">{m.name}</h3>
          <span className="model-type">{m.type}</span>
        </figcaption>
      </figure>

      <div className="model-body">
        <div className="model-copy">
          <p className="model-lede">{m.lede}</p>
          <p className="model-inf"><span>Influences</span>{m.influences}</p>
          <ul className="model-details">
            {m.details.map((t) => <li key={t}>{t}</li>)}
          </ul>
          <a className="btn btn-line" href="#configure" onClick={() => onConfigure(m.id)}>Configure the {m.name}</a>
        </div>
        <div className="model-tech">
          <figure className="model-frame">
            <img src={`./img/${m.side}.jpg`} alt={`${m.full}, side elevation`} loading="lazy" />
            <Dimensions d={m.dims} specs={m.specs} />
          </figure>
          <dl className="specs">
            <div><dt>Length</dt><dd>{mm(m.specs.length)}<i>mm</i></dd></div>
            <div><dt>Wheelbase</dt><dd>{mm(m.specs.wheelbase)}<i>mm</i></dd></div>
            <div><dt>Height</dt><dd>{mm(m.specs.height)}<i>mm</i></dd></div>
            <div><dt>Seats</dt><dd>{m.specs.seats}</dd></div>
          </dl>
        </div>
      </div>

      <div className={`gallery g${m.gallery.length}`}>
        {m.gallery.map((g) => (
          <button key={g[0]} className="shot" onClick={() => onOpen(g)} aria-label={`Open photo: ${g[1]}`}>
            <img src={`./img/${g[0]}.jpg`} alt="" loading="lazy" />
            <span>{g[1]}</span>
          </button>
        ))}
      </div>
    </article>
  )
}

export default function Site() {
  const [modelId, setModelId] = useState('gt')
  const [shot, setShot] = useState(null)
  return (
    <>
      <header className="top">
        <a className="wordmark" href="#top" aria-label="Vento, back to top">VENTO</a>
        <nav aria-label="Sections">
          <a href="#models">Models</a>
          <a href="#interior">Interior</a>
          <a href="#process">Process</a>
          <a href="#configure" className="nav-cta">Configure</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <img className="hero-img" src="./img/gt_hero.jpg" alt="Vento GT in Rosso Vento on a country road at dusk" />
          <div className="hero-copy">
            <p className="eyebrow">Prototype series · 2026</p>
            <h1>Vento</h1>
            <p className="hero-lede">Three cars I designed in code, modelled in Blender and built to explore in 3D.</p>
            <div className="hero-cta">
              <a className="btn btn-solid" href="#configure">Build your Vento</a>
              <a className="btn btn-ghost" href="#models">See the cars</a>
            </div>
          </div>
          <nav className="hero-strip" aria-label="Models">
            {MODELS.map((m) => (
              <a key={m.id} href={`#${m.id}`} style={{ '--tint': m.tint }}>
                <span className="hs-no">{m.no}</span>
                <span className="hs-name">{m.name}</span>
                <span className="hs-type">{m.type}</span>
              </a>
            ))}
          </nav>
        </section>

        <section className="intro">
          <p className="statement">
            <em>Vento</em> is Italian for wind. It is also my idea of a car brand: three very different cars that share
            one design language of blade lights, a winged V badge and clean, tensioned surfaces.
          </p>
          <dl className="facts">
            <div><dt>Cars</dt><dd>Sports coupé, luxury saloon, electric SUV</dd></div>
            <div><dt>Influences</dt><dd>Porsche, Rolls-Royce, Mercedes-Benz, Range Rover</dd></div>
            <div><dt>Built with</dt><dd>Blender, Python, Cycles, React Three Fiber</dd></div>
            <div><dt>Year</dt><dd>2026</dd></div>
          </dl>
        </section>

        <section className="models" id="models" aria-label="The cars">
          {MODELS.map((m) => <Model key={m.id} m={m} onConfigure={setModelId} onOpen={setShot} />)}
        </section>

        <section className="interior" id="interior">
          <header className="section-head">
            <p className="eyebrow">Interior</p>
            <h2>Inside each car</h2>
            <p className="section-lede">
              Seats, dashboards, screens, door panels and ambient lighting are part of each model, so the cars hold up when the doors open.
              In the configurator you can choose from {LEATHERS.length} leathers, {ACCENTS.length} trims and four ambient colours.
            </p>
          </header>
          <div className="int-grid">
            <button className="shot big" onClick={() => setShot(['arco_dash', 'Vento Arco, glass dashboard'])} aria-label="Open photo: Vento Arco dashboard">
              <img src="./img/arco_dash.jpg" alt="" loading="lazy" /><span>Arco · glass dashboard, Avorio leather, walnut</span>
            </button>
            <button className="shot" onClick={() => setShot(['cima_dash', 'Vento Cima, floating screen'])} aria-label="Open photo: Vento Cima cabin">
              <img src="./img/cima_dash.jpg" alt="" loading="lazy" /><span>Cima · floating screen, cognac leather</span>
            </button>
            <button className="shot" onClick={() => setShot(['gt_cabin', 'Vento GT, cockpit'])} aria-label="Open photo: Vento GT cockpit">
              <img src="./img/gt_cabin.jpg" alt="" loading="lazy" /><span>GT · bucket seats, carbon, red ambient light</span>
            </button>
          </div>
        </section>

        <section className="process" id="process">
          <header className="section-head">
            <p className="eyebrow">Process</p>
            <h2>How I built it</h2>
            <p className="section-lede">From reference photos to a car you can open in the browser.</p>
          </header>
          <ol className="steps">
            {PROCESS.map((p, i) => (
              <li key={p.step}>
                <span className="step-no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.step}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
          <div className="stats">
            <div><b>2 300+</b><span>lines of Python in the car generator</span></div>
            <div><b>3</b><span>cars from the same generator</span></div>
            <div><b>{(PAINTS.length * FINISHES.length * WHEELS.length * RIM_FINISHES.length * CALIPERS.length).toLocaleString('en-US')}</b><span>exterior combinations per car</span></div>
            <div><b>~3 MB</b><span>per car as a glTF file</span></div>
          </div>
        </section>

        <section className="configure" id="configure">
          <header className="section-head">
            <p className="eyebrow">Configurator</p>
            <h2>Build your Vento</h2>
            <p className="section-lede">Real-time 3D in your browser. Choose the paint, finish, wheels and calipers, then switch to the interior.</p>
          </header>
          <Configurator modelId={modelId} onModel={setModelId} />
        </section>
      </main>

      <footer className="foot">
        <div>
          <span className="wordmark">VENTO</span>
          <p>Designed and built by Artem Gusev, 2026.</p>
        </div>
        <p className="foot-note">Vento is a fictional brand and a personal design project. Every image on this site is a render of my own 3D models.</p>
      </footer>

      <Lightbox shot={shot} onClose={() => setShot(null)} />
    </>
  )
}
