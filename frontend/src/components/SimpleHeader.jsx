import React from 'react'
import { Link } from 'react-router-dom'

export default function SimpleHeader({ crumbs }) {
  return (
    <nav className="mt-4 ml-4 flex items-center text-sm text-text-secondary mb-4">
      {crumbs.map((crumb, idx) => (
        <React.Fragment key={idx}>
          {crumb.to ? (
            <Link to={crumb.to} className="hover:underline">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-text-primary">{crumb.label}</span>
          )}
          {idx < crumbs.length - 1 && <span className="mx-2">{'>'}</span>}
        </React.Fragment>
      ))}
    </nav>
  )
}