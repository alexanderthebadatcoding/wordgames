import { useState, useEffect, SetStateAction } from "react";
import { Check, X, RefreshCw, Trophy, Plus, Share2, Copy } from "lucide-react";
import { sdk } from "@farcaster/miniapp-sdk";
import { HelpCircle } from "lucide-react";

const defaultPuzzles = [
  {
    words: ["Big", "Back", "Yard", "Stick", "Shift", "Key", "West", "Coast"],
    phrases: [
      "Big Back",
      "Back Yard",
      "Yard Stick",
      "Stick Shift",
      "Shift Key",
      "Key West",
      "West Coast",
    ],
  },
  {
    words: ["Hot", "Dog", "House", "Party", "Time", "Zone", "Defense"],
    phrases: [
      "Hot Dog",
      "Dog House",
      "House Party",
      "Party Time",
      "Time Zone",
      "Zone Defense",
    ],
  },
];

// Encode puzzle to base64 URL-safe string
function encodePuzzle(words: string[]) {
  const json = JSON.stringify(words);
  const base64 = btoa(json);
  // Make URL-safe by replacing characters
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Decode puzzle from base64 URL-safe string
function decodePuzzle(encoded: string) {
  try {
    // Restore base64 characters
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }
    const json = atob(base64);
    const words = JSON.parse(json);

    // Calculate phrases
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
    }

    return { words, phrases };
  } catch (e) {
    return null;
  }
}

