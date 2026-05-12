import { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  error,
  hint,
  options = [],
  placeholder = 'Select an option',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {props.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full bg-white dark:bg-slate-800/60 border rounded-xl text-slate-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
          transition-all duration-200 text-sm px-4 py-2.5 cursor-pointer
          ${error ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
          ${className}
        `}
        {...props}
      >
        <option value="" className="bg-slate-100 dark:bg-slate-800">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-100 dark:bg-slate-800">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 dark:text-red-400">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
