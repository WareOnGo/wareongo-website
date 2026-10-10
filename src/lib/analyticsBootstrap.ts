import { bootstrapAnalytics } from './analytics';

// Analytics must never prevent the static page or the application from loading.
try { bootstrapAnalytics(); } catch { /* Keep the page usable if analytics fails. */ }
