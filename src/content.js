// Everything the site says and every option the configurator offers lives here.
// Dimensions come straight from the Blender models. `dims` is where the car sits
// in its studio side render (0–1 of image width/height), found by projecting the
// model through the render camera.

export const MODELS = [
  {
    id: 'gt',
    no: '01',
    name: 'GT',
    full: 'Vento GT',
    type: 'Sports coupé',
    tint: '#c41e2a',
    file: './models/vento_gt.glb',
    defaults: { paint: 'rosso', wheel: 'sport', rimFinish: 'black', caliper: 'giallo', leather: 'nero', accent: 'carbon', ambient: 'rosso' },
    influences: 'Porsche',
    lede:
      'A low, wide coupé drawn around its rear axle. I kept the nose short, hung a swan-neck wing from above and gave the sills an L-shaped step so the car looks planted from every angle.',
    details: ['Swan-neck rear wing', 'Blade headlights angled toward the badge', 'L-shaped side skirts and fender gills', 'Bucket seats with integrated headrests'],
    specs: { length: 4376, wheelbase: 2457, height: 1212, seats: '2 + 2' },
    hero: 'gt_profile',
    gallery: [['gt_rear', 'Rear ¾'], ['gt_detail', 'Front wheel and blade light'], ['gt_cabin', 'Cockpit']],
    side: 'gt_side',
    dims: { x0: 0.1275, x1: 0.8671, wr: 0.3042, wf: 0.72, ground: 0.665, top: 0.3004 },
    cabinCam: { position: [-1.05, 0.98, 0.1], target: [0.75, 0.66, -0.3] },
  },
  {
    id: 'arco',
    no: '02',
    name: 'Arco',
    full: 'Vento Arco',
    type: 'Hybrid luxury saloon',
    tint: '#c9bfa8',
    file: './models/vento_arco.glb',
    defaults: { paint: 'champagne', wheel: 'turbina', rimFinish: 'silver', caliper: 'nero', leather: 'avorio', accent: 'walnut', ambient: 'warm' },
    influences: 'Rolls-Royce, Mercedes-Benz',
    lede:
      'A long, quiet saloon. A tall upright grille, a falcon standing on the bonnet and a gold coachline running the length of the body. Inside, pleated lounge seats and a full-width glass dashboard.',
    details: ['Falcon bonnet mascot', 'Nineteen-slat vertical grille', 'Gold coachline along the side', 'Pleated lounge seats front and rear'],
    specs: { length: 4913, wheelbase: 2960, height: 1437, seats: '4' },
    hero: 'arco_front',
    gallery: [['arco_rear', 'Rear ¾'], ['arco_detail', 'Falcon and grille'], ['arco_cabin', 'Front cabin'], ['arco_dash', 'Glass dashboard']],
    side: 'arco_side',
    dims: { x0: 0.1068, x1: 0.8635, wr: 0.2719, wf: 0.7281, ground: 0.6916, top: 0.2975 },
    cabinCam: { position: [-1.05, 1.2, 0.12], target: [0.9, 0.86, -0.28] },
  },
  {
    id: 'cima',
    no: '03',
    name: 'Cima',
    full: 'Vento Cima',
    type: 'Electric SUV',
    tint: '#7d9a80',
    file: './models/vento_cima.glb',
    defaults: { paint: 'verde', wheel: 'turbina', rimFinish: 'graphite', caliper: 'nero', leather: 'cognac', accent: 'alu', ambient: 'ice' },
    influences: 'Range Rover, Mercedes-Benz',
    lede:
      'An upright electric SUV with a floating black roof and a lit pixel grille. The cabin sits high, with a floating centre screen, cognac leather and a three-seat rear bench.',
    details: ['Lit pixel grille', 'Floating black roof with slim chrome rails', 'Full-width tailgate light bar', 'Floating centre screen'],
    specs: { length: 4727, wheelbase: 2950, height: 1727, seats: '5' },
    hero: 'cima_front',
    gallery: [['cima_rear', 'Rear ¾'], ['cima_dash', 'Cabin and floating screen']],
    side: 'cima_side',
    dims: { x0: 0.1359, x1: 0.8333, wr: 0.2823, wf: 0.7177, ground: 0.7229, top: 0.2694 },
    cabinCam: { position: [-0.95, 1.5, 0.12], target: [0.95, 1.18, -0.28] },
  },
]

export const PAINTS = [
  { id: 'rosso', name: 'Rosso Vento', hex: '#a3101c' },
  { id: 'champagne', name: 'Champagne', hex: '#bdb6a6' },
  { id: 'verde', name: 'Verde Salvia', hex: '#5d7562' },
  { id: 'bianco', name: 'Bianco Ghiaccio', hex: '#e7e9ec' },
  { id: 'notte', name: 'Blu Notte', hex: '#101d38' },
  { id: 'grafite', name: 'Grafite', hex: '#2c2e33' },
  { id: 'oro', name: 'Oro Sabbia', hex: '#b08d55' },
  { id: 'nero', name: 'Nero Profondo', hex: '#0c0c0e' },
]

