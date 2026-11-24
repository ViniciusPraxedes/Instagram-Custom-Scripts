// ==UserScript==
// @name         Instagram Keyword Blocker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hides Instagram home feed posts matching user-defined keywords.
// @author       Antigravity
// @match        https://www.instagram.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

// Wrap script in an IIFE to avoid polluting global scope
(function() {
    // Enforce strict mode for safer execution
    'use strict';

    // Define the localStorage key used to persist user keywords
    const STORAGE_KEY = 'ig_keyword_blocker_words';
    // Define the root DOM element ID for the floating controls
    const ROOT_ID = 'ig-kw-blocker-root';
    // Define the style element ID to prevent duplicate style injection
    const STYLE_ID = 'ig-kw-blocker-style';
    // Define the debounce delay in milliseconds for DOM mutation handling
    const OBSERVER_DEBOUNCE_MS = 100;
    // Hold the active debounce timer reference
    let debounceTimer = null;

    // Normalize a single keyword string for consistent matching
    const normalizeKeyword = (rawWord) => {
        // Return empty string when input is not a string
        if (typeof rawWord !== 'string') {
            // Exit early with an empty fallback
            return '';
        // End string type guard
        }
        // Trim whitespace and lowercase for case-insensitive matching
        return rawWord.trim().toLowerCase();
    // End normalizeKeyword helper
    };

    // Load the saved list of blocked keywords from localStorage
    const loadKeywords = () => {
        // Guard storage access against privacy mode or parse errors
        try {
            // Read raw JSON string from localStorage
            const raw = window.localStorage.getItem(STORAGE_KEY);
            // Return an empty list if nothing has been saved yet
            if (!raw) {
                // Exit early with empty keyword array
                return [];
            // End empty storage check
            }
            // Parse the stored JSON payload
            const parsed = JSON.parse(raw);
            // Validate that parsed value is an array
            if (!Array.isArray(parsed)) {
                // Return empty list if stored shape is invalid
                return [];
            // End array validation check
            }
            // Normalize entries, drop empty strings, and deduplicate
            return Array.from(new Set(parsed.map(normalizeKeyword).filter(Boolean)));
        // Handle JSON or storage exceptions gracefully
        } catch (err) {
            // Fall back to an empty keyword list on failure
            return [];
        // End try/catch block
        }
    // End loadKeywords helper
    };

    // Persist the current keyword list to localStorage
    const saveKeywords = (keywords) => {
        // Guard storage writes against quota or privacy mode restrictions
        try {
            // Serialize keyword array as JSON into localStorage
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
        // Ignore storage write failures without breaking feed filtering
        } catch (err) {
            // No-op fallback when storage is unavailable
            return;
        // End try/catch block
        }
    // End saveKeywords helper
    };

    // Check whether the current view is the main Instagram home feed
    const isHomeFeed = () => {
        // Match only root paths to keep profiles and other views intact
        return window.location.pathname === '/' || window.location.pathname === '';
    // End isHomeFeed helper
    };

    // Extract searchable text from a post including caption and image alt text
    const getPostSearchableText = (post) => {
        // Read visible and hidden text content inside the article
        const bodyText = post.textContent || '';
        // Collect alt descriptions from all images inside the post
        const altTexts = Array.from(post.querySelectorAll('img[alt]')).map((img) => {
            // Return image alt text or empty string
            return img.getAttribute('alt') || '';
        // End alt text mapping
        });
        // Combine text and alt attributes into one lowercased string
        return (bodyText + ' ' + altTexts.join(' ')).toLowerCase();
    // End getPostSearchableText helper
    };

    // Determine whether post text contains any blocked keyword
    const matchesAnyKeyword = (text, keywords) => {
        // Exit early when no keywords are configured
        if (!keywords.length) {
            // Return false because there is nothing to match
            return false;
        // End empty keywords guard
        }
        // Check if at least one keyword appears in the post text
        return keywords.some((keyword) => {
            // Perform case-insensitive substring match
            return text.includes(keyword);
        // End keyword predicate
        });
    // End matchesAnyKeyword helper
    };

    // Hide or restore feed posts based on the active keyword list
    const filterPosts = () => {
        // Abort if user is not on the home feed
        if (!isHomeFeed()) {
            // Exit early to avoid affecting profile or explore pages
            return;
        // End home feed guard
        }
        // Load latest keyword list dynamically
        const keywords = loadKeywords();
        // Query all article elements representing feed posts
        const posts = document.querySelectorAll('article');
        // Evaluate each post against the keyword list
        posts.forEach((post) => {
            // Build combined searchable text for the current post
            const searchableText = getPostSearchableText(post);
            // Check whether the post matches any blocked keyword
            const shouldHide = matchesAnyKeyword(searchableText, keywords);
            // Hide matching post using important display override
            if (shouldHide) {
                // Force-hide the matched post element
                post.style.setProperty('display', 'none', 'important');
                // Mark post so it can be restored if the keyword is removed
                post.dataset.keywordBlocked = 'true';
                // Move to the next post
                return;
            // End hide branch
            }
            // Restore posts previously hidden by this script if no longer matched
            if (post.dataset.keywordBlocked === 'true') {
                // Remove forced display style
                post.style.removeProperty('display');
                // Clear blocked marker attribute
                delete post.dataset.keywordBlocked;
            // End restore branch
            }
        // End post iteration
        });
    // End filterPosts function
    };

    // Debounce post filtering during rapid SPA DOM mutations
    const scheduleFilter = () => {
        // Clear pending timer if another mutation arrived
        if (debounceTimer) {
            // Cancel the scheduled timeout
            window.clearTimeout(debounceTimer);
        // End pending timer check
        }
        // Schedule a fresh filter pass after DOM settles
        debounceTimer = window.setTimeout(() => {
            // Run post filtering logic
            filterPosts();
        // Wait configured debounce duration
        }, OBSERVER_DEBOUNCE_MS);
    // End scheduleFilter helper
    };

    // Create a DOM element with optional id, className, and textContent
    const createEl = (tag, attrs) => {
        // Instantiate the requested HTML element
        const el = document.createElement(tag);
        // Return bare element if no attributes were provided
        if (!attrs) {
            // Exit early with newly created element
            return el;
        // End empty attributes check
        }
        // Apply id if specified
        if (attrs.id) {
            // Set element id attribute
            el.id = attrs.id;
        // End id assignment
        }
        // Apply className if specified
        if (attrs.className) {
            // Set element CSS class string
            el.className = attrs.className;
        // End className assignment
        }
        // Apply textContent if specified
        if (typeof attrs.text === 'string') {
            // Assign safe plain text content
            el.textContent = attrs.text;
        // End text assignment
        }
        // Apply input type if specified
        if (attrs.type) {
            // Set element type attribute
            el.type = attrs.type;
        // End type assignment
        }
        // Apply placeholder if specified
        if (attrs.placeholder) {
            // Set input placeholder text
            el.placeholder = attrs.placeholder;
        // End placeholder assignment
        }
        // Apply aria-label if specified
        if (attrs.ariaLabel) {
            // Set accessibility label attribute
            el.setAttribute('aria-label', attrs.ariaLabel);
        // End aria-label assignment
        }
        // Return configured DOM element
        return el;
    // End createEl helper
    };

    // Inject scoped CSS rules for the iOS-friendly keyword manager UI
    const injectStyles = () => {
        // Skip injection if style tag is already present
        if (document.getElementById(STYLE_ID)) {
            // Exit early to avoid duplicate style tags
            return;
        // End duplicate style check
        }
        // Create style element for UI rules
        const style = createEl('style', { id: STYLE_ID });
        // Assemble CSS rules via array join to keep every JS line cleanly commented
        const rules = [
            // Anchor root container above Instagram mobile bottom navigation bar
            '#ig-kw-blocker-root { position: fixed; bottom: 74px; right: 14px; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }',
            // Style floating pill toggle button for touch usability
            '#ig-kw-toggle { background: #111827; color: #ffffff; border: 1px solid #374151; border-radius: 9999px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.35); }',
            // Style expandable keyword management panel
            '#ig-kw-panel { display: none; position: fixed; bottom: 120px; right: 14px; width: min(320px, calc(100vw - 28px)); background: #18181b; color: #f4f4f5; border: 1px solid #3f3f46; border-radius: 14px; padding: 14px; box-shadow: 0 10px 28px rgba(0,0,0,0.5); box-sizing: border-box; }',
            // Show panel when open class is active
            '#ig-kw-panel.open { display: block; }',
            // Align panel header title and close action
            '.ig-kw-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }',
            // Style panel heading text
            '.ig-kw-title { font-size: 14px; font-weight: 700; margin: 0; }',
            // Style panel close button
            '.ig-kw-close { background: transparent; color: #a1a1aa; border: none; font-size: 18px; line-height: 1; padding: 4px 6px; cursor: pointer; }',
            // Layout keyword input form row
            '.ig-kw-form { display: flex; gap: 6px; margin-bottom: 10px; }',
            // Set 16px font-size on input to prevent automatic zoom on iOS Safari
            '.ig-kw-input { flex: 1; min-width: 0; background: #27272a; color: #ffffff; border: 1px solid #52525b; border-radius: 8px; padding: 8px 10px; font-size: 16px; outline: none; }',
            // Style Add keyword submit button
            '.ig-kw-add { background: #2563eb; color: #ffffff; border: none; border-radius: 8px; padding: 8px 12px; font-size: 14px; font-weight: 600; cursor: pointer; }',
            // Wrap keyword chips cleanly with vertical scroll cap
            '.ig-kw-list { display: flex; flex-wrap: wrap; gap: 6px; max-height: 180px; overflow-y: auto; margin-bottom: 10px; }',
            // Style individual blocked-word chip
            '.ig-kw-chip { display: inline-flex; align-items: center; gap: 6px; background: #27272a; border: 1px solid #3f3f46; border-radius: 9999px; padding: 4px 10px; font-size: 13px; }',
            // Style chip remove button
            '.ig-kw-remove { background: transparent; color: #f87171; border: none; font-size: 15px; line-height: 1; padding: 0 2px; cursor: pointer; }',
            // Style empty state message
            '.ig-kw-empty { color: #a1a1aa; font-size: 12px; margin: 4px 0; }',
            // Style footer row containing clear button
            '.ig-kw-footer { display: flex; justify-content: flex-end; }',
            // Style clear-all action button
            '.ig-kw-clear { background: transparent; color: #a1a1aa; border: 1px solid #3f3f46; border-radius: 8px; padding: 5px 10px; font-size: 12px; cursor: pointer; }'
        // End CSS rules array
        ];
        // Join CSS rule lines into style textContent
        style.textContent = rules.join('\n');
        // Select head or documentElement when head is not yet ready
        const target = document.head || document.documentElement;
        // Append injected style element to the document
        target.appendChild(style);
    // End injectStyles helper
    };

    // Render keyword chips and update toggle counter label
    const renderUIState = (toggleBtn, listEl, clearBtn, keywords, onRemove) => {
        // Update floating button label with active keyword count
        toggleBtn.textContent = 'Filter (' + keywords.length + ')';
        // Clear existing chip elements before re-rendering
        listEl.textContent = '';
        // Toggle Clear All button visibility based on whether keywords exist
        clearBtn.style.display = keywords.length ? 'inline-block' : 'none';
        // Show empty hint when no words are configured
        if (!keywords.length) {
            // Create empty-state message element
            const emptyMsg = createEl('span', { className: 'ig-kw-empty', text: 'No blocked words added yet.' });
            // Append empty-state message to list container
            listEl.appendChild(emptyMsg);
            // Exit early after rendering empty state
            return;
        // End empty keywords check
        }
        // Build a removable chip for each blocked keyword
        keywords.forEach((word) => {
            // Create chip wrapper
            const chip = createEl('span', { className: 'ig-kw-chip' });
            // Create keyword text span
            const label = createEl('span', { text: word });
            // Create remove button for this keyword
            const removeBtn = createEl('button', {
                // Set button type to prevent form submission
                type: 'button',
                // Apply chip remove styling
                className: 'ig-kw-remove',
                // Set cross symbol
                text: '×',
                // Provide accessible label for screen readers
                ariaLabel: 'Remove ' + word
            // End button attributes
            });
            // Wire click handler to remove this specific keyword
            removeBtn.addEventListener('click', () => {
                // Delegate removal to caller callback
                onRemove(word);
            // End click listener
            });
            // Append keyword label inside chip
            chip.appendChild(label);
            // Append remove button inside chip
            chip.appendChild(removeBtn);
            // Append chip into keyword list container
            listEl.appendChild(chip);
        // End keyword chip loop
        });
    // End renderUIState helper
    };

    // Mount the floating filter button and keyword management panel
    const mountUI = () => {
        // Abort if body is not ready or root is already mounted
        if (!document.body || document.getElementById(ROOT_ID)) {
            // Exit early until DOM body exists
            return;
        // End body and duplicate check
        }
        // Ensure styles are injected before rendering controls
        injectStyles();
        // Create root container for UI controls
        const root = createEl('div', { id: ROOT_ID });
        // Create floating toggle pill button
        const toggleBtn = createEl('button', { id: 'ig-kw-toggle', type: 'button' });
        // Create collapsible management panel
        const panel = createEl('div', { id: 'ig-kw-panel' });
        // Create panel header bar
        const header = createEl('div', { className: 'ig-kw-header' });
        // Create panel heading
        const title = createEl('h3', { className: 'ig-kw-title', text: 'Blocked Words' });
        // Create panel close button
        const closeBtn = createEl('button', { type: 'button', className: 'ig-kw-close', text: '×', ariaLabel: 'Close panel' });
        // Create form for adding new words
        const form = createEl('form', { className: 'ig-kw-form' });
        // Create text input field
        const input = createEl('input', { type: 'text', className: 'ig-kw-input', placeholder: 'Enter word or phrase...' });
        // Create submit button
        const addBtn = createEl('button', { type: 'submit', className: 'ig-kw-add', text: 'Add' });
        // Create keyword chips container
        const listEl = createEl('div', { className: 'ig-kw-list' });
        // Create footer row
        const footer = createEl('div', { className: 'ig-kw-footer' });
        // Create clear-all button
        const clearBtn = createEl('button', { type: 'button', className: 'ig-kw-clear', text: 'Clear all' });

        // Refresh UI state and re-filter feed posts after any keyword change
        const syncAndRefresh = (nextKeywords) => {
            // Persist updated keyword list
            saveKeywords(nextKeywords);
            // Re-render chips and badge count
            renderUIState(toggleBtn, listEl, clearBtn, nextKeywords, handleRemove);
            // Re-evaluate feed posts immediately
            filterPosts();
        // End syncAndRefresh helper
        };

        // Remove a single keyword from the active list
        const handleRemove = (targetWord) => {
            // Load current list and exclude target word
            const nextKeywords = loadKeywords().filter((word) => {
                // Keep words that do not match the removed entry
                return word !== targetWord;
            // End filter predicate
            });
            // Persist changes and update DOM
            syncAndRefresh(nextKeywords);
        // End handleRemove handler
        };

        // Handle new keyword form submission
        form.addEventListener('submit', (event) => {
            // Prevent page reload on submit
            event.preventDefault();
            // Normalize user-entered text
            const word = normalizeKeyword(input.value);
            // Ignore empty submissions
            if (!word) {
                // Exit early on blank input
                return;
            // End blank input check
            }
            // Load existing keywords
            const current = loadKeywords();
            // Append word only if not already present
            if (!current.includes(word)) {
                // Save expanded keyword list and refresh feed
                syncAndRefresh(current.concat(word));
            // End duplicate check
            }
            // Clear input field after adding
            input.value = '';
        // End submit listener
        });

        // Toggle panel visibility when clicking the floating pill button
        toggleBtn.addEventListener('click', () => {
            // Toggle open CSS class on panel
            panel.classList.toggle('open');
        // End toggle click listener
        });

        // Close panel when clicking the close button
        closeBtn.addEventListener('click', () => {
            // Remove open CSS class from panel
            panel.classList.remove('open');
        // End close click listener
        });

        // Clear all stored keywords when clicking Clear all
        clearBtn.addEventListener('click', () => {
            // Persist empty list and restore hidden posts
            syncAndRefresh([]);
        // End clear click listener
        });

        // Assemble header elements
        header.appendChild(title);
        // Append close button to header
        header.appendChild(closeBtn);
        // Assemble form elements
        form.appendChild(input);
        // Append submit button to form
        form.appendChild(addBtn);
        // Assemble footer elements
        footer.appendChild(clearBtn);
        // Assemble panel sections
        panel.appendChild(header);
        // Append form to panel
        panel.appendChild(form);
        // Append chips list to panel
        panel.appendChild(listEl);
        // Append footer to panel
        panel.appendChild(footer);
        // Append panel and floating button to root
        root.appendChild(panel);
        // Append toggle button to root
        root.appendChild(toggleBtn);
        // Mount root UI container onto document body
        document.body.appendChild(root);

        // Perform initial UI render with persisted keywords
        renderUIState(toggleBtn, listEl, clearBtn, loadKeywords(), handleRemove);
    // End mountUI function
    };

    // Initialize styles, UI, filtering, and DOM observer
    const init = () => {
        // Inject styles immediately
        injectStyles();
        // Mount floating UI once body exists
        mountUI();
        // Run initial feed filtering pass
        filterPosts();
    // End init function
    };

    // Defer full UI mount until DOMContentLoaded if document is still loading
    if (document.readyState === 'loading') {
        // Register DOMContentLoaded listener to mount UI
        document.addEventListener('DOMContentLoaded', init);
    // Run initialization immediately when document is already interactive or complete
    } else {
        // Invoke startup routine right away
        init();
    // End readyState check
    }

    // Observe dynamic Instagram SPA DOM updates
    const observer = new MutationObserver(() => {
        // Ensure UI remains mounted across SPA body replacements
        mountUI();
        // Trigger debounced keyword filtering on new posts
        scheduleFilter();
    // End observer callback
    });

    // Attach MutationObserver to root element for subtree changes
    observer.observe(document.documentElement, {
        // Monitor added or removed child nodes
        childList: true,
        // Monitor all nested descendants
        subtree: true
    // End observe options
    });

// Invoke outer IIFE immediately
})();

