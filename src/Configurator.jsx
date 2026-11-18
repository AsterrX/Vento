import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, ContactShadows, Html } from '@react-three/drei'
import * as THREE from 'three'
import { PAINTS, FINISHES, WHEELS, RIM_FINISHES, CALIPERS, LEATHERS, ACCENTS, AMBIENTS, CAMERAS, MODELS } from './content'
import PlaceholderCar from './PlaceholderCar'
import GlbCar, { ModelBoundary } from './GlbCar'

const byId = (list, id) => list.find((x) => x.id === id) || list[0]

// Flies the camera to a preset, then hands control back to the user.
function CameraRig({ preset, controlsRef }) {
  const { camera } = useThree()
  const flying = useRef(false)
  const last = useRef(null)
  const goalPos = useMemo(() => new THREE.Vector3(...preset.position), [preset])
  const goalTarget = useMemo(() => new THREE.Vector3(...preset.target), [preset])
  if (last.current !== preset) { last.current = preset; flying.current = true }
  useFrame((_, dt) => {
    const controls = controlsRef.current
    if (!flying.current || !controls) return
    const k = 1 - Math.exp(-3.5 * dt)
    camera.position.lerp(goalPos, k)
    controls.target.lerp(goalTarget, k)
    controls.update()
    if (camera.position.distanceTo(goalPos) < 0.01) flying.current = false
  })
  return null
}

// Narrow screens get a wider lens so the whole car fits.
function Lens({ cabin }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = size.width / size.height
    camera.fov = cabin ? (aspect < 1.1 ? 78 : 62) : aspect < 1.1 ? 46 : aspect < 1.5 ? 38 : 32
    camera.near = 0.05
    camera.updateProjectionMatrix()
  }, [camera, size, cabin])
  return null
}

function Loader() {
  return <Html center className="cfg-loader">Loading the car…</Html>
}

// Studio lighting from light panels made in code; no downloaded HDRI.
function Studio() {
  return (
    <Environment resolution={512}>
      <Lightformer form="rect" intensity={4} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
      <Lightformer form="rect" intensity={2} position={[-5, 1.5, -1]} rotation-y={Math.PI / 2} scale={[20, 0.6, 1]} />
      <Lightformer form="rect" intensity={2} position={[5, 1.5, 1]} rotation-y={-Math.PI / 2} scale={[20, 0.6, 1]} />
      <Lightformer form="ring" intensity={1.5} position={[0, 2, 8]} scale={3} />
      <Lightformer form="rect" intensity={0.6} color="#9fb4ff" position={[0, 1, -8]} scale={[10, 2, 1]} />
    </Environment>
  )
}

