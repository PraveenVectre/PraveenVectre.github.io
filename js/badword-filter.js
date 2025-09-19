// === CONFIG ===
// Change mode to "replace" or "block"
const BADWORD_MODE = "replace"; // or "replace"

let badWords = [];

// Load both JSON files
Promise.all([
    fetch('/badwords/english.json').then(res => res.json()),
    fetch('/badwords/hindi.json').then(res => res.json())
]).then(([english, hindi]) => {
    badWords = [...new Set([...english, ...hindi])];
    console.log(`✅ Bad words loaded: ${badWords.length} entries`);
}).catch(err => console.error("❌ Failed to load bad words:", err));

// Escape regex special characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// Check if message contains bad words
function containsBadWord(text) {
    let found = badWords.some(word => text.includes(word));

    if (found) {
        console.log("Match found");
        return true;
    } else {
        console.log("No match found");
        return false;
    }
}

function replaceOddPositions(word, replacementChar) {
  let charArray = word.split(''); // Convert string to array of characters

  for (let i = 1; i < charArray.length; i++) {
    // Check if the current position (i + 1 for 1-based index) is odd
    if ((i + 1) % 2 !== 0) {
      charArray[i] = replacementChar; // Replace the character at the odd position
    }
  }

  return charArray.join(''); // Join the array back into a string
}
function checkWords(text) {
    let message = text.trim();
    if (!message) return;

    if (BADWORD_MODE === "block") {
        if (containsBadWord(message)) {
            return {"msg": `⚠️ कृपया अपमानजनक शब्दों का प्रयोग न करें|`, "status": 1};
        }
    }
    else if (BADWORD_MODE === "replace") {
        if (containsBadWord(message)) {
            let replacedWord = replaceOddPositions(message, '*');
            return {"msg": `⚠️ कृपया <b>${replacedWord}</b> ऐसें शब्दों का प्रयोग न करें|`, "status": 1};
        }
    }
    return {"msg": "✅ No bad words found.", "status": 0, "cleanMessage": message};
}
