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
            // Locate the profile picture to find the real header container // Precision targeting
            const profilePic = post.querySelector('img[src*="cdninstat"]') || post.querySelector('img'); // Find the avatar image
            if (!profilePic) return; // Skip if no image found (skeleton loaders) - do NOT mark as checked yet
// 
            post.dataset.collabChecked = 'true'; // Mark post as checked now that content is available for analysis
// 
            // The header is the container holding the profile pic and username // Structure identification
            const header = profilePic.closest('header') || profilePic.closest('div[role="button"]') || profilePic.parentElement.closest('div'); // Find nearest semantic or functional container
            if (!header) return; // Skip if no container found
// 
            // Identify unique profile links within the header context // Logic strategy
            const links = header.querySelectorAll('a'); // Get all links in the isolated header area
            const uniqueProfiles = new Set(); // Use a Set to store unique usernames
// 
            links.forEach(link => { // Loop through header links
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
            const collaborationIndicators = [' and ', ' & ']; // Define common collaboration markers (English)
            const hasIndicator = collaborationIndicators.some(indicator => headerText.includes(indicator)); // Check for presence of indicators
// 
            // Determine if the post should be hidden based on unique authors or text cues // Decision logic
            if (uniqueProfiles.size > 1 || hasIndicator) { // If multiple profiles or "and" text found in header
                post.style.setProperty('display', 'none', 'important'); // Force hide the post
            } // End of hide check
        }); // End of posts loop
    }; // End of blockCollaboratorPosts function
// 
    blockCollaboratorPosts(); // Execute blocking immediately
// 
    // Set up an efficient observer to handle dynamic feed loading // Monitoring strategy
    let timeout; // Variable to store timeout for debouncing
    const observer = new MutationObserver(() => { // Initialize the MutationObserver
        if (timeout) clearTimeout(timeout); // Clear existing timeout to debounce calls
        timeout = setTimeout(blockCollaboratorPosts, 100); // Wait for DOM to settle before processing
    }); // End of observer definition
// 
    observer.observe(document.documentElement, { // Start monitoring the page
        childList: true, // Watch for added elements
        subtree: true // Watch all descendant nodes
    }); // End of observer start
// 
})(); // End of immediate execution function
