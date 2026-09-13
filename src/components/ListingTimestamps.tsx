import { useEffect, useState } from 'react';

const MAX_UPDATE_AGE_MS = 60 * 24 * 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

interface ListingTimestampsProps {
  updatedAt?: string | null;
  createdAt?: string | null;
}

const ListingTimestamps = ({ updatedAt, createdAt }: ListingTimestampsProps) => {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Check at visit time so a cached SSG page cannot keep expired dates visible.
    setNow(Date.now());
  }, [updatedAt]);

  const updatedTime = updatedAt ? Date.parse(updatedAt) : NaN;
  if (now === null || !Number.isFinite(updatedTime)) return null;

  const updateAge = now - updatedTime;
  if (updateAge < 0 || updateAge > MAX_UPDATE_AGE_MS) return null;

  const createdTime = createdAt ? Date.parse(createdAt) : NaN;
  const showCreated = Number.isFinite(createdTime) && createdTime <= now;

  return (
    <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-normal leading-relaxed text-wareongo-slate">
      <span className="whitespace-nowrap">
        Updated at: <time dateTime={updatedAt}>{dateFormatter.format(updatedTime)}</time>
      </span>
      {showCreated && (
        <span className="whitespace-nowrap">
          Created at: <time dateTime={createdAt}>{dateFormatter.format(createdTime)}</time>
        </span>
      )}
    </p>
  );
};

export default ListingTimestamps;
