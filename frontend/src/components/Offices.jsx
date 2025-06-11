import clsx from 'clsx'

function Office({ name, children, invert = false }) {
  return (
    <address
      className={clsx(
        'text-sm not-italic',
        invert ? 'text-neutral-300' : 'text-neutral-600',
      )}
    >
      <strong className={invert ? 'text-white' : 'text-neutral-950'}>
        {name}
      </strong>
      <br />
      {children}
    </address>
  )
}

export function Offices({ invert = false, ...props }) {
  return (
    <ul role="list" {...props}>
      <li>
        <Office name="Київ" invert={invert}>
          приховано під час війни
          <br />
          01000, Україна
        </Office>
      </li>
      <li>
        <Office name="Будівля" invert={invert}>
          приховано під час війни
          <br />
          {/*7190, Billund, Denmark*/}
        </Office>
      </li>
    </ul>
  )
}
