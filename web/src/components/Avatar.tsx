import { useEffect, useState } from 'react';
import { resolveMediaUrl } from '../api/client';

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
  /** Fades the avatar — used for deactivated accounts. */
  dimmed?: boolean;
  className?: string;
}

export function getInitials(name?: string | null): string {
  if (!name?.trim()) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/** Profile photo with an initials fallback when there is no image or it fails to load. */
export default function Avatar({ name, uri, size = 40, dimmed, className }: AvatarProps) {
  const src = resolveMediaUrl(uri);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <div
      className={`avatar${dimmed ? ' dimmed' : ''}${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) }}
      aria-hidden="true"
    >
      {src && !failed ? (
        <img src={src} alt="" onError={() => setFailed(true)} />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
