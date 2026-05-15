# Skill: Generating Content-Blocking Userscripts for Instagram

This document explains how to generate and maintain scripts that hide specific UI elements on Instagram's mobile web platform while ensuring stability across different page types (Feed vs. Profiles).

## 1. Strategy: Precision Targeting
Instagram uses obfuscated class names (e.g., `x1lliihq`) that change frequently. To build a reliable script, target stable attributes:
- **aria-label**: Elements like "Reels" often have descriptive aria-labels for accessibility.
- **href**: Use exact matches like `a[href="/reels/"]` to avoid accidentally blocking profile links that might contain the word "reels".
- **Text Content**: Elements containing text like "Suggested for you" can be identified via `textContent` checks.

## 2. Technical Implementation: The Two-Mechanism Approach

### A. MutationObserver
Instagram is a Single Page Application (SPA). A `MutationObserver` is required to detect when new content is loaded dynamically.
```javascript
const observer = new MutationObserver(() => {
    // Run hiding logic here
});
observer.observe(document.documentElement, { childList: true, subtree: true });
```

### B. CSS Injection
Injecting a `<style>` tag provides a persistent fallback that hides elements before JavaScript even executes.
```javascript
const style = document.createElement('style');
style.innerHTML = `a[href="/reels/"] { display: none !important; }`;
document.head.appendChild(style);
```

## 3. The "Profile Safety" Pattern
When hiding entire sections based on text content (e.g., "Suggested"), always implement a path check to ensure you don't break profile pages:

```javascript
const isHomeFeed = () => window.location.pathname === '/' || window.location.pathname === '';

if (isHomeFeed()) {
    // Aggressive cleaning logic here
}
```

## 4. Selective UI Removal vs. Content Hiding
When cleaning the feed, you often need to distinguish between a UI element (like a button) and the content it relates to (like a reposted post).

### A. Global UI Hiding (CSS)
Use CSS for elements that should be hidden everywhere without logic checks.
```css
svg[aria-label="Repost"] { display: none !important; }
```

### B. Context-Aware Content Hiding (JS)
Use JavaScript to find the parent container (`article`) but only if the trigger element is in a specific context (e.g., at the top of the post, not in the action bar).
```javascript
if (el.getAttribute('aria-label') === 'Repost' && !el.closest('section')) {
    el.closest('article').style.display = 'none';
}
```

## 5. Maintenance
1. Identify new elements using browser DevTools (simulating a mobile device).
2. Check if the element has a unique `aria-label` or `role`.
3. Update selectors in the script and ensure the `MutationObserver` is watching the correct root element.

## 6. URL-Based Feed Switching
Instagram provides a "Following" feed variant via URL parameters. To force this feed reliably:
- **URL Param**: Check for `?variant=following`.
- **Navigation Fallback**: If the parameter is missing on the root path, use `window.location.replace` to redirect.
- **UI Interaction**: As an alternative to reloading, search for the "Following" tab/span and trigger a `.click()`.

```javascript
if (window.location.pathname === '/' && !window.location.search.includes('variant=following')) {
    window.location.replace('/?variant=following');
}
```
