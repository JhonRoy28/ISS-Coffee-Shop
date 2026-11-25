import { useEffect, useRef, useState } from 'react';
import { Ellipsis } from 'lucide-react';

export default function RowActions({ itemName, onEdit, onDelete, canDelete = true }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const choose = (handler) => () => {
    setOpen(false);
    handler?.(triggerRef.current);
  };

  return (
    <div className="row-actions" ref={ref}>
      <button
        type="button"
        className="icon-button"
        ref={triggerRef}
        aria-label={`Actions for ${itemName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Ellipsis size={18} aria-hidden="true" />
      </button>
      {open && (
        <div className="menu" role="menu">
          <button type="button" role="menuitem" onClick={choose(onEdit)}>Edit</button>
          {canDelete && (
            <button type="button" role="menuitem" className="menu__danger" onClick={choose(onDelete)}>Delete</button>
          )}
        </div>
      )}
    </div>
  );
}
