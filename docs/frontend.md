# Frontend Architecture

## Overview
The frontend relies entirely on standard web technologies: HTML, CSS, and Vanilla JavaScript. No bundlers or compilers are strictly necessary (though serving over a local local server is recommended for CORS/fetch).

## File Structure
- `/index.html` - The main structure. Includes standard HTML5 tags, our message container, input bar, and language selectors.
- `/styles.css` - Custom design relying heavily on CSS vars for theming and standard flexbox/grid for layout organization. Built for a premium UI feel (dark tones, subtle shadows).
- `/script.js` - Logic handling DOM attachments (buttons, input fields), rendering new message bubbles locally, and wrapping the `fetch()` API calls to the Flask backend.

## Styling Aspects
- Use variables for colors.
- Use `border-radius` and `backdrop-filter` for glassmorphism aesthetics.
- Animations on chat bubble arrival.
