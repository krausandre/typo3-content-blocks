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
class ConsumerScope {
    constructor() {
        this.consumers = [];
    }
    getConsumers() {
        return this.consumers;
    }
    hasConsumer(consumer) {
        return this.consumers.includes(consumer);
    }
    attach(consumer) {
        if (!this.hasConsumer(consumer)) {
            this.consumers.push(consumer);
        }
    }
    detach(consumer) {
        this.consumers = this.consumers.filter((currentConsumer) => currentConsumer !== consumer);
    }
    async invoke(request) {
        const promises = [];
        this.consumers.forEach((consumer) => {
            const promise = consumer.consume.call(consumer, request);
            if (promise) {
                promises.push(promise);
            }
        });
        await Promise.all(promises);
    }
}
export default new ConsumerScope();
