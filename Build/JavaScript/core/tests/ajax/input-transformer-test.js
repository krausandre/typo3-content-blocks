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
import { InputTransformer } from '@typo3/core/ajax/input-transformer.js';
import { expect } from '@open-wc/testing';
describe('@typo3/core/ajax/input-transformer', () => {
    it('converts object to FormData', () => {
        const input = { foo: 'bar', bar: 'baz', nested: { works: 'yes' } };
        const expected = new FormData();
        expected.set('foo', 'bar');
        expected.set('bar', 'baz');
        expected.set('nested[works]', 'yes');
        expect(InputTransformer.toFormData(input)).to.eql(expected);
    });
    it('undefined values are removed in FormData', () => {
        const input = { foo: 'bar', bar: 'baz', removeme: undefined };
        const expected = new FormData();
        expected.set('foo', 'bar');
        expected.set('bar', 'baz');
        expect(InputTransformer.toFormData(input)).to.eql(expected);
    });
    it('converts object to SearchParams', () => {
        const input = { foo: 'bar', bar: 'baz', nested: { works: 'yes' } };
        const expected = 'foo=bar&bar=baz&nested[works]=yes';
        expect(InputTransformer.toSearchParams(input)).to.equal(expected);
    });
    it('merges array to SearchParams', () => {
        const input = ['foo=bar', 'bar=baz'];
        const expected = 'foo=bar&bar=baz';
        expect(InputTransformer.toSearchParams(input)).to.equal(expected);
    });
    it('keeps string in SearchParams', () => {
        const input = 'foo=bar&bar=baz';
        const expected = 'foo=bar&bar=baz';
        expect(InputTransformer.toSearchParams(input)).to.equal(expected);
    });
    it('undefined values are removed in SearchParams', () => {
        const input = { foo: 'bar', bar: 'baz', removeme: undefined };
        const expected = 'foo=bar&bar=baz';
        expect(InputTransformer.toSearchParams(input)).to.equal(expected);
    });
});
