import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "./Button.scss";

type CommonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  disabled?: boolean;
};

type ButtonAsLink = CommonProps & {
  to: string;
  href?: never;
  onClick?: never;
  type?: never;
};

type ButtonAsAnchor = CommonProps & {
  href: string;
  to?: never;
  onClick?: never;
  type?: never;
};

type ButtonAsButton = CommonProps & {
  onClick: () => void;
  to?: never;
  href?: never;
  type?: "button" | "submit";
};

// A submit button inside a <form> doesn't need its own onClick; the form's
// onSubmit handler covers it.
type ButtonAsSubmit = CommonProps & {
  type: "submit";
  onClick?: never;
  to?: never;
  href?: never;
};

type ButtonProps = ButtonAsLink | ButtonAsAnchor | ButtonAsButton | ButtonAsSubmit;

export function Button(props: ButtonProps) {
  const { children, variant = "primary", className = "", disabled } = props;
  const classes = `btn btn--${variant} ${className}`.trim();

  if ("to" in props && props.to) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    );
  }

  if ("href" in props && props.href) {
    const isExternal = props.href.startsWith("http");
    return (
      <a
        href={props.href}
        className={classes}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  const buttonProps = props as ButtonAsButton | ButtonAsSubmit;
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={classes}
      onClick={buttonProps.onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
