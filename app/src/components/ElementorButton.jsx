import React from "react";

export function ElementorButton({
                                    children,
                                    size = "md",
                                    as = "button",
                                    href,
                                    loading = false,
                                    disabled = false,
                                    className = "",
                                    ...rest
                                }) {
    const baseClass =
        "elementor-button elementor-size-" + size + (className ? ` ${className}` : "");

    const content = (
        <span className="elementor-button-content-wrapper">
      <span className="elementor-button-text">
        {loading ? "Please wait…" : children}
      </span>
    </span>
    );

    if (as === "a") {
        return (
            <a
                className={baseClass}
                href={href || "#"}
                aria-disabled={disabled || loading}
                {...rest}
            >
                {content}
            </a>
        );
    }

    return (
        <button
            className={baseClass}
            disabled={disabled || loading}
            {...rest}
        >
            {content}
        </button>
    );
}
