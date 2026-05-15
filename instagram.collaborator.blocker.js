// ==UserScript== // Userscript metadata header
// @name         Instagram Collaborator Blocker // Name of the userscript
// @namespace    http://tampermonkey.net/ // Namespace identifier
// @version      1.0 // Script version
// @description  Blocks and hides Instagram posts that have collaborators in the header. // Purpose of the script
// @author       Antigravity // Creator of the script
// @match        https://www.instagram.com/* // Domains where the script will run
// @grant        none // No special permissions required
// @run-at       document-start // Execute as soon as the document starts loading
// ==/UserScript== // End of userscript metadata header

(function() { // Start of the main execution function
    'use strict'; // Enforce strict JavaScript mode for better error catching

    /**
     * Function to identify and hide collaborator posts
     */
    const blockCollaboratorPosts = () => { // Define the blocking function
        // Check if the user is on the main feed page // Navigation check
        if (window.location.pathname !== '/' && window.location.pathname !== '') { // Exit if not on home path
            return; // Stop execution for non-feed pages
        } // End of path validation

        const posts = document.querySelectorAll('article'); // Select all post articles on the page
        posts.forEach(post => { // Iterate through each found post
            const header = post.querySelector('header'); // Locate the header section of the post
            if (!header) { // If no header is found (edge case or loading state)
                return; // Skip this post and continue
            } // End of header existence check

            // Heuristic: Count the number of profile links in the header // Logic explanation
            // A standard post typically has 2 links to the same profile (avatar and username) // Baseline
            // A collaborator post will have additional links for the other collaborators // Detection logic
            const links = header.querySelectorAll('a'); // Get all anchor elements within the header
            let profileLinkCount = 0; // Initialize a counter for profile-like links

            links.forEach(link => { // Loop through each link in the header
                const href = link.getAttribute('href'); // Retrieve the link's destination URL
                if (href) { // If the link has a destination
                    const pathSegments = href.split('/').filter(segment => segment.length > 0); // Split path and remove empty parts
                    // Profile links usually have exactly one segment (e.g., /username/) // URL pattern identification
                    if (pathSegments.length === 1 && !href.includes('explore')) { // Check if it matches a profile pattern and isn't a tag
                        profileLinkCount++; // Increment the profile link counter
                    } // End of pattern match check
                } // End of href existence check
            }); // End of links iteration

            // Threshold for collaborator detection // Strategy explanation
            // We use a dynamic threshold: if more than two profile links are present, it's a collaboration // Rule definition
            const collaborationThreshold = 2; // Define the maximum number of links for a single-author post
            
            if (profileLinkCount > collaborationThreshold) { // If the count exceeds the single-author threshold
                post.style.setProperty('display', 'none', 'important'); // Apply CSS to hide the entire post
            } // End of threshold check
        }); // End of posts iteration
    }; // End of blockCollaboratorPosts function

    // Initial execution to clean existing content // Startup run
    blockCollaboratorPosts(); // Run the blocking logic immediately

    // Set up an observer to handle infinite scrolling and dynamic updates // Monitoring strategy
    const observer = new MutationObserver(() => { // Initialize the MutationObserver
        blockCollaboratorPosts(); // Re-run the blocking logic when the DOM changes
    }); // End of observer initialization

    // Start watching the document for changes // Observer activation
    observer.observe(document.documentElement, { // Attach observer to the root element
        childList: true, // Monitor addition of new elements (new posts)
        subtree: true // Monitor all nested elements in the tree
    }); // End of observer configuration

})(); // Execute the function immediately
