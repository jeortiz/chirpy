
const profaneWords = ["kerfuffle", "sharbert", "fornax"];

export function validateChirp(chirp: string): boolean {

    if (chirp.length <= 140) {
        return true;
    }

    return false;
}

export function cleanChirp(chirp: string): string {
    const cleaned = chirp.split(" ").map( (word) => {
        if (profaneWords.includes(word.toLowerCase())) {
            return "****";
        } 
        return word;
        
    });

    return cleaned.join(" ");
}