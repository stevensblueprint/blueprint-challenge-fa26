import BookOpen from 'reicon-react/icons/BookOpen'
import BookBookmark from 'reicon-react/icons/BookBookmark'
import Search3 from 'reicon-react/icons/Search3'
import ArrowLeft from 'reicon-react/icons/ArrowLeft'
import ArrowRightUp from 'reicon-react/icons/ArrowRightUp'
import Plus from 'reicon-react/icons/Plus'
import Filter from 'reicon-react/icons/Filter'
import Layers from 'reicon-react/icons/Layers'
import CheckCircle from 'reicon-react/icons/CheckCircle'
import Danger from 'reicon-react/icons/Danger'
import Loader from 'reicon-react/icons/Loader'
import Calendar from 'reicon-react/icons/Calendar'
import User from 'reicon-react/icons/User'
import Location from 'reicon-react/icons/Location'
import CloseCircle from 'reicon-react/icons/CloseCircle'

const icons = {
  book: BookOpen, catalog: BookBookmark, search: Search3, back: ArrowLeft,
  arrow: ArrowRightUp, plus: Plus, filter: Filter, layers: Layers,
  check: CheckCircle, error: Danger, loader: Loader, calendar: Calendar,
  user: User, location: Location, close: CloseCircle,
}

type IconProps = { name: keyof typeof icons; size?: number; className?: string }

export default function Icon({ name, size = 18, className = '' }: IconProps) {
  const Symbol = icons[name]
  return <Symbol size={size} className={`icon ${className}`} aria-hidden="true" focusable="false" />
}
