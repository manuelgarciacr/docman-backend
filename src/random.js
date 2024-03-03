import crypto from "crypto";

const getRandomInt = (min, max) => {
    const arr = new Uint32Array(1);

    crypto.getRandomValues(arr);
    
    // This jazz is necessary to translate from a random integer to a floating point from 0 to 1
    const f = arr[0] / (0xffffffff + 1);
    
    return Math.floor(f * (max - min + 1)) + min;
}

export {getRandomInt}
