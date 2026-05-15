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
            const header = post.querySelector('header'); // Find the post header
            if (!header) return; // Skip if no header found
// 
            const links = header.querySelectorAll('a'); // Get all links in the header
            let profileLinkCount = 0; // Initialize profile link counter
// 
            links.forEach(link => { // Loop through header links
                const href = link.getAttribute('href'); // Get link destination
                if (href) { // If href exists
                    const pathSegments = href.split('/').filter(s => s.length > 0); // Parse path segments
                    if (pathSegments.length === 1 && !href.includes('explore')) { // Identify profile-pattern links
                        profileLinkCount++; // Increment counter
                    } // End of pattern check
                } // End of href check
            }); // End of links loop
// 
            const threshold = 2; // Maximum links for single-author posts
            if (profileLinkCount > threshold) { // If collaborator detected
                post.style.setProperty('display', 'none', 'important'); // Hide the post
            } // End of threshold check
        }); // End of posts loop
    }; // End of blockCollaboratorPosts function
// 
    blockCollaboratorPosts(); // Run blocking immediately
// 
    const observer = new MutationObserver(() => { // Create observer for new content
        blockCollaboratorPosts(); // Re-run blocking on changes
    }); // End of observer definition
// 
    observer.observe(document.documentElement, { // Start monitoring DOM
        childList: true, // Watch for new elements
        subtree: true // Watch entire tree
    }); // End of observer start
// 
})(); // End of immediate execution function
