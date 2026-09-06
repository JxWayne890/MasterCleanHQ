import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { HelmetProvider } from 'react-helmet-async'

const root = document.getElementById('root')
const app = (
    <React.StrictMode>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </React.StrictMode>
)

// Production pages are prerendered; the Vite development shell is empty.
if (root.children.length > 0) {
    hydrateRoot(root, app)
} else {
    createRoot(root).render(app)
}
