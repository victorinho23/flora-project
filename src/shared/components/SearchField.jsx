// src/shared/components/SearchField.jsx

import { forwardRef } from "react";
import { Search, X, LoaderCircle } from "lucide-react";
import clsx from "clsx";

const baseStyles =
  "search flex items-center rounded-xl px-3 transition-all border";

const sizeStyles = {
  sm: "h-9 text-sm",
  md: "h-11 text-sm",
  lg: "h-12 text-base",
};

const variantStyles = {
  // ===== Ya existentes, sin tocar =====
  filled:
    "bg-neutral-100 border-blue-500 hover:border-blue-700 focus-within:bg-white",
  outlined: "bg-transparent border-green-500 hover:border-green-600",
  white: "bg-transparent border-white hover:border-white text-white",

  // ===== CLARAS (4-13) =====
  fourth: "bg-bg-p50 border-bd-g300 text-text-inverse",
  fifth: "bg-bg-w border-bd-g400 text-text-inverse",
  sixth: "bg-transparent border-br-p700 text-text-inverse hover:bg-bg-p50",
  seventh: "bg-br-p200 border-br-p400 text-text-inverse",
  eighth: "bg-bg-w border-br-t500 text-text-inverse focus-within:shadow-[0_0_10px_var(--color-br-t400)]/40",
  ninth: "bg-bg-w/40 backdrop-blur-md border-bd-g200 text-text-inverse",
  tenth: "bg-bg-w border-bd-g100 shadow-md text-text-inverse",
  eleventh: "bg-br-p300 border-br-p500 text-text-inverse",
  twelfth: "bg-transparent border-bd-g300 text-text-inverse",
  thirteenth: "bg-bg-w border-br-t600 text-text-inverse",

  // ===== OSCURAS (14-23) =====
  fourteenth: "bg-bg-s900 border-bd-g700 text-text-primary",
  fifteenth: "bg-transparent border-bd-w/30 text-text-primary focus-within:shadow-[0_0_12px_var(--color-br-t400)]/50",
  sixteenth: "bg-bg-g950 border-br-t500 text-text-primary focus-within:shadow-[0_0_15px_var(--color-br-t500)]/60",
  seventeenth: "bg-bg-w/10 backdrop-blur-md border-bd-w/20 text-text-primary",
  eighteenth: "bg-transparent border-br-t600 text-br-t400",
  nineteenth: "bg-bg-p100 border-bd-p300 text-text-inverse",
  twentieth: "bg-bg-g900 border-bd-g700 text-text-primary",
  twentyFirst: "bg-gradient-to-br from-bg-g950 to-bg-s800 border-bd-s600 text-text-primary",
  twentySecond: "bg-bg-g900 border-transparent text-text-primary shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5)]",
  twentyThird: "bg-bg-g950 border-br-t500/50 text-text-primary",
};

const SearchField = forwardRef(
  (
    {
      value = "",
      placeholder = "Buscar",
      onChange = () => {},
      onSubmit,
      onClear = () => {},
      size = "md",
      variant = "filled",
      fullWidth = false,
      disabled = false,
      loading = false,
      error = false,
      name = "search",
      ariaLabel = "Campo de búsqueda",
      autoComplete = "off",
      icon,
      className,
    },
    ref
  ) => {
    const SearchIcon = icon || Search;

    const handleClear = () => {
        onChange("");
        onClear();
    };

    const handlesubmit = (e) => {
        e.preventDefault();

        if(disabled || loading) return;

        onSubmit?.(value)
    };

    return (
        <form
            onSubmit={handlesubmit}
            className={clsx(
                baseStyles,
                sizeStyles[size],
                variantStyles[variant],
                fullWidth && "w-full",
                disabled && "opacity-60 pointer-events-none",
                error 
                   ?  "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                     : "focus-within:ring-2 focus-within:ring-text-primary",
                className,
            )}
        >
            {loading ? (
                <LoaderCircle className="size-4 shrink-0 animate-spin text-neutral-500" />
            ) : (
                <SearchIcon className="size-4 shrink-0 text-current" />
            )}

            <input
                ref={ref}
                type="search"
                name={name}
                value={value}
                disabled={disabled}
                placeholder={placeholder}
                aria-label={ariaLabel}
                autoComplete={autoComplete}
                onChange={(e) => onChange(e.target.value)}
                className="search__input flex-1 bg-transparent px-2 outline-none"
            />

            {!!value && !disabled &&(
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Limpiar búsqueda"
                    className="search__clear rounded-full p-1 hover:bg-neutral-200"
                >
                    <X className="size-4 text-current" />
                </button>
            )}
        </form>
    );
  }
);

SearchField.displayName = "SearchField";
export default SearchField;