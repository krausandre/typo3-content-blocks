/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
class InteractionRequest {
    constructor(type, parentRequest = null) {
        this.processed = false;
        this.processedData = null;
        this.type = type;
        this.parentRequest = parentRequest;
    }
    get outerMostRequest() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let request = this;
        while (request.parentRequest instanceof InteractionRequest) {
            request = request.parentRequest;
        }
        return request;
    }
    isProcessed() {
        return this.processed;
    }
    getProcessedData() {
        return this.processedData;
    }
    setProcessedData(processedData = null) {
        this.processed = true;
        this.processedData = processedData;
    }
}
export default InteractionRequest;
