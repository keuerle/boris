import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFaceLaugh } from '@fortawesome/free-regular-svg-icons';

export function Header() {
  return (
    <header className="">
      <div className="flex items-center px-4 py-2">
        {/* Font Awesome icon */}
        <FontAwesomeIcon 
          icon={faFaceLaugh} 
          className="text-2xl text-foreground mr-1" 
        />
        <h1 className="text-xl font-semibold">Boris</h1>
      </div>
    </header>
  );
}
