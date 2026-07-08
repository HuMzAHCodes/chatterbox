'use client';

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  id,
  name,
}) {
  const inputId = id || name;

  const baseInputClasses =
    'font-ui w-full rounded-lg px-4 py-2.5 bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600';

  const errorInputClasses = error ? 'border-danger-600' : '';

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const inputClasses = `${baseInputClasses} ${errorInputClasses} ${disabledClasses}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="font-ui text-sm text-neutral-600"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
      />

      {error && (
        <span className="font-ui text-sm text-danger-600">
          {error}
        </span>
      )}
    </div>
  );
}









/*
==================================================
Input Component
==================================================

Purpose:
- A reusable input component used throughout the application.
- Provides a consistent UI for text-based form fields.

Functionality:
- Accepts all data through props from its parent component.
- Does not manage its own state or perform validation.
- Notifies the parent of user input using the onChange callback.
- Displays an optional label and validation error message.
- Supports disabled state with matching visual styling.

Dependencies:
- Does not render any custom child components.
- Does not make API requests.
- Intended to be used inside form pages such as Login,
  Register, Profile, or Settings forms.

Flow:
Parent Component
      │
      ├── passes value, error, disabled, etc.
      │
      ▼
Input Component
      │
      ├── renders the input field
      ├── applies conditional styling
      └── calls onChange whenever the user types
             │
             ▼
Parent updates its state and re-renders the Input.
*/