function CreatePuzzle({
  onClose,
}: {
  onClose: () => void;
  onSave: (puzzle: { words: string[]; phrases: string[] }) => void;
}) {
  const [words, setWords] = useState(["", "", "", "", ""]);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const addWord = () => {
    setWords([...words, ""]);
  };

  const updateWord = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const removeWord = (index: number) => {
    if (words.length > 4) {
      setWords(words.filter((_, i) => i !== index));
    }
  };

  const generateShareUrl = () => {
    const validWords = words.filter((w) => w.trim().length > 0);
    if (validWords.length < 4) {
      alert("Please add at least 4 words!");
      return;
    }

    const encoded = encodePuzzle(validWords);
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?p=${encoded}`;
    setShareUrl(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToFarcaster = async () => {
    try {
      const result = await sdk.actions.composeCast({
        text: `🧩 I created a custom Before & After puzzle! Can you solve it?\n\nTry it here:`,
        embeds: [shareUrl],
      });

      if (result?.cast) {
        console.log("Cast shared:", result.cast.hash);
      }
    } catch (error) {
      console.error("Failed to share cast:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Create Your Puzzle
      </h2>
      <p className="text-gray-600 mb-6">
        Add words that connect to form phrases (e.g., "Hot", "Dog", "House" =
        "Hot dog" + "Dog house")
      </p>

      <div className="space-y-3 mb-6">
        {words.map((word, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="text"
              value={word}
              onChange={(e) => updateWord(index, e.target.value)}
              placeholder={`Word ${index + 1}`}
              className="flex-1 text-lg font-semibold border-2 text-indigo-800 border-gray-300 focus:border-indigo-500 outline-none px-4 py-2 rounded-lg"
            />
            {words.length > 4 && (
              <button
                onClick={() => removeWord(index)}
                className="text-red-500 hover:text-red-700 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        {words.length < 10 && (
          <button
            onClick={addWord}
            className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 text-gray-600 hover:text-indigo-600 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Word
          </button>
        )}
      </div>

      {!shareUrl ? (
        <div className="flex gap-3">
          <button
            onClick={generateShareUrl}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Generate Link
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-100 p-4 rounded-lg break-all text-sm text-gray-700">
            {shareUrl}
          </div>
          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Copy className="w-5 h-5" />
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={shareToFarcaster}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Cast
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full mt-4 text-gray-600 hover:text-gray-800 hover:bg-gray-300 font-semibold py-2 border-2 border-gray-300 rounded-lg"
      >
        Cancel
      </button>
    </div>
  );
}

function BeforeAfterGame({
  puzzle,
  onNewPuzzle,
}: {
  puzzle: { words: string[]; phrases: string[] };
  onNewPuzzle: () => void;
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(1);
  const [input, setInput] = useState("");
  const [solvedWords, setSolvedWords] = useState([0]);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    message: string;
  } | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const currentWord = puzzle.words[currentWordIndex];
  const isComplete = currentWordIndex >= puzzle.words.length;
  const revealedLetters = Math.min(
    hintsUsed + 1,
    currentWord ? currentWord.length : 0
  );

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const userAnswer = input.trim().toLowerCase();
    const correctAnswer = currentWord.slice(revealedLetters).toLowerCase();

    if (userAnswer === correctAnswer) {
      setFeedback({
        type: "correct",
        message: `Correct! "${puzzle.phrases[currentWordIndex - 1]}"`,
      });
      setSolvedWords([...solvedWords, currentWordIndex]);

      setTimeout(() => {
        if (currentWordIndex < puzzle.words.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setInput("");
          setFeedback(null);
          setHintsUsed(0);
        }
      }, 1500);
    } else {
      setFeedback({ type: "wrong", message: "Try again!" });
    }
  };

  const handleHint = () => {
    if (hintsUsed < currentWord.length - 1) {
      setHintsUsed(hintsUsed + 1);
      setFeedback(null);
    }
  };
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <button
          onClick={onNewPuzzle}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Your Own
        </button>
      </div>
      <div className="bg-white rounded-2xl p-8 shadow-2xl">
        {!isComplete ? (
          <>
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                Word Chain
              </h3>
              <div className="space-y-2">
                {puzzle.words.map((word, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`w-40 text-right text-2xl font-bold ${
                        solvedWords.includes(index)
                          ? "text-green-700"
                          : index === currentWordIndex
                            ? "text-indigo-700"
                            : "text-gray-400"
                      }`}
                    >
                      {solvedWords.includes(index)
                        ? word
                        : index === currentWordIndex
                          ? `${word[0]}...`
                          : word[0]}
                    </div>
                    {solvedWords.includes(index) && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Complete the word that connects with{" "}
                <span className="font-bold text-indigo-700">
                  {puzzle.words[currentWordIndex - 1]}
                </span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-indigo-700">
                    {currentWord.slice(0, revealedLetters)}
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type the rest..."
                    className="flex text-2xl font-semibold border-b-4 border-indigo-400 focus:border-indigo-700 outline-none px-2 py-2 text-gray-900"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    Submit Answer
                  </button>
                  <button
                    type="button"
                    onClick={handleHint}
                    disabled={hintsUsed >= currentWord.length - 1}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    Hint
                  </button>
                </div>
              </form>
            </div>

            {feedback && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 ${
                  feedback.type === "correct"
                    ? "bg-green-100 text-green-800 border-2 border-green-300"
                    : "bg-red-100 text-red-800 border-2 border-red-300"
                }`}
              >
                {feedback.type === "correct" ? (
                  <Check className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <X className="w-6 h-6 flex-shrink-0" />
                )}
                <span className="font-semibold">{feedback.message}</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Puzzle Complete!
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              Great job solving all the words!
            </p>
            <button
              onClick={onNewPuzzle}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              Try Another Puzzle
            </button>
          </div>
        )}
      </div>
      <button
        onClick={() => setShowInstructions(true)}
        className="text-indigo-600 hover:text-indigo-800 font-semibold text-medium flex items-center gap-1"
      >
        <HelpCircle className="w-5 h-5" />
        How to Play
      </button>
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              How to Play
            </h3>
            <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-300">
              <p className="text-sm text-indigo-900 font-medium">
                Each word connects with the previous one to form a common
                phrase. Like Hot Dog, then Dog house, etc. Type the letters
                after the first one to complete each word!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentPuzzle] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [customPuzzle, setCustomPuzzle] = useState<{
    words: string[];
    phrases: string[];
  } | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        await sdk.actions.ready();

        // Check for shared puzzle in URL
        const urlParams = new URLSearchParams(window.location.search);
        const puzzleParam = urlParams.get("p");

        if (puzzleParam) {
          const decoded = decodePuzzle(puzzleParam);
          if (decoded) {
            setCustomPuzzle(decoded);
          }
        }

        setIsReady(true);
      } catch (error) {
        console.error("Failed to initialize Farcaster SDK:", error);
        setIsReady(true);
      }
    };

    initApp();
  }, []);

  const handleSaveCustomPuzzle = (
    puzzle: SetStateAction<{ words: string[]; phrases: string[] } | null>
  ) => {
    setCustomPuzzle(puzzle);
    setShowCreate(false);
  };

  const activePuzzle = customPuzzle || defaultPuzzles[currentPuzzle];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Before & After
          </h1>
        </div>
        <main>
          {isReady ? (
            showCreate ? (
              <CreatePuzzle
                onClose={() => setShowCreate(false)}
                onSave={handleSaveCustomPuzzle}
              />
            ) : (
              <BeforeAfterGame
                puzzle={activePuzzle}
                onNewPuzzle={() => setShowCreate(true)}
              />
            )
          ) : (
            <div className="text-center text-indigo-600 py-8">Loading...</div>
          )}
        </main>
      </div>
    </div>
  );
}
