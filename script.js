function arrayRemove(arr, value) {
   return arr.filter(function(ele){
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
