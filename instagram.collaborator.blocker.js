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
        const posts = document.querySelectorAll('article'); // Select all post articles
        posts.forEach(post => { // Iterate through each post
            // Target the top section of the post (header or first div) // Context targeting
            const header = post.querySelector('header') || post.firstElementChild; // Find the most likely header container
            if (!header) return; // Skip if no top section found
// 
            // Identify unique profile links to distinguish multiple authors // Logic strategy
            const links = header.querySelectorAll('a'); // Get all links in the header area
            const uniqueProfiles = new Set(); // Use a Set to store unique usernames
// 
            links.forEach(link => { // Loop through identified links
                const href = link.getAttribute('href'); // Get link destination
                if (href) { // If destination exists
                    const pathSegments = href.split('/').filter(s => s.length > 0); // Parse URL segments
                    // Profile links on mobile web typically have exactly one path segment // Pattern identification
                    if (pathSegments.length === 1 && !href.includes('explore') && !href.includes('reels')) { // Filter for profile links
                        uniqueProfiles.add(pathSegments[0]); // Add username to unique set
                    } // End of profile pattern check
                } // End of href check
            }); // End of links loop
// 
            // Check for explicit "and" separators in the header text // Supplementary detection
            const headerText = header.textContent || ''; // Retrieve all text within the header
            const collaborationIndicators = [' and ', ' & ']; // Define common collaboration markers
            const hasIndicator = collaborationIndicators.some(indicator => headerText.includes(indicator)); // Check for presence of indicators
// 
            // Determine if the post should be hidden // Decision logic
            // A single author post will have only 1 unique profile in the set // Threshold rule
            if (uniqueProfiles.size > 1 || hasIndicator) { // If multiple profiles or "and" text found
                post.style.setProperty('display', 'none', 'important'); // Force hide the post
            } // End of hide check
        }); // End of posts loop
    }; // End of blockCollaboratorPosts function
// 
    blockCollaboratorPosts(); // Execute blocking immediately
// 
    const observer = new MutationObserver(() => { // Watch for dynamic feed loading
        blockCollaboratorPosts(); // Re-run logic on DOM mutations
    }); // End of observer definition
// 
    observer.observe(document.documentElement, { // Start monitoring the page
        childList: true, // Watch for added elements
        subtree: true // Watch all descendant nodes
    }); // End of observer start
// 
})(); // End of immediate execution function
