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
import SecurityUtility from '@typo3/core/security-utility.js';
import { expect } from '@open-wc/testing';
describe('@typo3/core/security-utility', () => {
    it('generates random hex value', () => {
        function* validLengthDataProvider() {
            yield 1;
            yield 20;
            yield 39;
        }
        for (const validLength of validLengthDataProvider()) {
            const randomHexValue = (new SecurityUtility()).getRandomHexValue(validLength);
            expect(randomHexValue.length).to.equal(validLength);
        }
    });
    it('throws SyntaxError on invalid length', () => {
        function* invalidLengthDataProvider() {
            yield 0;
            yield -90;
            yield 10.3; // length is "ceiled", 10.3 => 11, 10 != 11
        }
        for (const invalidLength of invalidLengthDataProvider()) {
            expect(() => (new SecurityUtility()).getRandomHexValue(invalidLength)).to.throw(SyntaxError);
        }
    });
    it('encodes HTML', () => {
        expect((new SecurityUtility).encodeHtml('<>"\'&')).to.equal('&lt;&gt;&quot;&apos;&amp;');
    });
    it('removes HTML from string', () => {
        expect((new SecurityUtility).stripHtml('<img src="" onerror="alert(\'1\')">oh noes')).to.equal('oh noes');
        expect((new SecurityUtility).encodeHtml('<>"\'&')).to.equal('&lt;&gt;&quot;&apos;&amp;');
    });
});
