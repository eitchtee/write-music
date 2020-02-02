var sTwo = new Howl({
  src: [
    "https://cdn.glitch.com/a0f1f35c-b88a-4f7b-a72e-9f46d39647e0%2F316898__jaz-the-man-2__do.wav?v=1580617302242"
  ]
});

var sFour = new Howl({
  src: [
    "https://cdn.glitch.com/a0f1f35c-b88a-4f7b-a72e-9f46d39647e0%2F316908__jaz-the-man-2__re.wav?v=1580624636002"
  ]
});

var sSix = new Howl({
  src: [
    "https://cdn.glitch.com/a0f1f35c-b88a-4f7b-a72e-9f46d39647e0%2F316906__jaz-the-man-2__mi.wav?v=1580624747025"
  ]
});

var sTwelve = new Howl({
  src: [
    "https://cdn.glitch.com/a0f1f35c-b88a-4f7b-a72e-9f46d39647e0%2F316904__jaz-the-man-2__fa.wav?v=1580624804648"
  ]
});

var sElse = new Howl({
  src: [
    "https://cdn.glitch.com/a0f1f35c-b88a-4f7b-a72e-9f46d39647e0%2F316912__jaz-the-man-2__sol.wav?v=1580624838070"
  ]
});

var soundsArray = [sTwo, sFour, sSix, sTwelve, sElse];

// isolated layer wrapper (for the local variables)
(function(_W) {
  var cache = [], // will store all timeouts IDs
    _set = _W.setTimeout, // save original reference
    _clear = _W.clearTimeout; // save original reference

  // Wrap original setTimeout with a function
  _W.setTimeout = function(CB, duration) {
    // also, wrap the callback, so the cache referece will be removed
    // when the timerout has reached (fired the callback)
    var id = _set(function() {
      CB();
      removeCacheItem(id);
    }, duration || 0);

    cache.push(id); // store reference in the cache array

    // id must be returned to the user could save it and clear it if they choose to
    return id;
  };

  // Wrap original clearTimeout with a function
  _W.clearTimeout = function(id) {
    _clear(id);
    removeCacheItem(id);
  };

  // Add a custom function named "clearTimeouts" to the "window" object
  _W.clearTimeouts = function() {
    cache.forEach(n => _clear(n));
    cache.length = [];
  };

  // removes a specific id from the cache array
  function removeCacheItem(id) {
    var idx = cache.indexOf(id);

    if (idx > -1) cache = cache.filter(n => n != id);
  }
})(window);

function arrayRemove(arr, value) {
  return arr.filter(function(ele) {
    return ele != value;
  });
}


function whatShouldWeHightlight(input) {
  // Only god himself knows what happens here
  var inputArray = input.match(/(\p{L}?[^\.!\?]+[\.!\?]+)|(.+[^\.!\?]+$)/gu);
  var highlightResult = [];

  var last_index = 0;

  // Iterates through the sentences matched by the regex
  if (inputArray) {
    for (sentence of inputArray) {
      var color;
      if (sentence.replace(" ", "") != "") {
        // Replacement for regex \b, for better non-ascii chars support.
        var splitSentence = arrayRemove(sentence.split(" "), "");
        var splitSentenceLen = splitSentence.length;

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

        // Gets the starting and ending indexes of the sentence to avoid highlighting similiar sentences or words multiple times.
        var start_index = input.indexOf(sentence.trim(), last_index);
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
$(".text").highlightWithinTextarea({
  highlight: whatShouldWeHightlight
});


function playAudio(soundType, highlight, i) {
  window.setTimeout(function() {
    $(".text").highlightWithinTextarea({ highlight: [highlight] });
    soundsArray[soundType].play();
    if (i >= arrayHighlight.length - 1) {
      $(".text").attr("disabled", false);
      $(".text").highlightWithinTextarea({ highlight: whatShouldWeHightlight });
      $("#listen").text("Play");
      $(".text").focus();
    }
  }, 750 * i);
  var input = document.getElementsByClassName("text")[0].value;
  var arrayHighlight = whatShouldWeHightlight(input);
}

document.getElementById("listen").onclick = function() {
  if ($("#listen").text() == "Stop") {
    console.log("STOP");
    window.clearTimeouts();
    $(".text").attr("disabled", false);
    $(".text").highlightWithinTextarea({ highlight: whatShouldWeHightlight });
    $("#listen").text("Play");
    $(".text").focus();
    return;
  }
  
  $("#listen").text("Stop");
  $(".text").attr("disabled", true);
  $(".text").highlightWithinTextarea({ highlight: [] });

  var input = document.getElementsByClassName("text")[0].value;
  var arrayHighlight = whatShouldWeHightlight(input);
  var soundType = 0;
  var i = 0;

  for (mark of arrayHighlight) {
    var note = mark.className;
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
};
