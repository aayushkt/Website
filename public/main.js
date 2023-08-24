function scrollToCard(cardId) {
    document.getElementById(cardId).scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center'
    });
}