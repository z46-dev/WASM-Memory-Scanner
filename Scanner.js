class Scanner {
    /**
     * Creates a WASM memory scanner
     * This is used to find patterns in the WASM memory heaps
     * It finds patterns by scanning the heap for a specific value
     * We can scan for repeating values, or just provided patterns
     */
    constructor() {
        this.index = 0;

        this.heap = new Uint8Array(0);
    }

    /**
     * Set the heap of which to scan
     * @param {Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array} heap A TypedArray of the WASM memory heap
     * @returns {Scanner} The scanner instance
     */
    setHeap(heap) {
        this.heap = heap;
        return this;
    }

    /**
     * Scan for a repeating value in the heap
     * @param {Number} value The value to scan for
     * @param {Number} timesInRow The amount of times the value should be repeated in a row
     * @returns {Number[]} An array of indexes where the value was found
     */
    scanRepeatingValue(value, timesInRow = 8) {
        let found = [],
            index = 0;

        while (index < this.heap.length) {
            if (this.heap[index] === value) {
                let foundTimes = 0;

                for (let i = index; i < index + timesInRow; i++) {
                    if (this.heap[i] === value) {
                        foundTimes++;
                    }
                }

                if (foundTimes === timesInRow) {
                    found.push(index);

                    index += timesInRow;
                    
                    continue;
                }
            }

            index++;
        }

        return found;
    }

    /**
     * Scan for a pattern in the heap
     * @param {...Number} pattern The pattern to scan for
     * @returns {Number[]} An array of indexes where the pattern was found
     * @example
     * // Scan for the pattern 0x00, 0x01, 0x02, 0x03
     * scanner.scanPattern(0x00, 0x01, 0x02, 0x03);
     * @example
     * // Scan for the pattern 0x00, 0x01, 0x02, 0x03, 0x04, 0x06, 0x07, 0x08, with a wildcard at 0x05's position
     * scanner.scanPattern(0x00, 0x01, 0x02, 0x03, 0x04, null, 0x06, 0x07, 0x08);
     */
    scanPattern(...pattern) {
        let found = [],
            index = 0;

        // Scan the heap for the pattern
        mainScan: while (index < this.heap.length) {
            let foundPattern = true;

            // Starting at the index, scan for the pattern
            patternScan: for (let i = 0; i < pattern.length; i++) {
                // "null" is a wildcard, it will match any value
                if (pattern[i] === null) {
                    continue;
                }

                // If the value at the index is not the same as the pattern, it's not a match
                if (this.heap[index + i] !== pattern[i]) {
                    foundPattern = false;
                    break patternScan;
                }
            }

            // If the pattern was found, add the index to the found array
            if (foundPattern) {
                found.push(index);

                index += pattern.length;

                continue mainScan;
            }

            index++;
        }

        return found;
    }
}
