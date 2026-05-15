// ==UserScript==
// @name         Instagram Collaborator Blocker
// @namespace    http://tampermonkey.net/
// @version      1.0.1
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
    // Helper function to find the lowest common ancestor of two elements // DOM Utility
    const findCommonAncestor = (el1, el2) => { // Define the search function
        let parent = el1.parentElement; // Start with the parent of the first element
        while (parent) { // Traverse up the tree
            if (parent.contains(el2)) return parent; // Return if it also contains the second element
            parent = parent.parentElement; // Move up one level
        } // End of traversal loop
        return null; // Return null if no common ancestor found
    }; // End of helper function
// 
    const blockCollaboratorPosts = () => { // Function to hide collaborator posts
        if (window.location.pathname !== '/' && window.location.pathname !== '') return; // Only run on the home feed
// 
        const posts = document.querySelectorAll('article:not([data-collab-checked])'); // Select only new, unprocessed posts
        posts.forEach(post => { // Iterate through new posts
            // Find critical header anchors: profile pic and more options icon // Identification phase
            const profilePic = post.querySelector('img[src*="cdninstat"]') || post.querySelector('img'); // Locate avatar
            const optionsIcon = post.querySelector('svg[aria-label*="Options"], svg[aria-label*="options"]'); // Locate ellipsis menu
// 
            if (!profilePic || !optionsIcon) return; // Skip if header elements haven't loaded yet
// 
            post.dataset.collabChecked = 'true'; // Mark post as analyzed once anchors are available
// 
            // Identify the header by finding the common ancestor of both anchors // Context isolation
            const header = findCommonAncestor(profilePic, optionsIcon); // Find the container holding both pic and menu
            if (!header) return; // Skip if no valid header container found
// 
            // Analyze unique profile links within this specific header container // Logic strategy
            const links = header.querySelectorAll('a'); // Get all links in the isolated header area
            const uniqueProfiles = new Set(); // Use a Set to store unique usernames
// 
            links.forEach(link => { // Loop through header links
                const href = link.getAttribute('href'); // Get link destination
                if (href) { // If destination exists
                    const pathSegments = href.split('/').filter(s => s.length > 0); // Parse URL segments
                    // Filter for profile links (exactly one segment, excluding explore/reels) // Pattern identification
                    if (pathSegments.length === 1 && !href.includes('explore') && !href.includes('reels')) { // Profile URL pattern
                        uniqueProfiles.add(pathSegments[0]); // Add username to unique set
                    } // End of pattern check
                } // End of href check
            }); // End of links loop
// 
            // Check for explicit "and" separators in the text of the header // Supplementary detection
            const headerText = header.textContent || ''; // Retrieve all text within the header
            const collaborationIndicators = [' and ', ' & ']; // Define common collaboration markers
            const hasIndicator = collaborationIndicators.some(indicator => headerText.includes(indicator)); // Check for markers
// 
            // Determine if the post should be hidden // Decision logic
            if (uniqueProfiles.size > 1 || hasIndicator) { // If multiple profiles or "and" text found in header area
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
        timeout = setTimeout(blockCollaboratorPosts, 100); // Wait for DOM to settle before processing
    }); // End of observer definition
// 
    observer.observe(document.documentElement, { // Start watching the page
        childList: true, // Watch for added posts
        subtree: true // Watch entire DOM tree
    }); // End of observer start
// 
})(); // End of immediate execution function
