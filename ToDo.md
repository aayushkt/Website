Here's all the source code for my website, available at http://aayushkt.com (hopefully)

# Todo:
## Constellation.js:
- Take into account screen size/space and fill it with the right number of particles/links
- Links alpha are currently minimum of the start/end vertices alpha, see if max or avg is better
- Play around with particle size, link speed, link fade speed, etc.
- Delauney triangulation? (or some kind of nearest-neighbor algorithm)
- Figure out link spawning/splitting so there's always ~maxLinks number of links active
- Particle movement when mouse is/isn't moving
- Experiment with flicker? Maybe have the particles fill in iff they they are touching a link?
- Particles drifting outside the canvas range should reset somehow (preferably without glitching out any related links)

## General:
- Fix phone screen formatting
- Clean up tags with external .css files (aka fill out main.css)
- Play around with aos settings/animations
- Remove the data-bs-theme tag from HTML element while keeping the text white
- Eventually have separate webpages for a more detailed about section, Chopstix, Constellation.js, and more
- Add a down scroll arrow to show people to scroll down from the landing page