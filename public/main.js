function scrollToCard(cardId) {
    document.getElementById(cardId).scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center'
    });
}

// Turn off AOS on smaller screens
if (window.innerWidth < 800){
    duration = { duration: 0};
} else {
    duration = { duration: 1000};
}

AOS.init(duration);
