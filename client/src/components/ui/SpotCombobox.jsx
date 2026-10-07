import { useEffect, useRef, useState } from 'react';
import { PiCaretUpDown, PiCheck, PiMagnifyingGlass, PiX } from 'react-icons/pi';
import { getAdminSpots, getAdminSpot } from '@/api/admin';

export default function SpotCombobox({ label = 'Venue Spot', value, onChange, required, hint }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const containerRef = useRef(null);

  // Load the selected spot details if value changes
  useEffect(() => {
    if (!value) {
      setSelectedSpot(null);
      return;
    }
    let active = true;
    getAdminSpot(value)
      .then((spot) => {
        if (active) setSelectedSpot(spot);
      })
      .catch(() => {
        if (active) setSelectedSpot({ id: value, name: `Spot #${value}` });
      });
    return () => {
      active = false;
    };
  }, [value]);

  // Search spots
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);

    const timer = setTimeout(() => {
      getAdminSpots({ q: query, pageSize: 20 })
        .then((res) => {
          if (active) setSpots(res.items ?? []);
        })
        .catch(() => {
          if (active) setSpots([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, query]);

  // Click outside to close
  useEffect(() => {
    const handleDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label className="text-caption font-semibold text-mithila-text">
        {label} {required && <span className="text-state-danger">*</span>}
      </label>

      {/* Trigger button */}
      <div
        onClick={() => setOpen((v) => !v)}
        className="press flex min-h-[44px] cursor-pointer items-center justify-between rounded-xs border border-mithila-border bg-mithila-card px-3 py-2 text-[14px] text-mithila-text shadow-sm hover:border-mithila-primary"
      >
        {selectedSpot ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="font-semibold text-mithila-text">{selectedSpot.name}</span>
            {(selectedSpot.area || selectedSpot.city) && (
              <span className="text-caption text-mithila-muted">
                {[selectedSpot.area, selectedSpot.city].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
        ) : (
          <span className="text-mithila-muted">Search and select a venue spot…</span>
        )}

        <div className="flex items-center gap-1.5 pl-2">
          {selectedSpot && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setSelectedSpot(null);
              }}
              className="press rounded-pill p-1 text-mithila-muted hover:text-mithila-text"
            >
              <PiX aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
          <PiCaretUpDown aria-hidden="true" className="h-4 w-4 text-mithila-muted" />
        </div>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-sticky left-0 right-0 top-full mt-1 max-h-64 overflow-hidden rounded-md border border-mithila-border bg-mithila-card shadow-lg flex flex-col">
          {/* Search bar */}
          <div className="flex items-center border-b border-mithila-border px-3 py-2">
            <PiMagnifyingGlass aria-hidden="true" className="h-4 w-4 text-mithila-muted mr-2" />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter spots by name, area, city…"
              className="w-full border-none bg-transparent text-[14px] text-mithila-text focus:outline-none"
            />
          </div>

          {/* Results list */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-1">
            {loading ? (
              <p className="p-3 text-center text-caption text-mithila-muted">Searching spots…</p>
            ) : spots.length === 0 ? (
              <p className="p-3 text-center text-caption text-mithila-muted">No spots match.</p>
            ) : (
              spots.map((spot) => {
                const isSelected = selectedSpot?.id === spot.id;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => {
                      onChange(spot.id);
                      setSelectedSpot(spot);
                      setOpen(false);
                    }}
                    className={`press flex w-full items-center justify-between rounded-xs px-3 py-2 text-left text-[14px] transition-colors ${
                      isSelected
                        ? 'bg-mithila-pill font-semibold text-mithila-primary'
                        : 'text-mithila-text hover:bg-mithila-pill/50'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{spot.name}</p>
                      <p className="text-[12px] text-mithila-muted">
                        {[spot.area, spot.city].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    {isSelected && <PiCheck aria-hidden="true" className="h-4 w-4 text-mithila-primary" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {hint && <p className="text-[12px] text-mithila-muted">{hint}</p>}
    </div>
  );
}
