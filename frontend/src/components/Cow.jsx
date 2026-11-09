// Classic cowsay. Rule: the cow sits at the bottom of the page, or standing right on top
// of the last interesting element (render <Cow /> directly above it, no gap: its hooves touch the "floor").
const BODY = String.raw`        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||`

// shortcut: single-line balloon only, keep `says` under ~40 chars; add cowsay's multi-line balloon if a longer line is needed
export function cowsay(says) {
  const bar = (c) => ' ' + c.repeat(says.length + 2)
  return `${bar('_')}\n< ${says} >\n${bar('-')}\n${BODY}`
}

export default function Cow({ says, className = '' }) {
  return <pre className={`text-pink text-xs leading-tight ${className}`}>{cowsay(says)}</pre>
}