export const FINISHES = [
  { id: 'gloss', name: 'Gloss', metalness: 0.55, roughness: 0.26, clearcoat: 1 },
  { id: 'satin', name: 'Satin', metalness: 0.4, roughness: 0.45, clearcoat: 0.35 },
  { id: 'matte', name: 'Matte', metalness: 0.15, roughness: 0.72, clearcoat: 0 },
]

export const WHEELS = [
  { id: 'aero', name: 'Aero', spokes: 0, rimColor: '#c9ccd1' },
  { id: 'sport', name: 'Sport', spokes: 7, rimColor: '#1b1c1f' },
  { id: 'turbina', name: 'Turbina', spokes: 12, rimColor: '#9aa0a8' },
]

export const RIM_FINISHES = [
  { id: 'silver', name: 'Silver', hex: '#c3c7cc', metalness: 1, roughness: 0.22 },
  { id: 'graphite', name: 'Graphite', hex: '#4a4e55', metalness: 1, roughness: 0.28 },
  { id: 'black', name: 'Gloss black', hex: '#0d0d0f', metalness: 0.5, roughness: 0.22 },
  { id: 'bronze', name: 'Bronze', hex: '#7a5a3a', metalness: 1, roughness: 0.3 },
]

export const CALIPERS = [
  { id: 'nero', name: 'Black', hex: '#111113' },
  { id: 'giallo', name: 'Giallo', hex: '#d9a92b' },
  { id: 'rosso', name: 'Rosso', hex: '#b5121c' },
  { id: 'blu', name: 'Blu', hex: '#1f4fa8' },
  { id: 'argento', name: 'Silver', hex: '#b9bcc1' },
]

export const LEATHERS = [
  { id: 'nero', name: 'Nero', hex: '#1c1c1e' },
  { id: 'avorio', name: 'Avorio', hex: '#d8cbb4' },
  { id: 'cognac', name: 'Cognac', hex: '#7a4c32' },
  { id: 'rosso', name: 'Rosso', hex: '#7c1418' },
  { id: 'notte', name: 'Blu Notte', hex: '#1d2840' },
  { id: 'grigio', name: 'Grigio', hex: '#77787b' },
]

export const ACCENTS = [
  { id: 'walnut', name: 'Open-pore walnut', hex: '#5b3a22', metalness: 0, roughness: 0.35 },
  { id: 'carbon', name: 'Carbon fibre', hex: '#16181b', metalness: 0.4, roughness: 0.2 },
  { id: 'alu', name: 'Brushed aluminium', hex: '#a7abb0', metalness: 1, roughness: 0.3 },
  { id: 'piano', name: 'Piano black', hex: '#050506', metalness: 0, roughness: 0.05 },
]

export const AMBIENTS = [
  { id: 'warm', name: 'Warm white', hex: '#ffc58a' },
  { id: 'ice', name: 'Ice blue', hex: '#8cc0ff' },
  { id: 'rosso', name: 'Rosso', hex: '#ff2a1c' },
  { id: 'off', name: 'Off', hex: '#000000' },
]

// Camera positions [x, y, z] and the point the camera looks at. 'cabin' comes from the model.
export const CAMERAS = [
  { id: 'hero', name: 'Front ¾', position: [4.8, 1.55, 4.6], target: [0.1, 0.55, 0] },
  { id: 'side', name: 'Side', position: [0.1, 1.0, 7.6], target: [0.1, 0.6, 0] },
  { id: 'rear', name: 'Rear ¾', position: [-4.8, 1.7, -4.4], target: [0, 0.6, 0] },
  { id: 'cabin', name: 'Cabin' },
  { id: 'top', name: 'Top', position: [0.01, 7.4, 0], target: [0, 0, 0] },
]

export const PROCESS = [
  {
    step: 'Reference',
    text: 'I started from four brands I admire: Porsche, Rolls-Royce, Mercedes-Benz and Range Rover. I studied their proportions first and left the details for later.',
  },
  {
    step: 'Parametric body',
    text: 'I did not sculpt the bodies by hand. I wrote a Python script for Blender that lofts each car from a few profile curves and cross-sections, so one number can reshape the whole car.',
  },
  {
    step: 'Details and cabin',
    text: 'Lights, grilles, mirrors, badges, wheels and the interiors are generated by the same script, then ray-cast onto the body so every part sits exactly on the surface.',
  },
  {
    step: 'Rendering',
    text: 'Each car was lit with real outdoor HDR environments and rendered in Cycles, so the photos on this site come straight out of Blender.',
  },
  {
    step: 'Configurator',
    text: 'The cars are exported as glTF with named parts. The website recolours, swaps and opens those parts live with React Three Fiber.',
  },
]
