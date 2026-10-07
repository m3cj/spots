import { useState } from 'react';
import { PiX } from 'react-icons/pi';

export default function ChipInput({ label = 'Tags', tags = [], onChange, suggestions = [], hint }) {
  const [input, setInput] = useState('');

  const addTag = (text) => {
    const cleaned = text.trim().replace(/^#+/, '');
    if (!cleaned) return;
    const lower = cleaned.toLowerCase();
    if (!tags.some((t) => t.toLowerCase() === lower)) {
      onChange([...tags, cleaned]);
    }
    setInput('');
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  // Filter unused suggestions
  const unusedSuggestions = suggestions
    .filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
    .slice(0, 8);

  return (
    <div className="space-y-1.5">
      <label className="text-caption font-semibold text-mithila-text">{label}</label>

      <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xs border border-mithila-border bg-mithila-card p-1.5 focus-within:ring-2 focus-within:ring-mithila-primary">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-pill bg-mithila-pill px-2.5 py-1 text-tag text-mithila-text"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              aria-label={`Remove tag ${tag}`}
              className="press ml-0.5 rounded-pill text-mithila-muted hover:text-mithila-text"
            >
              <PiX aria-hidden="true" className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={tags.length === 0 ? 'Type tag and press Enter…' : 'Add another…'}
          className="min-w-[120px] flex-1 border-none bg-transparent px-2 text-[14px] text-mithila-text placeholder:text-mithila-muted focus:outline-none"
        />
      </div>

      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-mithila-muted">Suggested:</span>
          {unusedSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="press rounded-pill bg-mithila-pill/50 px-2 py-0.5 text-[11px] text-mithila-textSecondary hover:bg-mithila-pill hover:text-mithila-text"
            >
              +{s}
            </button>
          ))}
        </div>
      )}

      {hint && <p className="text-[12px] text-mithila-muted">{hint}</p>}
    </div>
  );
}
