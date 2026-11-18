// A stand-in car made of simple shapes, built with the SAME part names you'll use in Blender
// (Body, Door_L, Door_R, Wheel_*), so the configurator logic works now and keeps working
// when you swap in your real model.
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const WHEEL_POS = [
  ['Wheel_FL', 1.3, 0.86],
  ['Wheel_FR', 1.3, -0.86],
  ['Wheel_RL', -1.3, 0.86],
  ['Wheel_RR', -1.3, -0.86],
]

function Wheel({ position, side, wheel }) {
  const spokes = Array.from({ length: wheel.spokes })
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* tyre */}
      <mesh castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.26, 40]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {/* rim face (on the outer side) */}
      <group position={[0, side * 0.132, 0]}>
        {wheel.spokes === 0 ? (
          <mesh>
            <cylinderGeometry args={[0.28, 0.28, 0.02, 40]} />
            <meshStandardMaterial color={wheel.rimColor} metalness={0.9} roughness={0.25} />
          </mesh>
        ) : (
          <>
            <mesh>
              <torusGeometry args={[0.27, 0.025, 8, 40]} />
              <meshStandardMaterial color={wheel.rimColor} metalness={0.9} roughness={0.25} />
            </mesh>
            {spokes.map((_, i) => (
              <mesh key={i} rotation={[0, (i / wheel.spokes) * Math.PI * 2, 0]} position={[0, 0, 0]}>
                <boxGeometry args={[0.04, 0.02, 0.52]} />
                <meshStandardMaterial color={wheel.rimColor} metalness={0.9} roughness={0.25} />
              </mesh>
            ))}
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.03, 20]} />
              <meshStandardMaterial color={wheel.rimColor} metalness={0.9} roughness={0.2} />
            </mesh>
          </>
        )}
      </group>
    </group>
  )
}

// Side silhouette of the coupé, extruded across the car's width.
function makeExtruded(points, depth, bevel) {
  const shape = new THREE.Shape()
  shape.moveTo(...points[0])
  for (const pt of points.slice(1)) {
    if (pt.length === 4) shape.quadraticCurveTo(...pt)
    else shape.lineTo(...pt)
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 24,
  })
  geo.translate(0, 0, -depth / 2)
  geo.computeVertexNormals()
  return geo
}

const BODY = makeExtruded([
  [-1.95, 0.42], [1.9, 0.42], [2.1, 0.44, 2.08, 0.6], [1.98, 0.72],
  [1.2, 0.84, 0.55, 0.88], [-1.5, 0.9], [-2.04, 0.9, -2.05, 0.72], [-2.03, 0.5], [-2.02, 0.42, -1.95, 0.42],
], 1.66, 0.1)

const GLASS = makeExtruded([
  [-1.75, 0.86], [0.6, 0.86], [0.05, 1.3, -0.45, 1.31], [-0.95, 1.29], [-1.5, 1.2, -1.75, 0.86],
], 1.28, 0.08)

function Door({ name, side, open, paintMat }) {
  const pivot = useRef()
  // The pivot sits at the FRONT edge of the door, like a hinge.
  useFrame((_, dt) => {
    const targetAngle = open ? side * 1.05 : 0
    pivot.current.rotation.y = THREE.MathUtils.damp(pivot.current.rotation.y, targetAngle, 6, dt)
  })
  return (
    <group ref={pivot} name={name} position={[0.5, 0.66, side * 0.955]}>
      <RoundedBox args={[1.15, 0.36, 0.035]} radius={0.015} position={[-0.575, 0, 0]} castShadow material={paintMat} />
      {/* handle */}
      <mesh position={[-0.95, 0.1, side * 0.022]}>
        <boxGeometry args={[0.18, 0.025, 0.01]} />
        <meshStandardMaterial color="#1a1b1f" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

export default function PlaceholderCar({ wheel, doorsOpen, onToggleDoors, paintMat }) {
  return (
    <group onClick={(e) => { e.stopPropagation(); onToggleDoors() }}>
      <mesh name="Body" geometry={BODY} material={paintMat} castShadow />
      <mesh name="Glass" geometry={GLASS} castShadow>
        <meshPhysicalMaterial color="#05070b" roughness={0.03} metalness={0.4} clearcoat={1} />
      </mesh>
      {/* light bars */}
      <mesh name="Headlights" position={[2.07, 0.66, 0]}>
        <boxGeometry args={[0.04, 0.035, 1.55]} />
        <meshStandardMaterial color="#ffffff" emissive="#dfefff" emissiveIntensity={4} />
      </mesh>
      <mesh name="Taillights" position={[-2.14, 0.78, 0]}>
        <boxGeometry args={[0.04, 0.045, 1.7]} />
        <meshStandardMaterial color="#ff2030" emissive="#ff1020" emissiveIntensity={3} />
      </mesh>
      {/* dark side skirt */}
      <mesh position={[0, 0.36, 0]}>
        <boxGeometry args={[3.0, 0.1, 1.82]} />
        <meshStandardMaterial color="#121316" roughness={0.6} />
      </mesh>

      <Door name="Door_L" side={1} open={doorsOpen} paintMat={paintMat} />
      <Door name="Door_R" side={-1} open={doorsOpen} paintMat={paintMat} />

      {WHEEL_POS.map(([name, x, z]) => (
        <Wheel key={name} position={[x, 0.38, z]} side={z > 0 ? 1 : -1} wheel={wheel} />
      ))}
    </group>
  )
}
