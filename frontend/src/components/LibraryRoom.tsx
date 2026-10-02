const spineColors = ['#a05239', '#536751', '#c29145', '#556d70', '#795875', '#b86441', '#b7a174']

function Shelf({ x, y, width = 220, rows = 3, seed = 0 }: { x: number; y: number; width?: number; rows?: number; seed?: number }) {
  return <g transform={`translate(${x} ${y})`}>
    <rect width={width} height={rows * 84 + 18} fill="#24190f" stroke="#825a34" strokeWidth="14" />
    {Array.from({ length: rows }, (_, row) => <g key={row} transform={`translate(0 ${row * 84})`}>
      {Array.from({ length: Math.floor((width - 18) / 18) }, (_, col) => {
        const height = 44 + ((col * 13 + row * 7 + seed) % 25)
        return <g key={col} transform={`translate(${12 + col * 18} ${78 - height})`}>
          <rect width="15" height={height} fill={spineColors[(col + row * 3 + seed) % spineColors.length]} />
          <path d={`M3 0V${height}M0 9H15M0 ${height - 8}H15`} stroke="#ead2a0" strokeOpacity=".4" strokeWidth="2" />
          <rect x="6" y="18" width="4" height="17" fill="#ead2a0" opacity=".3" />
        </g>
      })}
      <rect y="79" width={width} height="9" fill="url(#room-wood)" />
      <path d={`M0 79H${width}`} stroke="#bc8950" strokeWidth="3" />
    </g>)}
  </g>
}

function Lantern({ x, y, length = 100 }: { x: number; y: number; length?: number }) {
  return <g transform={`translate(${x} ${y})`}>
    <path d={`M0 0V${length}`} stroke="#25231f" strokeWidth="6" strokeDasharray="9 4" />
    <ellipse cy={length + 36} rx="110" ry="110" fill="url(#room-glow)" />
    <path d={`M-23 ${length + 9}H23L17 ${length}H-17Z`} fill="#292720" />
    <rect x="-20" y={length + 10} width="40" height="49" fill="#ffdd8e" stroke="#322c24" strokeWidth="6" />
    <rect x="-11" y={length + 16} width="22" height="34" fill="#fff1c0" />
    <path d={`M-24 ${length + 61}H24M0 ${length + 11}V${length + 58}`} stroke="#403326" strokeWidth="6" />
  </g>
}

