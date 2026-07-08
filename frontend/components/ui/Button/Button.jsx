'use client';

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  type = 'button',
}) {
  const isDisabled = disabled || loading;

  const baseClasses =
    'font-ui rounded-full transition-colors duration-200 inline-flex items-center justify-center cursor-pointer';

  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-5 py-2';

  const variantClasses = {
    primary: `bg-primary-600 text-white hover:bg-primary-400 ${
      isDisabled ? 'opacity-50' : ''
    }`,
    ghost: `bg-transparent border border-neutral-200 text-neutral-900 hover:bg-neutral-50 ${
      isDisabled ? 'opacity-50' : ''
    }`,
    danger: `bg-danger-600 text-white hover:bg-danger-400 ${
      isDisabled ? 'opacity-50' : ''
    }`,
  };

  const classes = `${baseClasses} ${sizeClasses} ${variantClasses[variant] || variantClasses.primary}`;

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      onClick={onClick}
    >
      {loading ? '...' : children}
    </button>
  );
}







/*
==========================================
Button Component
==========================================

Props:
- variant : "primary" | "ghost" | "danger"
  Controls the button's visual appearance.

- size : "md" | "sm"
  Controls the button's padding and font size.

- disabled : boolean
  Prevents user interaction when true.

- loading : boolean
  Disables the button and displays "..."
  while an action is in progress.

- onClick : function
  Callback executed when the button is clicked.

- children : ReactNode
  Content displayed inside the button.

- type : "button" | "submit" | "reset"
  Specifies the HTML button type.

Example Usage:

<Button onClick={handleSave}>
  Save
</Button>

<Button variant="ghost">
  Cancel
</Button>

<Button variant="danger" loading>
  Delete
</Button>
*/