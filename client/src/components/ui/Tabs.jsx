import { useRef } from 'react';

/**
 * Segmented tab control. `tabs` is `[{ value, label }]`. Pair with a panel carrying
 * `role="tabpanel" id={`${idPrefix}-panel`} aria-labelledby={`${idPrefix}-tab-${value}`}`.
 * Arrow keys / Home / End move between tabs (roving tabindex).
 */
export default function Tabs({ label, idPrefix, tabs, value, onChange, className = '' }) {
  const refs = useRef({});

  const onKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.value === value);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;

    event.preventDefault();
    onChange(tabs[next].value);
    refs.current[tabs[next].value]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={`inline-flex gap-1 rounded-pill bg-mithila-pill p-1 ${className}`}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(node) => {
              refs.current[tab.value] = node;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.value}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={`press min-h-[44px] rounded-pill px-5 text-button ${
              selected ? 'bg-mithila-card text-mithila-text shadow-sm' : 'text-mithila-muted hover:text-mithila-text'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