function Plant({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M-30 0H30L24 57H-24Z" fill="#a8593d" /><rect x="-35" y="-6" width="70" height="17" fill="#c27b53" />
    <path d="M0 0V-100M0-30L-30-67M0-48L32-92" stroke="#685335" strokeWidth="9" />
    {Array.from({ length: 23 }, (_, i) => <rect key={i} x={((i * 31) % 91) - 48} y={-140 + ((i * 23) % 99)} width={18 + i % 3 * 5} height="23" fill={['#53683b', '#778344', '#3b5635', '#8e9550'][i % 4]} />)}
    {[[-28, -89], [29, -74], [1, -122], [-10, -52]].map(([x, y]) => <path key={`${x}-${y}`} d={`M${x} ${y}h9v9h-9z`} fill="#b886a8" />)}
  </g>
}

export default function LibraryRoom() {
  return <svg className="library-room" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <pattern id="room-wood" width="130" height="36" patternUnits="userSpaceOnUse"><rect width="130" height="36" fill="#704a2b" /><path d="M0 1H130M0 35H130M20 9H83M54 24H119" stroke="#aa7743" strokeOpacity=".35" strokeWidth="3" /><path d="M0 17H47M82 14H126" stroke="#3f2d1c" strokeOpacity=".45" strokeWidth="3" /></pattern>
      <radialGradient id="room-glow"><stop stopColor="#ffc973" stopOpacity=".48" /><stop offset="1" stopColor="#ffc973" stopOpacity="0" /></radialGradient>
      <linearGradient id="room-shade" x2="0" y2="1"><stop stopColor="#100e0c" stopOpacity=".3" /><stop offset=".5" stopColor="#110e09" stopOpacity="0" /><stop offset="1" stopColor="#100c08" stopOpacity=".5" /></linearGradient>
    </defs>
    <rect width="1600" height="1000" fill="#302218" />
    <path d="M0 0H1600L1270 200H330Z" fill="url(#room-wood)" />
    <rect x="270" y="160" width="1060" height="570" fill="url(#room-wood)" />
    <path d="M0 0L330 200V720L0 1000ZM1600 0L1270 200V720L1600 1000Z" fill="#513921" />
    <path d="M0 1000L330 700H1270L1600 1000Z" fill="url(#room-wood)" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${800 + (i - 4) * 360} 1000L${800 + (i - 4) * 100} 700`} stroke="#302316" strokeWidth="5" />)}
    {[725, 766, 822, 898, 993].map(y => <path key={y} d={`M0 ${y}H1600`} stroke="#352719" strokeWidth="5" />)}
    <path d="M637 1000L748 700H858L1010 1000Z" fill="#614365" stroke="#b78d63" strokeWidth="9" />
    <path d="M665 1000L760 700M980 1000L847 700" stroke="#ad7b9b" strokeWidth="4" />
    {[350, 610, 870, 1130].map((x, i) => <Shelf key={x} x={x} y={205} width={180} rows={2} seed={i * 3} />)}
    <Shelf x={355} y={463} width={245} seed={2} />
    <Shelf x={985} y={463} width={245} seed={4} />
    <path d="M690 718V482H910V718" fill="#251c14" stroke="#a67543" strokeWidth="18" />
    <path d="M706 710V500H893V710" fill="url(#room-wood)" />
    {[738, 774, 810, 846, 882].map(x => <path key={x} d={`M${x} 500V710`} stroke="#3d2b1b" strokeWidth="3" />)}
    <rect x="802" y="600" width="8" height="24" fill="#d3ad63" />
    <rect x="695" y="439" width="211" height="32" fill="#392719" stroke="#ae8150" strokeWidth="3" />
    <text x="800" y="461" textAnchor="middle" fill="#e0c495" fontFamily="Georgia, serif" fontSize="17" letterSpacing="4">THE READING ROOM</text>
    <g transform="matrix(.85 .22 0 1 40 192)"><Shelf x={0} y={0} width={250} rows={5} seed={3} /></g>
    <g transform="matrix(.85 -.22 0 1 1350 248)"><Shelf x={0} y={0} width={250} rows={5} seed={6} /></g>
    {[310, 620, 950, 1270].map(x => <g key={x}><rect x={x} y="160" width="35" height="570" fill="url(#room-wood)" /><rect x={x - 12} y="175" width="59" height="23" fill="#9a6c3c" /><rect x={x - 10} y="703" width="55" height="24" fill="#9a6c3c" /></g>)}
    <path d="M255 397H1345V432H255Z" fill="url(#room-wood)" stroke="#a97b49" strokeWidth="4" />
    {Array.from({ length: 25 }, (_, i) => <rect key={i} x={274 + i * 44} y="376" width="12" height="35" fill="#ac804e" />)}
    <path d="M240 374H1360" stroke="#bf9057" strokeWidth="13" />
    <path d="M0 140L330 251M1600 140L1270 251M0 492L280 438M1600 492L1320 438" stroke="#9a6b3d" strokeWidth="30" />
    {[140, 1460].map(x => <g key={x}><rect x={x - 29} y="0" width="58" height="897" fill="url(#room-wood)" /><rect x={x - 43} y="162" width="86" height="33" fill="#a47543" /><rect x={x - 43} y="860" width="86" height="45" fill="#a47543" /></g>)}
    <path d="M250 0L530 185M1350 0L1070 185M650 0L730 180M950 0L870 180" stroke="#352619" strokeWidth="38" />
    <path d="M0 52H1600M205 139H1395" stroke="#94683c" strokeWidth="30" />
    <Lantern x={360} y={175} length={285} /><Lantern x={1235} y={175} length={285} />
    <Lantern x={670} y={180} length={158} /><Lantern x={930} y={180} length={158} />
    <Plant x={278} y={829} scale={1.35} /><Plant x={1336} y={829} scale={1.35} />
    <Plant x={659} y={709} scale={.72} /><Plant x={946} y={709} scale={.72} />
    <rect width="1600" height="1000" fill="url(#room-shade)" />
  </svg>
}
