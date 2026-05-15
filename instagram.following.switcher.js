// ==UserScript==
// @name         Instagram Following Feed Switcher
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Automatically switches Instagram to the "Following" feed.
// @author       Antigravity
// @match        https://www.instagram.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
// 
(function() { // Start of immediate execution function
    'use strict'; // Enable strict mode
// 
    const switchToFollowing = () => { // Function to switch to the Following feed
        if (window.location.pathname !== '/' && window.location.pathname !== '') return; // Only run on the home feed
//         
        // Method 1: Check URL variant // Strategy check
        const urlParams = new URLSearchParams(window.location.search); // Get current URL parameters
        if (urlParams.get('variant') === 'following') return; // Exit if already on the following feed
// 
        // Method 2: Try to find and click the "Following" button/tab // Strategy check
        const followingTab = Array.from(document.querySelectorAll('span')).find(el => el.textContent.trim() === 'Following'); // Search for a span containing "Following"
        if (followingTab) { // If the tab is found
            followingTab.click(); // Click the tab
            return; // Exit function
        } // End of tab check
// 
        // Method 3: Forced navigation as a fallback // Strategy check
        if (!urlParams.has('variant')) { // If the variant parameter is missing
            window.location.replace('/?variant=following'); // Redirect to the following variant
        } // End of navigation fallback
    }; // End of switchToFollowing function
// 
    // Initialize the script // Comment for initialization
    const init = () => { // Initialization function
        switchToFollowing(); // Attempt to switch the feed
    }; // End of init function
// 
    if (document.readyState === 'loading') { // Check if document is still loading
        document.addEventListener('DOMContentLoaded', init); // Run init on DOM content loaded
    } else { // If document is already loaded
        init(); // Run init immediately
    } // End of loading check
// 
    const observer = new MutationObserver(() => { // Create mutation observer for dynamic changes
        switchToFollowing(); // Check for feed switch needs
    }); // End of observer definition
// 
    observer.observe(document.documentElement, { // Observe document changes
        childList: true, // Watch child changes
        subtree: true // Watch all descendants
    }); // End of observer start
// 
})(); // End of immediate execution function
