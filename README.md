# HELLSHIFT — Browser FPS / Build 001.1

An original, lightweight retro first-person browser game built with HTML, CSS and JavaScript. It is inspired by early raycasting shooters, but uses original code, map layout and enemy art. It does not include DOOM's copyrighted game data, graphics, sounds, levels or source assets.

## Run
Open `index.html`, or upload `index.html`, `style.css`, and `game.js` to a GitHub repository and enable GitHub Pages.

## Controls
- Desktop: WASD to move, arrow keys to turn, Space/Enter to fire, Escape to pause.
- Mouse: click the view to capture pointer; move mouse to look.
- Mobile: directional pad to move, turn buttons to rotate, FIRE to shoot.

## Gameplay
Clear six mechanical sentries in the Foundry sector. Each sentry takes two hits. Ammo and armor are limited; sentries move toward the player and periodically damage armor at close range. The exit unlocks when all six are disabled.

No external libraries, accounts, APIs or build tools are required. A connection may be needed only to load the optional Google Fonts; system fonts are used as fallbacks.

## Mobile controls update
- Status HUD moved to the top of the viewport so it no longer collides with touch controls.
- Left D-pad: move forward, backward and strafe.
- Swipe on the game view: turn / look around.
- Turn-left button for precise adjustment.
- FIRE button shoots; R button reloads.
- Desktop: press R to reload.


## Build 002 fixes
- Player spawn moved onto a verified open tile, facing into the starting corridor.
- Mobile movement buttons now capture and release pointer input reliably, preventing stuck or ignored movement.
- Turning controls also capture touch input and reset cleanly when focus changes.
