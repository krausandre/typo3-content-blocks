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
class InteractionRequestMap {
    constructor() {
        this.assignments = [];
    }
    attachFor(request, deferred) {
        let targetAssignment = this.getFor(request);
        if (targetAssignment === null) {
            targetAssignment = { request, deferreds: [] };
            this.assignments.push(targetAssignment);
        }
        targetAssignment.deferreds.push(deferred);
    }
    detachFor(request) {
        const targetAssignment = this.getFor(request);
        this.assignments = this.assignments.filter((assignment) => assignment === targetAssignment);
    }
    getFor(triggerEvent) {
        let targetAssignment = null;
        this.assignments.some((assignment) => {
            if (assignment.request === triggerEvent) {
                targetAssignment = assignment;
                return true;
            }
            return false;
        });
        return targetAssignment;
    }
    resolveFor(triggerEvent) {
        const targetAssignment = this.getFor(triggerEvent);
        if (targetAssignment === null) {
            return false;
        }
        targetAssignment.deferreds.forEach(deferred => deferred.resolve());
        this.detachFor(triggerEvent);
        return true;
    }
    rejectFor(triggerEvent) {
        const targetAssignment = this.getFor(triggerEvent);
        if (targetAssignment === null) {
            return false;
        }
        targetAssignment.deferreds.forEach(deferred => deferred.reject());
        this.detachFor(triggerEvent);
        return true;
    }
}
export default new InteractionRequestMap();
