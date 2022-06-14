const execute = async (message, wordList) => {
    if (!wordList) return {
        verify: false,
        word: null
    }

    // checks here
    const parsedContent = JSON.stringify(message).toString().toLowerCase().split("_").join(" ").split("-").join(" ")

    for (let w of wordList) {
        const word = w.toString().toLowerCase().trim()
        if (parsedContent.search(new RegExp(`(\\W(${word})\\W)|(_${word}_)|${word}`, 'g', 'm', 'u')) === -1) continue
        return {
            verify: true,
            word: word
        }
    }
    return {
        verify: false,
        word: null
    }
}

module.exports = {
    commandType: "ultils",
    execute
}