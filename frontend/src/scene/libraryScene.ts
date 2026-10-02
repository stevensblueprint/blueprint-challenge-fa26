import * as THREE from 'three'
import { gsap } from 'gsap'

export type RoomPhase = 'room' | 'approaching' | 'shelf' | 'opening'
export type RoomController = {
  approach: () => void
  open: (portal: HTMLDivElement, reveal: () => void, complete: () => void) => void
  hover: (active: boolean) => void
  cancel: () => void
  reduceMotion: (reduced: boolean) => void
  dispose: () => void
}
type Options = {
  reduced: boolean
  onPhase: (phase: RoomPhase) => void
  onBookBounds: (bounds: { x: number; y: number; width: number; height: number }) => void
  onFailure: () => void
}
type RGB = [number, number, number]
type Lamp = { at: THREE.Vector3; color: RGB; reach: number; alcove: boolean }

function seeded(seed: number) {
  let value = seed * 9973 + 17
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296 }
}

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, random: () => number) => void, seed = 1) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  draw(canvas.getContext('2d')!, seeded(seed))
  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = texture.minFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const pick = (palette: string[], random: () => number) => palette[Math.floor(random() * palette.length)]

// 16px faces laid out like block-game planks, bricks and logs.
function planks(palette: string[], seam: string, seed: number) {
  return canvasTexture(16, (ctx, random) => {
    for (let plank = 0; plank < 4; plank++) {
      const top = plank * 4
      for (let y = top; y < top + 3; y++) for (let x = 0; x < 16;) {
        const run = 2 + Math.floor(random() * 4)
        ctx.fillStyle = pick(palette, random); ctx.fillRect(x, y, run, 1); x += run
      }
      ctx.fillStyle = seam; ctx.fillRect(0, top + 3, 16, 1)
      ctx.fillRect((plank % 2 ? 4 : 11) + Math.floor(random() * 2), top, 1, 3)
    }
  }, seed)
}
function logSide(palette: string[], seed: number) {
  return canvasTexture(16, (ctx, random) => {
    for (let x = 0; x < 16; x++) for (let y = 0; y < 16;) {
      const run = 2 + Math.floor(random() * 5)
      ctx.fillStyle = pick(palette, random); ctx.fillRect(x, y, 1, run); y += run
    }
  }, seed)
}
function bricks(palette: string[], mortar: string, seed: number) {
  return canvasTexture(16, (ctx, random) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { ctx.fillStyle = pick(palette, random); ctx.fillRect(x, y, 1, 1) }
    ctx.fillStyle = mortar
    ctx.fillRect(0, 7, 16, 1); ctx.fillRect(0, 15, 16, 1); ctx.fillRect(3, 0, 1, 7); ctx.fillRect(11, 8, 1, 7)
  }, seed)
}
function noise(palette: string[], seed: number, hole?: string) {
  return canvasTexture(16, (ctx, random) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      ctx.fillStyle = hole && random() < .1 ? hole : pick(palette, random); ctx.fillRect(x, y, 1, 1)
    }
  }, seed)
}
function spine(base: string, seed: number) {
  const color = new THREE.Color(base)
  const dark = '#' + color.clone().multiplyScalar(.72).getHexString()
  const light = '#' + color.clone().lerp(new THREE.Color('#ffffff'), .16).getHexString()
  return canvasTexture(16, (ctx, random) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      ctx.fillStyle = random() < .2 ? dark : random() < .12 ? light : base; ctx.fillRect(x, y, 1, 1)
    }
    ctx.fillStyle = '#d6b46a'; ctx.fillRect(0, 2, 16, 1); ctx.fillRect(0, 13, 16, 1)
    ctx.fillStyle = dark; ctx.fillRect(0, 0, 16, 1); ctx.fillRect(0, 15, 16, 1)
    ctx.fillStyle = '#e9d6a6'; ctx.fillRect(6, 6, 4, 3)
  }, seed)
}

