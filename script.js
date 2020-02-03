const sTwo = new Howl({
    src: [
        "./sounds/do.wav"
    ]
});

const sFour = new Howl({
    src: [
        "./sounds/re.wav"
    ]
});

const sSix = new Howl({
    src: [
        "./sounds/mi.wav"
    ]
});

const sTwelve = new Howl({
    src: [
        "./sounds/sol.wav"
    ]
});

const sElse = new Howl({
    src: [
        "./sounds/la.wav"
    ]
});

const soundsArray = [sTwo, sFour, sSix, sTwelve, sElse];

let textBox = $(".text");
let playButton = $('.play-button');


// Wrapper to setTimeout that allows the easy removable of all timeouts set
// isolated layer wrapper (for the local variables)
(function (_W) {
    let cache = [], // will store all timeouts IDs
        _set = _W.setTimeout, // save original reference
        _clear = _W.clearTimeout; // save original reference

    // Wrap original setTimeout with a function
    _W.setTimeout = function (CB, duration) {
        // also, wrap the callback, so the cache reference will be removed
        // when the timeout has reached (fired the callback)
        const id = _set(function () {
            CB();
            removeCacheItem(id);
        }, duration || 0);

        cache.push(id); // store reference in the cache array

        // id must be returned to the user could save it and clear it if they choose to
        return id;
    };

    // Wrap original clearTimeout with a function
    _W.clearTimeout = function (id) {
        _clear(id);
        removeCacheItem(id);
    };

    // Add a custom function named "clearTimeouts" to the "window" object
    _W.clearTimeouts = function () {
        cache.forEach(n => _clear(n));
        cache.length = [];
    };

    // removes a specific id from the cache array
    function removeCacheItem(id) {
        const idx = cache.indexOf(id);

        if (idx > -1) cache = cache.filter(n => n !== id);
    }
})(window);

function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele !== value;
    });
}


function whatShouldWeHighlight(input) {
    // Only god himself knows what happens here
    const inputArray = input.match(/(\p{L}?[^.!?]+[.!?]+)|(.+[^.!?]+$)/gu);
    const highlightResult = [];

    let last_index = 0;

    // Iterates through the sentences matched by the regex
    if (inputArray) {
        let sentence;
        for (sentence of inputArray) {
            let color;
            if (sentence.replace(" ", "") !== "") {
                // Replacement for regex \b, for better non-ascii chars support.
                const splitSentence = arrayRemove(sentence.split(" "), "");
                const splitSentenceLen = splitSentence.length;

                // set the color based on length
                if (splitSentenceLen <= 2) {
                    color = "two";
                } else if (splitSentenceLen <= 4) {
                    color = "four";
                } else if (splitSentenceLen <= 6) {
                    color = "six";
                } else if (splitSentenceLen <= 12) {
                    color = "twelve";
                } else {
                    color = "else";
                }

                // Gets the starting and ending indexes of the sentence to avoid highlighting
                // similar sentences or words multiple times.
                const start_index = input.indexOf(sentence.trim(), last_index);
                last_index = start_index + (sentence.trim().length - 1);

                // Adds the sentence and its respective highlight color to the wrapper
                highlightResult.push({
                    highlight: [start_index, last_index + 1],
                    className: color
                });
            }
        }
    }

    return highlightResult;
}

// Highlights the text. Plugin @ https://github.com/lonekorean/highlight-within-textarea/
textBox.highlightWithinTextarea({
    highlight: whatShouldWeHighlight
});


function playAudio(soundType, highlight, i) {
    const input = textBox.val();
    const arrayHighlight = whatShouldWeHighlight(input);

    window.setTimeout(function () {
        textBox.highlightWithinTextarea({highlight: [highlight]});
        soundsArray[soundType].play();
        if (i >= arrayHighlight.length - 1) {  // resets the view if all the sounds have played.
            window.setTimeout(function () {  // waits before resetting for a better visual experience.
                textBox.attr("disabled", false);
                textBox.highlightWithinTextarea({highlight: whatShouldWeHighlight});
                playButton.html('<i class="fas fa-play"></i>');
                textBox.focus();
            }, 800);
        }
    }, 500 * i); // set the timeout time the current sentence iteration, so it doesn't fire all at once.

}

playButton.click(function () {
    // Reset the view if the stop button is pressed
    if (playButton.html() === '<i class="fas fa-pause"></i>') {
        window.clearTimeouts();  // Stop and clear the sound timeouts
        textBox.attr("disabled", false);
        textBox.highlightWithinTextarea({highlight: whatShouldWeHighlight});
        playButton.html('<i class="fas fa-play"></i>');
        textBox.focus();
        return;
    }

    const input = textBox.val();
    const arrayHighlight = whatShouldWeHighlight(input);
    let soundType = 0;
    let i = 0;

    if (arrayHighlight.length >= 1) {
        playButton.html('<i class="fas fa-pause"></i>');
        textBox.attr("disabled", true);
    } else {
        return;
    }

    let mark;
    for (mark of arrayHighlight) {
        const note = mark.className;
        // Checks the marks (length based) and set the appropriate sound.
        switch (note) {
            case "two":
                soundType = 0;
                break;
            case "four":
                soundType = 1;
                break;
            case "six":
                soundType = 2;
                break;
            case "twelve":
                soundType = 3;
                break;
            case "else":
                soundType = 4;
        }

        playAudio(soundType, mark, i);
        i++;
    }
});
