"use strict";
document.querySelectorAll('.example input[type="checkbox"]').forEach((element) => {
    if (element.id.includes('indeterminate')) {
        element.indeterminate = true;
    }
});
