/*

The following script does three separate tasks:

1) Defines the 'scrollToCard' method which allows the links in the
navbar to scroll to the center of the card (instead of scrolling too
far up or down).

2) A script which checks through every 'card' element in the DOM and
their respective images. It checks if the images are too wide which makes
the text render incorrectly (they make the text width tiny and appear
as long, skinny, tall columns). If the image is too wide, it sets the 
parent to a column flexbox, so the text is displayed UNDER the image
(where there is plenty of space) instead of squishing it in BESIDE the image.

3) Turns off the Animate On Scroll script for mobile devices. Not sure
why, but the script causes glitches on mobile, I think due to the small
screen size. So, instead of an actual mobile device check, I just call
AOS with duration=0 (effectively doing nothing and disabling it) if the
screen size is below a threshold.

*/

//////////////////////////////////////////////////////////////////////////////////// SECTION 1

function scrollToCard(cardId) {
    document.getElementById(cardId).scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center'
    });
}

//////////////////////////////////////////////////////////////////////////////////// SECTION 2

//Random util helper function converts pixel size to rem
function convertPixelsToRem(px) {    
    return px / parseFloat(getComputedStyle(document.documentElement).fontSize);
}
 
//If the text does not have this much space (in rem) then
//it will render under the image, with all the space it needs
MinTextRemWidth = 40;

var cardBodies = document.querySelectorAll('.cardBody');
for (let index = 0; index < cardBodies.length; ++index) {
    let cardBody = cardBodies[index];
    let cardImage = cardBody.querySelector('.cardImage');
    
    cardImage.addEventListener('load', () => {
        let imgWidth = cardImage.getBoundingClientRect().width;
        let boxWidth = cardBody.getBoundingClientRect().width;

        if (convertPixelsToRem(boxWidth - imgWidth) < MinTextRemWidth) {
            cardBody.setAttribute('style', 'flex-direction: column;')
        }
    })
}

//////////////////////////////////////////////////////////////////////////////////// SECTION 3

AosThreshold = 800; //Screens smaller than this (in pixels) will have AOS disabled
if (window.innerWidth < 800){
    duration = { duration: 0};
} else {
    duration = { duration: 1000};    
    var names = document.getElementsByName('name');
    names.forEach(name => {
        name.setAttribute('data-aos-duration', 3000);
    })
}
AOS.init(duration);
