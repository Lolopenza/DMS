import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumb Navigation Component
 * @param {Object} props
 * @param {Array<{label: string, href?: string}>} props.items - Breadcrumb items
 */
export default function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {item.href ? (
              <>
                <Link to={item.href} className="breadcrumb-link">
                  {item.label}
                </Link>
                {index < items.length - 1 && (
                  <span className="breadcrumb-sep" aria-hidden="true">/</span>
                )}
              </>
            ) : (
              <>
                <span className="breadcrumb-current">{item.label}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