function coverTexture() {
  return canvasTexture(64, (ctx, random) => {
    ctx.fillStyle = '#3b4d35'; ctx.fillRect(0, 0, 64, 64)
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) if (random() < .22) {
      ctx.fillStyle = random() < .5 ? '#33442e' : '#455a3e'; ctx.fillRect(x, y, 1, 1)
    }
    ctx.fillStyle = '#c9a65f'
    ctx.fillRect(5, 5, 54, 1); ctx.fillRect(5, 58, 54, 1); ctx.fillRect(5, 5, 1, 54); ctx.fillRect(58, 5, 1, 54)
    ctx.fillStyle = '#a8894c'
    ctx.fillRect(8, 8, 48, 1); ctx.fillRect(8, 55, 48, 1); ctx.fillRect(8, 8, 1, 48); ctx.fillRect(55, 8, 1, 48)
    ctx.fillStyle = '#e0c27e'
    ctx.fillRect(21, 23, 10, 14); ctx.fillRect(33, 23, 10, 14); ctx.fillRect(31, 24, 2, 13)
    ctx.fillStyle = '#3b4d35'
    for (const y of [26, 29, 32]) { ctx.fillRect(23, y, 6, 1); ctx.fillRect(35, y, 6, 1) }
    ctx.fillStyle = '#c9a65f'; ctx.fillRect(26, 44, 12, 1); ctx.fillRect(29, 47, 6, 1)
  }, 4)
}

function haloTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,200,120,.85)')
  gradient.addColorStop(.3, 'rgba(255,165,80,.28)')
  gradient.addColorStop(1, 'rgba(255,150,60,0)')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Block-game face shading: tops brightest, sides dimmer, undersides darkest.
function shadedBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const colors: number[] = []
  for (const shade of [.66, .66, 1, .45, .82, .82]) {
    const value = Math.pow(shade, 2.2)
    for (let i = 0; i < 4; i++) colors.push(value, value, value)
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  return geometry
}

const WARM: RGB = [1, .7, .38]
const COOL: RGB = [.42, .55, .8]

