export function calculateZeroPercentage(str) {
    let zeroCount = 0;
    let totalPieces = 0;

    // Iterate through the string with a step of 2
    for (let i = 0; i < str.length - 1; i += 2) {
        // Extract the pair of characters
        let piece = str.substring(i, i + 2);
        
        totalPieces++;
        
        if (piece === "00") {
            zeroCount++;
        }
    }

    // Avoid division by zero if string is empty
    if (totalPieces === 0) return 0;

    // Return the decimal value (e.g., 0.62 for 62%)
    return (1-zeroCount / totalPieces);
}