// Loads a Vento car exported from Blender and hooks its parts up by NAME:
//   material "Paint"                          → body colour and finish
//   material "Glass"                          → tinted see-through glass
//   materials "*_Leather", "*_Leather2"       → seat and door leather
//   material  "*_Accent"                      → interior trim (wood, carbon, aluminium)
//   material  "*_Ambient"                     → ambient light strips
//   material  "*_Caliper"                     → brake calipers
//   objects   "Rim_<id>…"                     → only the chosen wheel design is shown
//   objects   "Door_L/R/RearL/RearR"          → swing open (origin = hinge)
// Blender adds ".001" style suffixes to duplicate names, so those are ignored.
import { Component, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { suspend } from 'suspend-react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as THREE from 'three'

// Models load as .glb. Hosts that cannot serve .glb get the same bytes as a base64
// string inside a .json file (build with VITE_MODEL_EXT=.json).
const EXT = import.meta.env.VITE_MODEL_EXT || '.glb'
async function loadCar(file) {
  const url = file.replace(/\.glb$/, EXT)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`)
  let buf
  if (url.endsWith('.json')) {
    const bin = atob(await res.json())
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    buf = bytes.buffer
  } else {
    buf = await res.arrayBuffer()
  }
  return new GLTFLoader().parseAsync(buf, '')
}

const clean = (name) => name.replace(/\.\d{3}$/, '').replace(/_\d+$/, '')
const role = (matName) => {
  const n = matName.replace(/\.\d{3}$/, '')
  if (n === 'Paint') return 'paint'
  if (n === 'Glass') return 'glass'
  if (/_Leather2$/.test(n)) return 'leather2'
  if (/_Leather$/.test(n)) return 'leather'
  if (/_Accent$/.test(n)) return 'accent'
  if (/_Ambient$/.test(n)) return 'ambient'
  if (/_Caliper$/.test(n)) return 'caliper'
  if (/^Rim(Silver|Graphite|Black)$/.test(n)) return 'rim'
  if (/^(LightWhite|PixelLight|LightRed|Indicator)$/.test(n)) return 'lamp'
  return null
}

export default function GlbCar({ file, wheel, doorsOpen, onToggleDoors, mats, lightsOn }) {
  const gltf = suspend(loadCar, [file])

  // Every mount gets its own copy of the scene graph (geometry is shared), so switching
  // models back and forth never re-uses an object React has already detached.
  const { root, doors, rims, lamps } = useMemo(() => {
    const root = gltf.scene.clone(true)
    const doors = [], rims = [], lamps = []
    root.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true
        const swap = (m) => {
          const r = m && role(m.name)
          if (r === 'lamp') {
            const c = m.clone(); c.userData.base = m.emissiveIntensity ?? 1; lamps.push(c); return c
          }
          if (r === 'rim' && clean(o.name).startsWith('Rim_')) return mats.rim
          return r && mats[r] ? mats[r] : m
        }
        o.material = Array.isArray(o.material) ? o.material.map(swap) : swap(o.material)
      }
      const n = clean(o.name)
      if (/^Door_(L|R|RearL|RearR)$/.test(n)) doors.push({ obj: o, rear: n.includes('Rear'), side: Math.sign(o.position.z) || 1 })
      if (n.startsWith('Rim_')) rims.push(o)
    })
    return { root, doors, rims, lamps }
  }, [gltf, mats])

  useEffect(() => {
    rims.forEach((r) => (r.visible = clean(r.name).startsWith(`Rim_${wheel.id}`)))
  }, [rims, wheel])

  useEffect(() => {
    lamps.forEach((m) => { m.emissiveIntensity = lightsOn ? m.userData.base : 0.02 })
  }, [lamps, lightsOn])

  useFrame((_, dt) => {
    doors.forEach(({ obj, side, rear }) => {
      const target = doorsOpen ? side * (rear ? 0.95 : 1.1) : 0
      obj.rotation.y = THREE.MathUtils.damp(obj.rotation.y, target, 5, dt)
    })
  })

  return <primitive object={root} dispose={null} onClick={(e) => { e.stopPropagation(); onToggleDoors() }} />
}

// If a model file is missing, show the placeholder instead of a blank canvas.
export class ModelBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidUpdate(prev) { if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false }) }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}
