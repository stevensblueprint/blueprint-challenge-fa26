import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import type { RoomController, RoomPhase } from '../scene/libraryScene'
import LibraryRoom from './LibraryRoom'
import Icon from './Icon'
import './LibraryEntrance.css'

type Props = { onReveal: () => void; onComplete: () => void; transitioning: boolean }

export default function LibraryEntrance({ onReveal, onComplete, transitioning }: Props) {
  const reduced = useReducedMotion()
  const host = useRef<HTMLDivElement>(null)
  const room = useRef<HTMLElement>(null)
  const hotspot = useRef<HTMLButtonElement>(null)
  const approachButton = useRef<HTMLButtonElement>(null)
  const portal = useRef<HTMLDivElement>(null)
  const controller = useRef<RoomController | null>(null)
  const [phase, setPhase] = useState<RoomPhase>('room')
  const [availability, setAvailability] = useState<'loading' | 'ready' | 'fallback'>('loading')
  const initialReduced = useRef(!!reduced)
  const returnFocus = useRef(false)

  useEffect(() => {
    let active = true
    let instance: RoomController | undefined
    const fail = () => { if (active) { instance?.dispose(); controller.current = null; setAvailability('fallback') } }
    if (typeof WebGL2RenderingContext === 'undefined') {
      Promise.resolve().then(fail)
      return () => { active = false }
    }
    import('../scene/libraryScene').then(({ createLibraryScene }) => {
      if (!active || !host.current) return
      try {
        instance = createLibraryScene(host.current, {
          reduced: initialReduced.current,
          onPhase: next => { if (active) setPhase(next) },
          onBookBounds: bounds => {
            const button = hotspot.current
            if (!button) return
            button.style.left = `${bounds.x}px`; button.style.top = `${bounds.y}px`
            button.style.width = `${Math.max(44, bounds.width)}px`; button.style.height = `${Math.max(44, bounds.height)}px`
          },
          onFailure: fail,
        })
        controller.current = instance; setAvailability('ready')
      } catch { fail() }
    }).catch(fail)
    return () => { active = false; instance?.dispose(); controller.current = null }
  }, [])

  useEffect(() => { controller.current?.reduceMotion(!!reduced) }, [reduced, availability])
  useEffect(() => {
    if (phase === 'shelf') hotspot.current?.focus({ preventScroll: true })
    if (phase === 'approaching' || phase === 'opening') room.current?.focus({ preventScroll: true })
    if (phase === 'room' && returnFocus.current) { approachButton.current?.focus({ preventScroll: true }); returnFocus.current = false }
  }, [phase])

  function cancel() {
    if (transitioning) return
    returnFocus.current = true
    controller.current?.cancel()
  }

  return <main ref={room} tabIndex={-1} className={`library-entrance${transitioning ? ' library-handoff' : ''}`} id="reading-room"
    aria-label="Library reading room" data-phase={phase} data-renderer={availability}
    onKeyDown={event => { if (event.key === 'Escape') cancel() }}
    onWheel={event => { if (event.deltaY > 12 && phase === 'room') controller.current?.approach() }}>
    <div ref={host} className="voxel-room" aria-hidden="true" />
    {availability === 'fallback' && <div className="library-fallback" aria-hidden="true"><LibraryRoom /></div>}
    <div className="room-navigation" inert={transitioning}>
      <a href="#/" className="room-wordmark">LibraryConnect</a>
      <a href="#/books" className="room-skip">Skip to catalog</a>
    </div>
    <h1 className="visually-hidden">The library reading room</h1>
    <button ref={hotspot} className="catalog-book-hotspot" aria-label="Open catalog book"
      hidden={phase !== 'shelf' || availability !== 'ready'}
      onPointerEnter={() => controller.current?.hover(true)} onPointerLeave={() => controller.current?.hover(false)}
      onFocus={() => controller.current?.hover(true)} onBlur={() => controller.current?.hover(false)}
      onClick={() => { if (portal.current) controller.current?.open(portal.current, onReveal, onComplete) }} />
    <div className="room-guidance" inert={transitioning}>
      {availability === 'loading' && <p role="status">Lighting the lanterns…</p>}
      {availability === 'fallback' ? <>
        <p>The 3D room is unavailable on this device.</p>
        <a className="room-action" href="#/books">Open catalog <Icon name="arrow" size={15} /></a>
      </> : <>
        <p className="room-status" role="status">{phase === 'room' ? 'The catalog is the green volume on the far shelf.' : phase === 'approaching' ? 'Walking to the shelf…' : phase === 'shelf' ? 'Take down the green volume.' : 'Opening the catalog…'}</p>
        <button ref={approachButton} className="room-action" hidden={phase !== 'room'} disabled={availability !== 'ready'} onClick={() => controller.current?.approach()}>
          Approach bookshelf
        </button>
        <button className="room-back" hidden={phase === 'room' || transitioning} onClick={cancel}><Icon name="back" size={14} />Back to room <kbd>Esc</kbd></button>
      </>}
    </div>
    <div ref={portal} className="book-portal" aria-hidden="true"><div className="portal-cover" /><div className="portal-shade" /></div>
  </main>
}
