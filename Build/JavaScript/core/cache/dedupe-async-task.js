/**
 * (abortable) deduping caching strategy for promises
 */
export class DedupeAsyncTask {
    constructor() {
        this.promises = {};
        this.results = {};
    }
    async get(key, task, signal) {
        if (signal?.aborted) {
            signal.throwIfAborted();
        }
        if (key in this.results) {
            return this.results[key];
        }
        const promise = this.getPromise(key, task);
        if (signal) {
            return await this.getAbortablePromise(key, promise, signal);
        }
        return await promise;
    }
    getPromise(key, task) {
        if (key in this.promises) {
            this.promises[key].refCount++;
            return this.promises[key].promise;
        }
        const abortController = new AbortController();
        const refCount = 1;
        const promise = task(abortController.signal)
            .then((value) => {
            this.results[key] = value;
            return value;
        })
            .finally(() => {
            if (key in this.promises) {
                delete this.promises[key];
            }
        });
        this.promises[key] = { promise, abortController, refCount };
        return promise;
    }
    getAbortablePromise(key, promise, signal) {
        return new Promise((resolve, reject) => {
            const abortListener = () => {
                if (key in this.promises && --this.promises[key].refCount < 1) {
                    this.promises[key].abortController.abort();
                    delete this.promises[key];
                }
                try {
                    signal.throwIfAborted();
                }
                catch (e) {
                    reject(e);
                }
            };
            signal.addEventListener('abort', abortListener, { once: true });
            promise.then((value) => {
                signal.removeEventListener('abort', abortListener);
                if (!signal.aborted) {
                    resolve(value);
                }
            }, (e) => {
                signal.removeEventListener('abort', abortListener);
                reject(e);
            });
        });
    }
}
