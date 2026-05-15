# Instagram Focus Tools for Safari (iOS)

A collection of minimalist Userscripts to clean up Instagram on iPhone Safari, helping you stay intentional with your screen time.

## Scripts

### 1. Reels Icon Remover (`reels.icon.remover.js`)
- **Function**: Removes only the Reels clapperboard icon from the bottom navigation bar.
- **Safety**: Does not affect profiles or any other part of the UI.

### 2. Content Cleaner (`instagram.content.cleaner.js`)
- **Function**: Hides "Suggested for you", "Suggested Reels", and "Recommended" sections.
- **Context-Aware**: Only runs on the main home feed.

### 3. Repost Remover (`instagram.repost.remover.js`)
- **Function**: Removes posts that are reshared or reposted by accounts you follow.
- **UI Cleaning**: Also hides the "Repost" button from the action bar under every post.
- **Context-Aware**: Only hides full posts on the home feed, while hiding the button globally.

### 4. Following Switcher (`instagram.following.switcher.js`)
- **Function**: Automatically forces Instagram to the "Following" feed instead of "For You".
- **Stability**: Checks for URL parameters and UI elements to ensure you never land on the algorithmic feed.

## Installation for iPhone

1. **Install a Script Manager**: Download the [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) extension from the App Store.
2. **Enable Extension**: 
   - Open iPhone **Settings** -> **Safari** -> **Extensions**.
   - Turn on **Userscripts**.
3. **Add the Scripts**:
   - Copy the `.js` files from this repository.
   - Open the **Files** app on your iPhone.
   - Navigate to the **Userscripts** folder and paste the files.
4. **Browse Focus**: Open Instagram in Safari. Your feed will now be much cleaner.

## Tech Stack
- **JavaScript**: For DOM manipulation and dynamic content observation.
- **CSS**: For robust element hiding with `!important` overrides.

## License
MIT.