// Only start WebGL (and download a 3 MB model) once the section is close to the screen.
function useNearScreen(ref) {
  const [near, setNear] = useState(false)
  useEffect(() => {
    if (!ref.current || near) return
    if (!('IntersectionObserver' in window)) { setNear(true); return }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '600px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [ref, near])
  return near
}

function Swatches({ list, value, onPick, label }) {
  return (
    <div className="cfg-swatches" role="radiogroup" aria-label={label}>
      {list.map((p) => (
        <button key={p.id} title={p.name} aria-label={p.name} role="radio" aria-checked={p.id === value.id}
          className={`swatch ${p.id === value.id ? 'on' : ''}`} style={{ '--c': p.hex }} onClick={() => onPick(p)} />
      ))}
    </div>
  )
}

function Chips({ list, value, onPick, label }) {
  return (
    <div className="cfg-chips" role="radiogroup" aria-label={label}>
      {list.map((w) => (
        <button key={w.id} role="radio" aria-checked={w.id === value.id} className={w.id === value.id ? 'on' : ''} onClick={() => onPick(w)}>
          {w.name}
        </button>
      ))}
    </div>
  )
}

export default function Configurator({ modelId, onModel }) {
  const model = byId(MODELS, modelId)
  const d = model.defaults
  const [paint, setPaint] = useState(byId(PAINTS, d.paint))
  const [finish, setFinish] = useState(FINISHES[0])
  const [wheel, setWheel] = useState(byId(WHEELS, d.wheel))
  const [rimFinish, setRimFinish] = useState(byId(RIM_FINISHES, d.rimFinish))
  const [caliper, setCaliper] = useState(byId(CALIPERS, d.caliper))
  const [leather, setLeather] = useState(byId(LEATHERS, d.leather))
  const [accent, setAccent] = useState(byId(ACCENTS, d.accent))
  const [ambient, setAmbient] = useState(byId(AMBIENTS, d.ambient))
  const [lightsOn, setLightsOn] = useState(true)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [tab, setTab] = useState('exterior')
  const [camId, setCamId] = useState('hero')
  const [copied, setCopied] = useState(false)
  const controlsRef = useRef()
  const stageRef = useRef()
  const near = useNearScreen(stageRef)

  // A new model arrives with its own launch specification.
  useEffect(() => {
    const d = model.defaults
    setPaint(byId(PAINTS, d.paint)); setWheel(byId(WHEELS, d.wheel)); setRimFinish(byId(RIM_FINISHES, d.rimFinish))
    setCaliper(byId(CALIPERS, d.caliper)); setLeather(byId(LEATHERS, d.leather)); setAccent(byId(ACCENTS, d.accent))
    setAmbient(byId(AMBIENTS, d.ambient)); setFinish(FINISHES[0]); setDoorsOpen(false)
  }, [model])

  const camera = useMemo(() => {
    const c = byId(CAMERAS, camId)
    return c.id === 'cabin' ? { ...c, ...model.cabinCam } : { ...c }
  }, [camId, model])

  // One shared set of materials; options change their values in place.
  const mats = useMemo(() => ({
    paint: new THREE.MeshPhysicalMaterial({ clearcoatRoughness: 0.04 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#0d1114', roughness: 0.02, metalness: 0, transparent: true, opacity: 0.32, clearcoat: 1, depthWrite: false }),
    rim: new THREE.MeshPhysicalMaterial({ clearcoat: 0.6 }),
    caliper: new THREE.MeshPhysicalMaterial({ roughness: 0.3, clearcoat: 0.8 }),
    leather: new THREE.MeshPhysicalMaterial({ roughness: 0.55, sheen: 0.4, sheenRoughness: 0.6 }),
    leather2: new THREE.MeshPhysicalMaterial({ roughness: 0.6, sheen: 0.4, sheenRoughness: 0.6 }),
    accent: new THREE.MeshPhysicalMaterial({ clearcoat: 1, clearcoatRoughness: 0.08 }),
    ambient: new THREE.MeshStandardMaterial({ color: '#000', emissiveIntensity: 3 }),
  }), [])
  mats.paint.color.set(paint.hex); mats.paint.metalness = finish.metalness; mats.paint.roughness = finish.roughness; mats.paint.clearcoat = finish.clearcoat
  mats.rim.color.set(rimFinish.hex); mats.rim.metalness = rimFinish.metalness; mats.rim.roughness = rimFinish.roughness
  mats.caliper.color.set(caliper.hex)
  mats.leather.color.set(leather.hex); mats.leather.sheenColor.set(leather.hex)
  mats.leather2.color.set(leather.hex).multiplyScalar(0.8); mats.leather2.sheenColor.set(leather.hex)
  mats.accent.color.set(accent.hex); mats.accent.metalness = accent.metalness; mats.accent.roughness = accent.roughness
  mats.ambient.emissive.set(ambient.hex)

  const toggleDoors = () => setDoorsOpen((o) => !o)
  const pickTab = (t) => { setTab(t); setCamId(t === 'interior' ? 'cabin' : camId === 'cabin' ? 'hero' : camId) }
  const carProps = { paint: { hex: paint.hex, metalness: finish.metalness, roughness: finish.roughness }, wheel, doorsOpen, onToggleDoors: toggleDoors, mats, lightsOn, paintMat: mats.paint }

  // A short build code that describes the whole configuration.
  const code = ['VNT', model.id, paint.id, finish.id, wheel.id, rimFinish.id, caliper.id, leather.id, accent.id, ambient.id]
    .map((s) => s.slice(0, 3).toUpperCase()).join('-')
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { setCopied(false) }
  }

  return (
    <div className="cfg" style={{ '--tint': model.tint }}>
      <div className="cfg-stage" ref={stageRef}>
        <img className="cfg-poster" src={`./img/${model.hero}.jpg`} alt="" aria-hidden="true" />
        {near && (
          <Canvas shadows dpr={[1, 2]} camera={{ position: CAMERAS[0].position, fov: 32 }} gl={{ antialias: true }}>
            <color attach="background" args={['#0f1012']} />
            <fog attach="fog" args={['#0f1012', 11, 24]} />
            <Suspense fallback={<Loader />}>
              <Studio />
              <ModelBoundary resetKey={model.id} fallback={<PlaceholderCar {...carProps} />}>
                <GlbCar key={model.id} file={model.file} {...carProps} />
              </ModelBoundary>
              <ContactShadows position={[0, 0.001, 0]} opacity={0.75} scale={12} blur={2.4} far={2} resolution={512} />
              <mesh rotation-x={-Math.PI / 2} receiveShadow>
                <circleGeometry args={[12, 64]} />
                <meshStandardMaterial color="#17181b" roughness={0.85} />
              </mesh>
            </Suspense>
            <OrbitControls ref={controlsRef} makeDefault enablePan={false} enableZoom={false}
              maxPolarAngle={Math.PI / 2.05} target={CAMERAS[0].target} />
            <CameraRig preset={camera} controlsRef={controlsRef} />
            <Lens cabin={camId === 'cabin'} />
          </Canvas>
        )}
        <div className="cfg-views" role="group" aria-label="Camera view">
          {CAMERAS.map((c) => (
            <button key={c.id} className={c.id === camId ? 'on' : ''} onClick={() => { setCamId(c.id); setTab(c.id === 'cabin' ? 'interior' : tab === 'interior' ? 'exterior' : tab) }}>
              {c.name}
            </button>
          ))}
        </div>
        <p className="cfg-drag">Drag to look around · click the car to open the doors</p>
        <div className="cfg-quick">
          <button className={doorsOpen ? 'on' : ''} onClick={toggleDoors} aria-pressed={doorsOpen}>Doors</button>
          <button className={lightsOn ? 'on' : ''} onClick={() => setLightsOn((l) => !l)} aria-pressed={lightsOn}>Lights</button>
        </div>
      </div>

      <aside className="cfg-panel">
        <div className="cfg-models" role="radiogroup" aria-label="Model">
          {MODELS.map((m) => (
            <button key={m.id} role="radio" aria-checked={m.id === model.id} className={m.id === model.id ? 'on' : ''} onClick={() => onModel(m.id)} style={{ '--t': m.tint }}>
              <span className="cfg-model-name">{m.name}</span>
              <span className="cfg-model-type">{m.type}</span>
            </button>
          ))}
        </div>

        <div className="cfg-tabs" role="tablist">
          {[['exterior', 'Exterior'], ['interior', 'Interior']].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => pickTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'exterior' ? (
          <div className="cfg-groups">
            <fieldset><legend>Paint <span>{paint.name}</span></legend><Swatches list={PAINTS} value={paint} onPick={setPaint} label="Paint" /></fieldset>
            <fieldset><legend>Finish <span>{finish.name}</span></legend><Chips list={FINISHES} value={finish} onPick={setFinish} label="Finish" /></fieldset>
            <fieldset><legend>Wheels <span>{wheel.name}</span></legend><Chips list={WHEELS} value={wheel} onPick={setWheel} label="Wheel design" /></fieldset>
            <fieldset><legend>Wheel finish <span>{rimFinish.name}</span></legend><Swatches list={RIM_FINISHES} value={rimFinish} onPick={setRimFinish} label="Wheel finish" /></fieldset>
            <fieldset><legend>Brake calipers <span>{caliper.name}</span></legend><Swatches list={CALIPERS} value={caliper} onPick={setCaliper} label="Brake calipers" /></fieldset>
          </div>
        ) : (
          <div className="cfg-groups">
            <fieldset><legend>Leather <span>{leather.name}</span></legend><Swatches list={LEATHERS} value={leather} onPick={setLeather} label="Leather" /></fieldset>
            <fieldset><legend>Trim <span>{accent.name}</span></legend><Swatches list={ACCENTS} value={accent} onPick={setAccent} label="Trim" /></fieldset>
            <fieldset><legend>Ambient light <span>{ambient.name}</span></legend><Swatches list={AMBIENTS} value={ambient} onPick={setAmbient} label="Ambient light" /></fieldset>
            <p className="cfg-note">Tip: open the doors or drag to look around the cabin.</p>
          </div>
        )}

        <div className="cfg-build">
          <p className="cfg-build-title">Your {model.full}</p>
          <p className="cfg-build-line">{paint.name} {finish.id !== 'gloss' ? `(${finish.name.toLowerCase()})` : ''} · {wheel.name} wheels in {rimFinish.name.toLowerCase()} · {leather.name} leather with {accent.name.toLowerCase()}</p>
          <div className="cfg-code">
            <code>{code}</code>
            <button onClick={copyCode}>{copied ? 'Copied' : 'Copy code'}</button>
          </div>
        </div>
      </aside>
    </div>
  )
}
