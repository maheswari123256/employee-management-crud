/**
 * hooks/useDocumentTitle.js
 * Sets the browser tab title for the current page.
 */
import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · Wizinoa HR` : 'Wizinoa HR';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
