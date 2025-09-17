function randomDelay(max, min) {
    const time = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = {
    randomDelay
};