export function createLibraryScene(host: HTMLDivElement, options: Options): RoomController {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0c0907')
  scene.fog = new THREE.Fog('#0c0907', 16, 32)
  const camera = new THREE.PerspectiveCamera(65, 1, .035, 65)
  const look = new THREE.Vector3(0, 3, -5)
  const geometry = shadedBox()
  const owned: { dispose: () => void }[] = []
  const batches = new Map<THREE.Material, { matrix: THREE.Matrix4; at: THREE.Vector3 }[]>()
  const quaternion = new THREE.Quaternion()
  const material = (source: THREE.Texture | string) => {
    const mat = typeof source === 'string'
      ? new THREE.MeshBasicMaterial({ color: source, vertexColors: true })
      : new THREE.MeshBasicMaterial({ map: source, vertexColors: true })
    if (typeof source !== 'string') owned.push(source)
    owned.push(mat); return mat
  }
  const oak = material(planks(['#b48f58', '#a8834e', '#9c7846', '#bd9861'], '#6a5030', 1))
  const lightOak = material(planks(['#c7a46c', '#bb9761', '#d1ae75'], '#7c6038', 5))
  const darkOak = material(planks(['#5a3b22', '#4f331d', '#64432a'], '#2f1e10', 3))
  const spruce = material(planks(['#7a5634', '#6e4c2d', '#835d39'], '#45301b', 9))
  const log = material(logSide(['#5b4128', '#4c3520', '#664a2e', '#3f2c1a'], 2))
  const stone = material(bricks(['#8a8a86', '#7d7d79', '#929290', '#73736f'], '#4e4e4b', 6))
  const backing = material(planks(['#3a2716', '#33220f', '#402c19'], '#1f150b', 7))
  const iron = material(noise(['#3b3d3c', '#333534', '#454746'], 8))
  const leaves = [material(noise(['#3f6a2a', '#4b7a31', '#36602a'], 1, '#1d3214')), material(noise(['#56823a', '#4a7432', '#62903f'], 3, '#24401a'))]
  const pot = material(bricks(['#9c5a3c', '#a96443', '#8d5034'], '#5f3522', 2))
  const carpet = material(noise(['#6a3a79', '#633570', '#72417f'], 5))
  const carpetEdge = material(noise(['#b8954f', '#a98745'], 6))
  const books = ['#a3402f', '#4f7a3a', '#c9a13f', '#3f7584', '#7e4d8a', '#c56a2c', '#5a6fae', '#a89c74']
    .map((color, i) => material(spine(color, i + 1)))
  const pages = material(noise(['#e3d3a8', '#d6c494', '#eadcb5'], 4))
  const glass = new THREE.MeshBasicMaterial({ color: '#7f9fc6', fog: false }); owned.push(glass)
  const glow = new THREE.MeshBasicMaterial({ color: '#ffd28a', fog: false }); owned.push(glow)
  const lamps: Lamp[] = []

  // Long pieces are split into roughly block-sized parts so textures keep their pixel scale
  // and each part can carry its own light level.
  function block(x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) {
    const split = (size: number) => size > 1.5 ? Math.round(size) : 1
    const [nx, ny, nz] = mat === glow || mat === glass ? [1, 1, 1] : [split(w), split(h), split(d)]
    const batch = batches.get(mat) || []
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) {
      const at = new THREE.Vector3(x - w / 2 + (i + .5) * w / nx, y - h / 2 + (j + .5) * h / ny, z - d / 2 + (k + .5) * d / nz)
      batch.push({ at, matrix: new THREE.Matrix4().compose(at, quaternion, new THREE.Vector3(w / nx, h / ny, d / nz)) })
    }
    batches.set(mat, batch)
  }

  for (let x = -7; x <= 7; x++) for (let z = -8; z <= 11; z++) {
    block(x, -.16, z, 1, .3, 1, (x + z * 3) % 7 === 0 ? spruce : oak)
    block(x, 8.1, z, 1, .3, 1, darkOak)
  }
  for (let x = -7; x <= 7; x++) for (let y = 0; y < 8; y++) block(x, y + .5, -8.45, 1, 1, .7, y < 1 ? stone : spruce)
  for (const side of [-1, 1]) for (let z = -8; z <= 11; z++) for (let y = 0; y < 8; y++) block(side * 7.55, y + .5, z, .7, 1, 1, y < 1 ? stone : spruce)
  for (let z = -6; z <= 11; z += 3) {
    block(0, 7.45, z, 15, .65, .6, darkOak)
    for (const side of [-1, 1]) {
      block(side * 6.6, 4, z, .7, 8, .7, log)
      block(side * 6.6, .4, z, 1, .8, 1, stone)
      block(side * 6.6, 6.85, z, 1.15, .45, 1.1, lightOak)
      block(side * 6.1, 7.1, z, 1, .5, .65, oak)
    }
  }
  for (let z = -7; z < 10; z++) {
    block(0, .015, z, 2.3, .035, 1, carpet)
    block(-1.12, .039, z, .07, .012, 1, carpetEdge)
    block(1.12, .039, z, .07, .012, 1, carpetEdge)
  }
  function shelf(cx: number, cy: number, cz: number, angle: number, seed: number, selected = false) {
    const cos = Math.cos(angle), sin = Math.sin(angle)
    const piece = (x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) => {
      block(cx + x * cos + z * sin, cy + y, cz - x * sin + z * cos, Math.abs(cos) > .5 ? w : d, h, Math.abs(cos) > .5 ? d : w, mat)
    }
    piece(0, 1.5, -.25, 2.55, 3, .22, backing)
    for (const x of [-1.3, 1.3]) piece(x, 1.5, .02, .18, 3.2, .7, oak)
    for (let row = 0; row < 4; row++) {
      piece(0, row * .95, .07, 2.7, .14, .83, oak)
      piece(0, row * .95 + .04, .47, 2.72, .05, .04, lightOak)
      if (row === 3) continue
      for (let col = 0; col < 11; col++) {
        if (selected && row === 1 && col >= 4 && col <= 7) continue
        const random = seeded(seed * 31 + row * 11 + col)
        if (random() < .07) continue
        const height = .5 + Math.floor(random() * 5) * .06
        const x = -1.14 + col * .218
        const z = .17 + Math.floor(random() * 3) * .03
        piece(x, row * .95 + .08 + height / 2, z, .18, height, .39, books[Math.floor(random() * books.length)])
      }
    }
  }
  for (const x of [-1.55, 1.55, 4.6]) shelf(x, 4.55, -7.4, 0, Math.round(x * 2 + 15))
  for (const x of [-4.6, -1.55, 1.55, 4.6]) shelf(x, .2, -7.4, 0, Math.round(x * 2 + 10), x === 1.55)
  for (const side of [-1, 1]) for (const z of [-4.3, -.9, 2.5, 5.9, 9.3]) {
    shelf(side * 7, .2, z, side === -1 ? Math.PI / 2 : -Math.PI / 2, Math.round(z + 8 + side))
    shelf(side * 7, 4.55, z, side === -1 ? Math.PI / 2 : -Math.PI / 2, Math.round(z + 14 + side))
  }
  // A tall window on the upper gallery lets in cool evening light against the lanterns.
  block(-4.6, 6.05, -7.75, 2.9, 3.3, .3, darkOak)
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) block(-5.45 + i * .85, 4.85 + j * .8, -7.58, .74, .7, .05, glass)
  lamps.push({ at: new THREE.Vector3(-4.6, 6, -7.2), color: COOL, reach: 7.5, alcove: false })

  block(0, 4.03, -6.55, 14.5, .4, 2.1, oak)
  for (const side of [-1, 1]) {
    block(side * 6.4, 4.03, 2.1, 1.9, .4, 17.5, oak)
    block(side * 5.45, 4.95, 2.1, .16, .17, 17.5, lightOak)
    for (let z = -5; z < 11; z += .65) block(side * 5.45, 4.54, z, .13, .8, .13, lightOak)
  }
  block(0, 4.95, -5.5, 11, .17, .16, lightOak)
  for (let x = -5.2; x < 5.4; x += .65) block(x, 4.54, -5.5, .13, .8, .13, lightOak)
  for (const x of [-6.25, -3.1, 0, 3.1, 6.25]) {
    block(x, 4, -6.95, .34, 8, .62, log)
    block(x, 3.7, -6.8, .66, .35, .85, lightOak)
  }
  function plant(x: number, z: number) {
    block(x, .45, z, .72, .9, .72, pot); block(x, .9, z, .84, .18, .84, pot)
    block(x, 1.55, z, .18, 1.3, .18, log)
    for (let i = 0; i < 26; i++) {
      const dx = ((i * 7) % 5 - 2) * .21, dz = ((i * 11) % 5 - 2) * .21
      block(x + dx, 1.8 + (i % 4) * .25, z + dz, .4, .42, .4, leaves[i % 2])
    }
  }
  plant(-4.8, -4.3); plant(4.8, -4.3); plant(-5.2, 3.8); plant(5.2, 3.8)

  const halo = haloTexture(); owned.push(halo)
  function lantern(x: number, z: number, bottom: number, top: number, reach: number, alcove = false) {
    for (let y = top; y > bottom + .65; y -= .22) block(x, y, z, .065, .18, .065, iron)
    block(x, bottom + .62, z, .42, .12, .42, iron)
    block(x, bottom + .3, z, .34, .46, .34, glow)
    block(x, bottom + .03, z, .46, .1, .46, iron)
    for (const dx of [-.19, .19]) for (const dz of [-.19, .19]) block(x + dx, bottom + .3, z + dz, .06, .54, .06, iron)
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .55, fog: false }))
    owned.push(sprite.material)
    sprite.position.set(x, bottom + .3, z); sprite.scale.setScalar(2.4); scene.add(sprite)
    lamps.push({ at: new THREE.Vector3(x, bottom + .3, z), color: WARM, reach, alcove })
  }
  lantern(-3.2, -2.6, 3.2, 7.2, 7.5); lantern(3.2, -2.6, 3.2, 7.2, 7.5)
  lantern(-3.6, 4.4, 4.1, 7.2, 7); lantern(3.6, 4.4, 4.1, 7.2, 7)
  lantern(.15, -5.95, 2.95, 3.8, 5.2, true)

  // Baked light levels: each block takes warm light from nearby lanterns, stepped like
  // block-game light levels, plus a dim cool ambient. Gallery alcoves are shaded.
  const inAlcove = (p: THREE.Vector3) => p.y < 3.85 && (Math.abs(p.x) > 5.35 || p.z < -5.45)
  function lightAt(p: THREE.Vector3, extra?: Lamp): RGB {
    const lift = p.y > 4.3 ? .05 : 0
    const out: RGB = [.13 + lift * .8, .14 + lift, .19 + lift * 1.4]
    for (const lamp of extra ? [...lamps, extra] : lamps) {
      const distance = p.distanceTo(lamp.at)
      let level = Math.floor(Math.max(0, 1 - distance / lamp.reach) * 15) / 15
      if (inAlcove(p) && !lamp.alcove && lamp.color === WARM) level *= .45
      const amount = Math.pow(level, 1.35) * 1.5
      for (let i = 0; i < 3; i++) out[i] += lamp.color[i] * amount
    }
    if (inAlcove(p)) { out[0] *= .8; out[1] *= .8; out[2] *= .8 }
    return out.map(value => Math.min(1.25, value)) as RGB
  }
  const tint = new THREE.Color()
  const setTint = (rgb: RGB) => tint.setRGB(Math.min(1, rgb[0]), Math.min(1, rgb[1]), Math.min(1, rgb[2]), THREE.SRGBColorSpace)

  const book = new THREE.Group()
  book.position.set(1.67, 1.63, -6.91)
  book.scale.y = .82
  const nearBook: { mesh: THREE.InstancedMesh; index: number; at: THREE.Vector3 }[] = []
  for (const [mat, items] of batches) {
    const mesh = new THREE.InstancedMesh(geometry, mat, items.length)
    items.forEach((item, i) => {
      mesh.setMatrixAt(i, item.matrix)
      mesh.setColorAt(i, mat === glow || mat === glass ? tint.set('#ffffff') : setTint(lightAt(item.at)))
      if (item.at.distanceTo(book.position) < 2.4) nearBook.push({ mesh, index: i, at: item.at })
    })
    mesh.instanceMatrix.needsUpdate = true; scene.add(mesh); owned.push(mesh)
  }

  const bookLight = lightAt(book.position)
  const coverMap = coverTexture(); owned.push(coverMap)
  const coverMat = new THREE.MeshBasicMaterial({ map: coverMap, vertexColors: true })
  const spineMat = (books[1] as THREE.MeshBasicMaterial).clone()
  const pagesMat = (pages as THREE.MeshBasicMaterial).clone()
  owned.push(coverMat, spineMat, pagesMat)
  const bookMats = [coverMat, spineMat, pagesMat]
  const part = (x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material) => {
    const mesh = new THREE.Mesh(geometry, mat); mesh.position.set(x, y, z); mesh.scale.set(w, h, d); book.add(mesh); return mesh
  }
  part(0, 0, 0, .66, .91, .19, spineMat)
  part(0, 0, .015, .59, .84, .17, pagesMat)
  const cover = part(0, 0, .112, .68, .94, .045, coverMat)
  part(-.325, 0, .01, .05, .94, .23, spineMat)
  // Thin dark outline in the style of a block selection box.
  const outlineGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(.74, 1.0, .3))
  const outline = new THREE.LineSegments(outlineGeometry, new THREE.LineBasicMaterial({ color: '#0b0805', transparent: true, opacity: 0 }))
  outline.position.z = .03; book.add(outline); owned.push(outlineGeometry, outline.material as THREE.Material)
  scene.add(book)

  const focus = { amount: 0 }
  const hoverLamp: Lamp = { at: new THREE.Vector3(1.67, 1.75, -6.2), color: WARM, reach: 2.4, alcove: true }
  function applyFocus() {
    const k = focus.amount
    setTint(bookLight.map(value => value * (1 + .35 * k)) as RGB)
    bookMats.forEach(mat => mat.color.copy(tint))
    const touched = new Set<THREE.InstancedMesh>()
    for (const item of nearBook) {
      const base = lightAt(item.at)
      if (k > 0) {
        const lit = lightAt(item.at, hoverLamp)
        for (let i = 0; i < 3; i++) base[i] += (lit[i] - base[i]) * k * .6
      }
      item.mesh.setColorAt(item.index, setTint(base)); touched.add(item.mesh)
    }
    touched.forEach(mesh => { if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true })
    ;(outline.material as THREE.LineBasicMaterial).opacity = .75 * k
  }
  applyFocus()

  const homeBookZ = book.position.z
  let phase: RoomPhase = 'room'
  let reduced = options.reduced
  let disposed = false
  let timeline: gsap.core.Timeline | undefined
  let portalElement: HTMLDivElement | undefined
  const ctx = gsap.context(() => {}, host)
  const home = () => ({ x: host.clientWidth < 650 ? .3 : -1.1, y: 2.35, z: host.clientWidth < 650 ? 8.8 : 7.8 })
  camera.position.set(home().x, home().y, home().z)
  const setPhase = (next: RoomPhase) => { phase = next; options.onPhase(next); host.dataset.phase = next }
  const bounds = () => {
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true)
    const points = [new THREE.Vector3(-.35, -.48, .15), new THREE.Vector3(.35, .48, .15)].map(p => book.localToWorld(p).project(camera))
    return { x: (points[0].x + 1) * host.clientWidth / 2, y: (1 - points[1].y) * host.clientHeight / 2,
      width: (points[1].x - points[0].x) * host.clientWidth / 2, height: (points[1].y - points[0].y) * host.clientHeight / 2 }
  }
  function render() {
    if (disposed || document.hidden) return
    camera.lookAt(look); camera.updateMatrixWorld()
    renderer.render(scene, camera)
    if (phase === 'shelf') options.onBookBounds(bounds())
  }
  function resize() {
    camera.aspect = host.clientWidth / host.clientHeight
    camera.fov = host.clientWidth < 650 ? 76 : 65
    camera.updateProjectionMatrix()
    renderer.setSize(host.clientWidth, host.clientHeight)
    render()
  }
  const observer = new ResizeObserver(resize); observer.observe(host)
  const visibility = () => { if (!document.hidden) render() }
  document.addEventListener('visibilitychange', visibility)
  const lost = (event: Event) => { event.preventDefault(); timeline?.kill(); options.onFailure() }
  renderer.domElement.addEventListener('webglcontextlost', lost)
  resize()

  ctx.add('approach', () => {
    if (phase !== 'room' || disposed) return
    setPhase('approaching')
    timeline = gsap.timeline({ defaults: { duration: reduced ? 0 : 1.8, ease: 'power2.inOut' }, onUpdate: render,
      onComplete: () => { setPhase('shelf'); render() } })
    timeline.to(camera.position, { x: 1.67, y: 1.8, z: -4.65 }, 0)
      .to(look, { x: 1.67, y: 1.63, z: -6.9 }, 0)
  })
  ctx.add('hover', (active: boolean) => {
    if (phase !== 'shelf' || disposed) return
    const duration = reduced ? 0 : .22
    gsap.to(book.position, { z: homeBookZ + (active && !reduced ? .1 : 0), duration, ease: 'power2.out', overwrite: true, onUpdate: render })
    gsap.to(focus, { amount: active ? 1 : 0, duration, ease: 'power2.out', overwrite: true, onUpdate: () => { applyFocus(); render() } })
    if (reduced) { applyFocus(); render() }
  })
  ctx.add('open', (portal: HTMLDivElement, reveal: () => void, complete: () => void) => {
    if (phase !== 'shelf' || disposed) return
    setPhase('opening'); portalElement = portal
    const portalCover = portal.querySelector<HTMLDivElement>('.portal-cover')!
    gsap.set(portalCover, { opacity: 1, backgroundImage: `url(${(coverMap.image as HTMLCanvasElement).toDataURL()})` })
    gsap.killTweensOf(book.position); gsap.killTweensOf(focus)
    if (reduced) { reveal(); complete(); return }
    let coverBounds = { x: 0, y: 0, width: 1, height: 1 }
    timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onUpdate: render, onComplete: complete })
    timeline.addLabel('take-book')
      .to(book.position, { z: homeBookZ + .45, duration: .45 }, 'take-book')
      .to(focus, { amount: 0, duration: .3, onUpdate: applyFocus }, 'take-book')
      .to(camera.position, { x: 1.67, y: 1.63, z: -5.55, duration: .9 }, 'take-book')
      .to(look, { x: 1.67, y: 1.63, z: homeBookZ + .45, duration: .9 }, 'take-book')
      .addLabel('cover')
      .call(() => {
        coverBounds = bounds()
        gsap.set(portal, { visibility: 'visible', opacity: 1, rotationY: 0, x: coverBounds.x, y: coverBounds.y,
          width: coverBounds.width, height: coverBounds.height, scale: 1, transformOrigin: '50% 50%' })
        cover.visible = false
      }, [], 'cover')
      // The cover grows until its cloth fills the screen and becomes the catalog's binding.
      .to(portal, { x: () => (host.clientWidth - coverBounds.width) / 2, y: () => (host.clientHeight - coverBounds.height) / 2,
        scale: () => Math.max(host.clientWidth / coverBounds.width, host.clientHeight / coverBounds.height) * 1.08,
        duration: .6, ease: 'power3.inOut' }, 'cover')
      .to(portalCover, { opacity: 0, duration: .25, ease: 'power1.out' }, 'cover+=.38')
      .call(() => {
        gsap.set(portal, { x: 0, y: 0, scale: 1, width: host.clientWidth, height: host.clientHeight, transformOrigin: '0% 50%', transformPerspective: 1600 })
        reveal()
      }, [], 'cover+=.64')
      // Then it swings open on its left hinge, revealing the first page.
      .to(portal, { rotationY: -96, duration: .78, ease: 'power2.in' }, 'cover+=.72')
      .to(portal.querySelector('.portal-shade'), { opacity: .7, duration: .78, ease: 'power2.in' }, 'cover+=.72')
      .set(portal, { visibility: 'hidden' })
  })
  ctx.add('cancel', () => {
    if (disposed || phase === 'room') return
    timeline?.kill(); gsap.killTweensOf(book.position); gsap.killTweensOf(focus)
    if (portalElement) gsap.set(portalElement, { visibility: 'hidden', opacity: 0, rotationY: 0 })
    book.position.z = homeBookZ; cover.visible = true; focus.amount = 0; applyFocus()
    camera.position.set(home().x, home().y, home().z); look.set(0, 3, -5); setPhase('room'); render()
  })
  return {
    approach: () => ctx.approach(), open: (portal, reveal, complete) => ctx.open(portal, reveal, complete),
    hover: active => ctx.hover(active), cancel: () => ctx.cancel(),
    reduceMotion: value => { reduced = value; if (value) { timeline?.progress(1); gsap.killTweensOf(book.position); render() } },
    dispose: () => {
      if (disposed) return
      disposed = true; timeline?.kill(); ctx.revert(); observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      renderer.domElement.removeEventListener('webglcontextlost', lost)
      geometry.dispose(); owned.forEach(item => item.dispose())
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove()
    },
  }
}
