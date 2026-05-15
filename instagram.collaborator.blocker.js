// ==UserScript==
// @name         Instagram Collaborator Blocker
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Hides posts with collaborators on Instagram.
// @author       Antigravity
// @match        https://www.instagram.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
// 
(function() { // Start of immediate execution function
    'use strict'; // Enable strict mode
// 
    const blockCollaboratorPosts = () => { // Function to hide collaborator posts
        if (window.location.pathname !== '/' && window.location.pathname !== '') return; // Only run on the home feed
// 
        const posts = document.querySelectorAll('article:not([data-collab-checked])'); // Select only new, unprocessed posts
        posts.forEach(post => { // Iterate through new posts
            // Look for the "More options" icon which is a stable anchor for the header // Anchor-based targeting
            const moreOptionsIcon = post.querySelector('svg[aria-label*="Options"], svg[aria-label*="options"]'); // Find the ellipsis menu icon
            if (!moreOptionsIcon) return; // Skip if header elements haven't loaded yet
// 
            post.dataset.collabChecked = 'true'; // Mark post as checked for analysis
// 
            // Find the container that holds the entire header (username, collaborators, and options) // Context isolation
            const header = moreOptionsIcon.closest('header') || moreOptionsIcon.closest('div[role="button"]') || moreOptionsIcon.parentElement.closest('div'); // Expand to the full header block
            if (!header) return; // Skip if no valid header container found
// 
            // Identify unique profile links within this specific header container // Logic strategy
            const links = header.querySelectorAll('a'); // Get all links in the header
            const uniqueProfiles = new Set(); // Use a Set to store unique usernames
// 
            links.forEach(link => { // Loop through header links
                const href = link.getAttribute('href'); // Get link destination
                if (href) { // If destination exists
                    const pathSegments = href.split('/').filter(s => s.length > 0); // Parse URL segments
                    // Filter for profile links (single path segment, excluding internal tags) // Pattern identification
                    if (pathSegments.length === 1 && !href.includes('explore') && !href.includes('reels')) { // Filter logic
                        uniqueProfiles.add(pathSegments[0]); // Add username to unique set
                    } // End of pattern check
                } // End of href check
            }); // End of links loop
// 
            // Check for explicit "and" separators in the text of the header // Supplementary text detection
            const headerText = header.textContent || ''; // Retrieve all text within the isolated header
            const collaborationIndicators = [' and ', ' & ']; // Define common collaboration markers
            const hasIndicator = collaborationIndicators.some(indicator => headerText.includes(indicator)); // Check for markers in text
// 
            // Determine if the post should be hidden based on unique authors or text indicators // Decision logic
            if (uniqueProfiles.size > 1 || hasIndicator) { // If multiple profiles or "and" text found in header
                post.style.setProperty('display', 'none', 'important'); // Force hide the collaborator post
            } // End of hide check
        }); // End of posts loop
    }; // End of blockCollaboratorPosts function
// 
    blockCollaboratorPosts(); // Execute blocking immediately
// 
    // Set up a debounced observer to handle dynamic scrolling // Monitoring strategy
    let timeout; // Variable to store debounce timeout
    const observer = new MutationObserver(() => { // Initialize MutationObserver
        if (timeout) clearTimeout(timeout); // Clear previous timeout
        timeout = setTimeout(blockCollaboratorPosts, 100); // Debounce call to prevent performance lag
    }); // End of observer definition
// 
    observer.observe(document.documentElement, { // Start watching the page
        childList: true, // Watch for added posts
        subtree: true // Watch entire DOM tree
    }); // End of observer start
// 
})(); // End of immediate execution function
