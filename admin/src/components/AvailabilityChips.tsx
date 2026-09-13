const COMPACT_LIMIT = 3;

interface AvailabilityChipsProps {
  availability: string[];
  /** Shows at most three chips plus a "+N more" chip. */
  compact?: boolean;
}

export default function AvailabilityChips({ availability, compact }: AvailabilityChipsProps) {
  if (availability.length === 0) {
    return <span className="chips-empty">Not specified</span>;
  }

  const visible = compact ? availability.slice(0, COMPACT_LIMIT) : availability;
  const hidden = availability.length - visible.length;

  return (
    <div className="chips">
      {visible.map((slot) => (
        <span key={slot} className="chip">
          {slot}
        </span>
      ))}
      {hidden > 0 && <span className="chip chip-more">+{hidden} more</span>}
    </div>
  );
}
