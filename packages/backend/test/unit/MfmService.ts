/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as assert from 'assert';
import * as mfm from 'mfc-js';
import { Test } from '@nestjs/testing';

import { CoreModule } from '@/core/CoreModule.js';
import { MfmService } from '@/core/MfmService.js';
import { GlobalModule } from '@/GlobalModule.js';

describe('MfmService', () => {
	let mfmService: MfmService;

	beforeAll(async () => {
		const app = await Test.createTestingModule({
			imports: [GlobalModule, CoreModule],
		}).compile();
		mfmService = app.get<MfmService>(MfmService);
	});

	describe('toHtml', () => {
		test('br', () => {
			const input = 'foo\nbar\nbaz';
			const output = '<p><span>foo<br />bar<br />baz</span></p>';
			assert.equal(mfmService.toHtml(mfm.parse(input)), output);
		});

		test('br alt', () => {
			const input = 'foo\r\nbar\rbaz';
			const output = '<p><span>foo<br />bar<br />baz</span></p>';
			assert.equal(mfmService.toHtml(mfm.parse(input)), output);
		});

		test('Do not generate unnecessary span', () => {
			const input = 'foo $[tada bar]';
			const output = '<p>foo <i>bar</i></p>';
			assert.equal(mfmService.toHtml(mfm.parse(input)), output);
		});

		test('escape', () => {
			const input = '```\n<p>Hello, world!</p>\n```';
			const output = '<p><pre><code>&lt;p&gt;Hello, world!&lt;/p&gt;</code></pre></p>';
			assert.equal(mfmService.toHtml(mfm.parse(input)), output);
		});
	});

	describe('fromHtml', () => {
		test('p', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a</p><p>b</p>'), 'a\n\nb');
		});

		test('block element', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<div>a</div><div>b</div>'), 'a\nb');
		});

		test('inline element', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<ul><li>a</li><li>b</li></ul>'), 'a\nb');
		});

		test('block code', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<pre><code>a\nb</code></pre>'), '```\na\nb\n```');
		});

		test('inline code', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<code>a</code>'), '`a`');
		});

		test('quote', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<blockquote>a\nb</blockquote>'), '> a\n> b');
		});

		test('br', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>abc<br><br/>d</p>'), 'abc\n\nd');
		});

		test('link with different text', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a href="https://example.com/b">c</a> d</p>'), 'a [c](https://example.com/b) d');
		});

		test('link with different text, but not encoded', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a href="https://example.com/ä">c</a> d</p>'), 'a [c](<https://example.com/ä>) d');
		});

		test('link with same text', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a href="https://example.com/b">https://example.com/b</a> d</p>'), 'a https://example.com/b d');
		});

		test('link with same text, but not encoded', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a href="https://example.com/ä">https://example.com/ä</a> d</p>'), 'a <https://example.com/ä> d');
		});

		test('link with no url', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a href="b">c</a> d</p>'), 'a [c](b) d');
		});

		test('link without href', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a>c</a> d</p>'), 'a c d');
		});

		test('link without text', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a href="https://example.com/b"></a> d</p>'), 'a https://example.com/b d');
		});

		test('link without both', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a></a> d</p>'), 'a  d');
		});

		test('ruby', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <ruby>CherryPick<rp>(</rp><rt>チェリーピック</rt><rp>)</rp></ruby> b</p>'), 'a $[ruby CherryPick チェリーピック] b');
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <ruby>CherryPick<rp>(</rp><rt>チェリーピック</rt><rp>)</rp>CherryPick<rp>(</rp><rt>チェリーピック</rt><rp>)</rp></ruby> b</p>'), 'a $[ruby CherryPick チェリーピック]$[ruby CherryPick チェリーピック] b');
		});

		test('ruby with spaces', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <ruby>Cherry Pick<rp>(</rp><rt>チェリーピック</rt><rp>)</rp> b</ruby> c</p>'), 'a Cherry Pick(チェリーピック) b c');
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <ruby>CherryPick<rp>(</rp><rt>チェリー ピック</rt><rp>)</rp> b</ruby> c</p>'), 'a CherryPick(チェリー ピック) b c');
			assert.deepStrictEqual(
				mfmService.fromHtml('<p>a <ruby>CherryPick<rp>(</rp><rt>チェリーピック</rt><rp>)</rp>CherryPick<rp>(</rp><rt>ミス キー</rt><rp>)</rp>CherryPick<rp>(</rp><rt>チェリーピック</rt><rp>)</rp></ruby> b</p>'),
				'a CherryPick(チェリーピック)CherryPick(ミス キー)CherryPick(チェリーピック) b',
			);
		});

		test('ruby with other inline tags', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <ruby><strong>CherryPick</strong><rp>(</rp><rt>チェリーピック</rt><rp>)</rp> b</ruby> c</p>'), 'a **CherryPick**(チェリーピック) b c');
		});

		test('mention', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a href="https://example.com/@user" class="u-url mention">@user</a> d</p>'), 'a @user@example.com d');
		});

		test('hashtag', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a href="https://example.com/tags/a">#a</a> d</p>', ['#a']), 'a #a d');
		});

		test('hashtag non-normalized', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a <a href="https://example.com/tags/1">#１</a> d</p>', ['#1']), 'a #１ d');
		});

		test('MFM in HTML plaintext', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a**b**cd~~e~~f</p>'), '<plain>a**b**cd~~e~~f</plain>');
		});

		test('MFM in HTML plaintext with unicode emoji', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a**b**c♥d~~e~~f</p>'), '<plain>a**b**c</plain>♥<plain>d~~e~~f</plain>');
		});

		test('MFM in HTML plaintext with code emoji', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>a **b** c:not-emoji: just : :emoji: rest text with ~~MFM~~</p>'), '<plain>a **b** c:not-emoji: just : </plain>:emoji:<plain> rest text with ~~MFM~~</plain>');
		});

		test('Complex MFM in HTML plaintext and html style', () => {
			assert.deepStrictEqual(mfmService.fromHtml('<p>plain <b>bold</b> plain **nonbold** :emoji: plain ♥ plain</p>'), 'plain **bold**<plain> plain **nonbold** </plain>:emoji: plain ♥ plain');
		});
	});
});
