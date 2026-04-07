import { forwardRef, useState } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  type = 'text',
  required = false,
  disabled = false,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  
  const inputClasses = [
    'input-wrapper',
    icon && `has-icon-${iconPosition}`,
    focused && 'focused',
    error && 'has-error',
    disabled && 'disabled',
    fullWidth && 'full-width',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={inputClasses}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className="input-container">
        {icon && iconPosition === 'left' && (
          <span className="input-icon input-icon-left">{icon}</span>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className="input-field"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="input-icon input-icon-right">{icon}</span>
        )}
      </div>
      {(error || helperText) && (
        <span className={`input-message ${error ? 'error' : 'helper'}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea variant
export const Textarea = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  
  const inputClasses = [
    'input-wrapper',
    focused && 'focused',
    error && 'has-error',
    disabled && 'disabled',
    fullWidth && 'full-width',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={inputClasses}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        disabled={disabled}
        rows={rows}
        className="input-field textarea"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {(error || helperText) && (
        <span className={`input-message ${error ? 'error' : 'helper'}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Select variant
export const Select = forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Seleziona...',
  required = false,
  disabled = false,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  
  const inputClasses = [
    'input-wrapper',
    focused && 'focused',
    error && 'has-error',
    disabled && 'disabled',
    fullWidth && 'full-width',
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={inputClasses}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <select
        ref={ref}
        disabled={disabled}
        className="input-field select"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <span className={`input-message ${error ? 'error' : 'helper'}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Input;
