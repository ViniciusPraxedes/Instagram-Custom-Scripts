// ==UserScript== // Userscript metadata header
// @name         Instagram Repost Remover // Name of the script
// @namespace    http://tampermonkey.net/ // Namespace for the script
// @version      1.0 // Version of the script
// @description  Removes reposted/shared content from the Instagram home feed. // Description of the script
// @author       Antigravity // Author of the script
// @match        https://www.instagram.com/* // URL patterns to match
// @grant        none // No special permissions
// @run-at       document-start // Run as soon as the document starts
// ==/UserScript== // End of userscript metadata header
// 
(function() { // Start of immediate execution function
    'use strict'; // Enable strict mode
// 
    const removeReposts = () => { // Function to remove reposted content
        // Only run full article removal on the home feed // Comment explaining scope
        if (window.location.pathname !== '/' && window.location.pathname !== '') { // Check if not on the home page
            return; // Exit if not on home page
        } // End of path check
// 
        const repostLabels = ['reposted', 'shared a post', 'reshared']; // Array of keywords for repost detection
// 
        const elements = document.querySelectorAll('span, div, a'); // Select elements that might contain labels
        elements.forEach(el => { // Iterate through each element
            const text = el.textContent.toLowerCase().trim(); // Get lowercase trimmed text
            // Detect repost headers (usually at the top of an article) // Detection strategy
            if (repostLabels.some(label => text === label || text.endsWith(label)) && el.offsetParent !== null) { // Match label and visibility
                let post = el.closest('article'); // Find the closest article element
                if (post) { // If an article is found
                    post.style.setProperty('display', 'none', 'important'); // Hide the entire article
                } // End of article check
            } // End of label match check
        }); // End of elements iteration
// 
        // Target the specific repost badges on avatars // Comment for badge detection
        const badges = document.querySelectorAll('svg[aria-label="Reposted"], svg[aria-label="Repost"]'); // Select repost SVGs
        badges.forEach(badge => { // Iterate through each badge
            // Only hide the whole post if the badge is NOT in the action bar (the bottom section) // Rationale for context check
            if (!badge.closest('section')) { // If badge is not in a section (action bar)
                let post = badge.closest('article'); // Find the parent article
                if (post) { // If an article is found
                    post.style.setProperty('display', 'none', 'important'); // Hide the article
                } // End of article check
            } // End of section check
        }); // End of badges iteration
    }; // End of removeReposts function
// 
    // Initial run // Comment for startup execution
    removeReposts(); // Execute removal immediately
// 
    // Watch for new posts // Comment for dynamic monitoring
    const observer = new MutationObserver(() => { // Create a mutation observer
        removeReposts(); // Re-run removal on changes
    }); // End of observer definition
// 
    observer.observe(document.documentElement, { // Start observing the document
        childList: true, // Watch for added/removed children
        subtree: true // Watch all descendant nodes
    }); // End of observer observation
// 
    // CSS to hide the Repost buttons in the action bar globally // Comment for global styling
    const style = document.createElement('style'); // Create a style element
    style.innerHTML = ` // Set CSS content
        svg[aria-label="Repost"], // Selector for Repost icon
        svg[aria-label="Reshare"] { // Selector for Reshare icon
            display: none !important; // Force hide the icons
        } // End of selector rules
    `; // End of CSS content
    document.head.appendChild(style); // Append style to the document head
// 
})(); // End of immediate execution function
