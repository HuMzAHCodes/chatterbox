'use client';

export default function Avatar({ src, name = '', size = 'md', isOnline = false }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative inline-flex shrink-0">
      {/* Image or initials fallback */}
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-primary-200 text-primary-900 font-badge flex items-center justify-center select-none`}
        >
          {initials || '?'}
        </div>
      )}

      {/* Online indicator */}
      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizeClasses[size]} bg-success-600 rounded-full border-2 border-white`}
        />
      )}
    </div>
  );
}





