// ==UserScript== // Userscript metadata header
// @name         Instagram Content Cleaner // Name of the script
// @namespace    http://tampermonkey.net/ // Namespace for the script
// @version      1.0 // Version of the script
// @description  Removes suggested content only from the Instagram home feed. // Description of the script
// @author       Antigravity // Author of the script
// @match        https://www.instagram.com/* // URL patterns to match
// @grant        none // No special permissions
// @run-at       document-start // Run as soon as the document starts
// ==/UserScript== // End of userscript metadata header
// 
(function() { // Start of immediate execution function
    'use strict'; // Enable strict mode
// 
    const cleanContent = () => { // Function to remove suggested content
        // CRITICAL: Only run on the main home feed. // Comment explaining the check
        // This prevents the script from accidentally hiding sections on profile pages. // Rationale for the check
        if (window.location.pathname !== '/' && window.location.pathname !== '') { // Check if not on the home page
            return; // Exit if not on home page
        } // End of path check
// 
        const suggestedLabels = [ // Array of labels to identify suggested content
            'Suggested for you', // Label variant 1
            'Suggested Reels', // Label variant 2
            'Suggested posts', // Label variant 3
            'Suggested for You', // Label variant 4
            'Because you liked', // Label variant 5
            'Recommended for you', // Label variant 6
            'Explore' // Label variant 7
        ]; // End of suggested labels array
// 
        const elements = document.querySelectorAll('span, div, h2'); // Select common text-containing elements
        elements.forEach(el => { // Iterate through each element
            const text = el.textContent.trim(); // Get trimmed text content of the element
            if (suggestedLabels.includes(text) && el.offsetParent !== null) { // Check if text matches labels and element is visible
                // Find the parent container (usually a section) and hide it // Strategy for hiding
                let container = el.closest('section') || el.closest('[role="region"]'); // Find the nearest semantic container
                if (container) { // If a container is found
                    container.style.setProperty('display', 'none', 'important'); // Apply CSS to hide the container
                } // End of container check
            } // End of label match check
        }); // End of elements iteration
    }; // End of cleanContent function
// 
    // Initialize removal // Comment for initial execution
    cleanContent(); // Run the cleaner immediately
// 
    // Watch for dynamic content loading // Comment for observer setup
    const observer = new MutationObserver(() => { // Create a mutation observer
        cleanContent(); // Re-run cleaner on DOM changes
    }); // End of observer definition
// 
    observer.observe(document.documentElement, { // Start observing the document
        childList: true, // Watch for added/removed children
        subtree: true // Watch all descendant nodes
    }); // End of observer observation
// 
})(); // End of immediate execution function
