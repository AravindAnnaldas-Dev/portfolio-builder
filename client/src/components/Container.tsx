import { ElementType, HTMLAttributes } from "react";

// Single source of truth for the app's content width. AppHeader, the
// dashboard, and the editor's sub-header/main all need to line up exactly —
// duplicating "mx-auto max-w-6xl px-6" by hand in each is what caused the
// header/content width mismatches fixed earlier. Use this instead.
interface Props extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

export function Container({ as: Tag = "div", className = "", ...rest }: Props) {
  return <Tag className={`mx-auto w-full max-w-6xl px-6 ${className}`} {...rest} />;
}
