// ==UserScript== // Userscript metadata header
// @name         Instagram Reels Blocker // Name of the script
// @namespace    http://tampermonkey.net/ // Namespace for the script
// @version      1.1 // Version of the script
// @description  Hides only the Reels icon from Instagram navigation. // Description of the script
// @author       Antigravity // Author of the script
// @match        https://www.instagram.com/* // URL patterns to match
// @grant        none // No special permissions
// @run-at       document-start // Run as soon as the document starts
// ==/UserScript== // End of userscript metadata header
// 
(function() { // Start of immediate execution function
    'use strict'; // Enable strict mode
// 
    const hideReels = () => { // Function to hide Reels icons
        // Target only the specific Reels navigation icons/links // Comment for selector list
        const selectors = [ // Array of CSS selectors for Reels elements
            'a[href="/reels/"]', // Sidebar link selector
            'svg[aria-label="Reels"]', // Icon selector
            'a[aria-label="Reels"]' // Aria label selector
        ]; // End of selectors array
//         
        selectors.forEach(selector => { // Iterate through each selector
            document.querySelectorAll(selector).forEach(el => { // Find matching elements and iterate
                let target = el.tagName === 'A' ? el : el.closest('a'); // Get the element or its parent link
                if (target) { // If a target is found
                    target.style.setProperty('display', 'none', 'important'); // Hide the target via CSS
                } // End of target check
            }); // End of elements iteration
        }); // End of selectors iteration
    }; // End of hideReels function
// 
    // Run immediately and then on changes // Comment for execution strategy
    hideReels(); // Execute hiding immediately
// 
    const observer = new MutationObserver(() => { // Create a mutation observer
        hideReels(); // Re-run hiding on changes
    }); // End of observer definition
// 
    observer.observe(document.documentElement, { // Start observing the document
        childList: true, // Watch for added/removed children
        subtree: true // Watch all descendant nodes
    }); // End of observer observation
// 
    // Style injection for robustness // Comment for CSS fallback
    const style = document.createElement('style'); // Create a style element
    style.innerHTML = ` // Set CSS content
        a[href="/reels/"], // CSS rule for sidebar link
        svg[aria-label="Reels"], // CSS rule for icon
        a[aria-label="Reels"] { // CSS rule for aria label
            display: none !important; // Force hide the elements
        } // End of CSS rules
    `; // End of CSS content
    document.head.appendChild(style); // Append style to the document head
// 
})(); // End of immediate execution function
