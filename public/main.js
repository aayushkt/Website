/*

The following script does four separate tasks:

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

4) Scrolls to the next section. The next section is the first section in 
the DOM whose top is below 2/3rds the screen height (so if its top is 
peeking just above the bottom of the page, it still qualifies). If the 
section is the last one (technically second last since theres an empty
section for spacing at the bottom), then the img is flipped to scroll back
up.

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
    

    if (cardImage != null){
        cardImage.addEventListener('load', () => {
            let imgWidth = cardImage.getBoundingClientRect().width;
            let boxWidth = cardBody.getBoundingClientRect().width;
    
            if (imgWidth > 550) {
                cardImage.setAttribute('style', 'max-width: 550px;');
                imgWidth = 550;
            }
    
            if (convertPixelsToRem(boxWidth - imgWidth) < MinTextRemWidth) {
                cardBody.setAttribute('style', 'flex-direction: column;')
            }
        })
    }
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

//////////////////////////////////////////////////////////////////////////////////// SECTION 4

isUpsideDown = false; // keeps track if arrow is pointing up or down
// pointing up means it's upside down
function goToNextSection() {

    if (isUpsideDown) { // if it's upside down, scroll to top and flip it back
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        let scrollHelper = document.querySelector('.scrollHelper');
        scrollHelper.removeAttribute('style');
        isUpsideDown = false;
        return;
    }

    let sections = document.querySelectorAll('.section');
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    for (let index = 0; index < sections.length; ++index) {
        if (sections[index].getBoundingClientRect().top > viewHeight * 2/ 3) {
            sections[index].scrollIntoView();


            if (index >= sections.length - 2){
                // if we scrolled to the bottom, flip the image to scroll up now
                console.log('flipping')
                let scrollHelper = document.querySelector('.scrollHelper');
                scrollHelper.setAttribute('style', 'transform: rotateX(180deg);')
                isUpsideDown = true;
            }
            return;
        }
        
    }
}