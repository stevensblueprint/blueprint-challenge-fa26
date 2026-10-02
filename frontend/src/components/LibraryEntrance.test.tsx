import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LibraryEntrance from './LibraryEntrance'
import { createLibraryScene } from '../scene/libraryScene'

jest.mock('../scene/libraryScene', () => ({ createLibraryScene: jest.fn() }))

const dispose = jest.fn()
const cancel = jest.fn()
const hover = jest.fn()
const reduceMotion = jest.fn()
const reveal = jest.fn()
const complete = jest.fn()
const originalWebGL = globalThis.WebGL2RenderingContext

beforeEach(() => {
  jest.clearAllMocks()
  Object.defineProperty(globalThis, 'WebGL2RenderingContext', { value: function WebGL2() {}, configurable: true, writable: true })
  jest.mocked(createLibraryScene).mockImplementation((_host, options) => ({
    approach: () => { options.onPhase('shelf'); options.onBookBounds({ x: 100, y: 100, width: 80, height: 120 }) },
    open: (_portal, onReveal, onComplete) => { options.onPhase('opening'); onReveal(); onComplete() },
    hover, reduceMotion, dispose,
    cancel: () => { cancel(); options.onPhase('room') },
  }))
})
afterEach(() => { globalThis.WebGL2RenderingContext = originalWebGL })

test('requires approaching the shelf before selecting the catalog book', async () => {
  const user = userEvent.setup()
  const view = render(<LibraryEntrance onReveal={reveal} onComplete={complete} transitioning={false} />)
  const approach = screen.getByRole('button', { name: 'Approach bookshelf' })
  await waitFor(() => expect(approach).toBeEnabled())
  expect(screen.queryByRole('button', { name: 'Open catalog book' })).not.toBeInTheDocument()
  await user.click(approach)
  const book = screen.getByRole('button', { name: 'Open catalog book' })
  expect(book).toHaveFocus()
  expect(reveal).not.toHaveBeenCalled()
  await user.keyboard('{Enter}')
  expect(reveal).toHaveBeenCalledTimes(1)
  expect(complete).toHaveBeenCalledTimes(1)
  view.unmount()
  expect(dispose).toHaveBeenCalledTimes(1)
})

test('Escape returns from the selected shelf without entering the catalog', async () => {
  const user = userEvent.setup()
  render(<LibraryEntrance onReveal={reveal} onComplete={complete} transitioning={false} />)
  const approach = screen.getByRole('button', { name: 'Approach bookshelf' })
  await waitFor(() => expect(approach).toBeEnabled())
  await user.click(approach)
  await user.keyboard('{Escape}')
  expect(cancel).toHaveBeenCalledTimes(1)
  expect(approach).toHaveFocus()
  expect(reveal).not.toHaveBeenCalled()
  expect(screen.queryByRole('button', { name: 'Open catalog book' })).not.toBeInTheDocument()
})

test('a renderer failure leaves the direct catalog route available', async () => {
  jest.mocked(createLibraryScene).mockImplementation(() => { throw new Error('WebGL unavailable') })
  render(<LibraryEntrance onReveal={reveal} onComplete={complete} transitioning={false} />)
  expect(await screen.findByText('The 3D room is unavailable on this device.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Open catalog' })).toHaveAttribute('href', '#/books')
  fireEvent.wheel(screen.getByRole('main'), { deltaY: 100 })
  expect(reveal).not.toHaveBeenCalled()
})
