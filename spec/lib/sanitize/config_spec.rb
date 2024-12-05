# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Sanitize::Config do
  shared_examples 'common HTML sanitization' do
    it 'keeps h1' do
      expect(Sanitize.fragment('<h1>Foo</h1>', subject)).to eq '<h1>Foo</h1>'
    end

    it 'keeps ul' do
      expect(Sanitize.fragment('<p>Check out:</p><ul><li>Foo</li><li>Bar</li></ul>', subject)).to eq '<p>Check out:</p><ul><li>Foo</li><li>Bar</li></ul>'
    end

    it 'keeps start and reversed attributes of ol' do
      expect(Sanitize.fragment('<p>Check out:</p><ol start="3" reversed=""><li>Foo</li><li>Bar</li></ol>', subject)).to eq '<p>Check out:</p><ol start="3" reversed=""><li>Foo</li><li>Bar</li></ol>'
    end

    it 'keeps ruby tags' do
      expect(Sanitize.fragment('<p><ruby>明日 <rp>(</rp><rt>Ashita</rt><rp>)</rp></ruby></p>', subject)).to eq '<p><ruby>明日 <rp>(</rp><rt>Ashita</rt><rp>)</rp></ruby></p>'
    end

    it 'removes a without href' do
      expect(Sanitize.fragment('<a>Test</a>', subject)).to eq 'Test'
    end

    it 'removes a without href and only keeps text content' do
      expect(Sanitize.fragment('<a><span class="invisible">foo&amp;</span><span>Test</span></a>', subject)).to eq 'foo&amp;Test'
    end

    it 'removes a with unsupported scheme in href' do
      expect(Sanitize.fragment('<a href="foo://bar">Test</a>', subject)).to eq 'Test'
    end

    it 'does not re-interpret HTML when removing unsupported links' do
      expect(Sanitize.fragment('<a href="foo://bar">Test&lt;a href="https://example.com"&gt;test&lt;/a&gt;</a>', subject)).to eq 'Test&lt;a href="https://example.com"&gt;test&lt;/a&gt;'
    end

    it 'keeps a with href' do
      expect(Sanitize.fragment('<a href="http://example.com">Test</a>', subject)).to eq '<a href="http://example.com" rel="nofollow noopener noreferrer" target="_blank">Test</a>'
    end

    it 'keeps a with translate="no"' do
      expect(Sanitize.fragment('<a href="http://example.com" translate="no">Test</a>', subject)).to eq '<a href="http://example.com" translate="no" rel="nofollow noopener noreferrer" target="_blank">Test</a>'
    end

    it 'removes "translate" attribute with invalid value' do
      expect(Sanitize.fragment('<a href="http://example.com" translate="foo">Test</a>', subject)).to eq '<a href="http://example.com" rel="nofollow noopener noreferrer" target="_blank">Test</a>'
    end

    it 'removes a with unparsable href' do
      expect(Sanitize.fragment('<a href=" https://google.fr">Test</a>', subject)).to eq 'Test'
    end

    it 'keeps a with supported scheme and no host' do
      expect(Sanitize.fragment('<a href="dweb:/a/foo">Test</a>', subject)).to eq '<a href="dweb:/a/foo" rel="nofollow noopener noreferrer" target="_blank">Test</a>'
    end

    it 'keeps title in abbr' do
      expect(Sanitize.fragment('<abbr title="HyperText Markup Language">HTML</abbr>', subject)).to eq '<abbr title="HyperText Markup Language">HTML</abbr>'
    end

    it 'keeps data-codelang attribute in code' do
      expect(Sanitize.fragment('<code data-codelang="c++">int main(void) { return 0; // https://joinmastodon.org/foo }</code>', subject)).to eq '<code data-codelang="c++">int main(void) { return 0; // https://joinmastodon.org/foo }</code>'
    end

    it 'removes data-codelang attribute with invalid value in code' do
      expect(Sanitize.fragment('<code data-codelang="invalid">int main(void) { return 0; // https://joinmastodon.org/foo }</code>', subject)).to eq '<code>int main(void) { return 0; // https://joinmastodon.org/foo }</code>'
    end
  end

  describe '::MASTODON_STRICT' do
    subject { described_class::MASTODON_STRICT }

    around do |example|
      original_web_domain = Rails.configuration.x.web_domain
      example.run
      Rails.configuration.x.web_domain = original_web_domain
    end

    it_behaves_like 'common HTML sanitization'

    it 'sanitizes math to LaTeX' do
      mathml = '<math><semantics><mrow><msup><mi>x</mi><mi>n</mi></msup><mo>+</mo><mi>y</mi></mrow><annotation encoding="application/x-tex">x^n+y</annotation></semantics></math>'
      expect(Sanitize.fragment(mathml, subject)).to eq '$x^n+y$'
    end

    it 'sanitizes math blocks to LaTeX' do
      mathml = '<math display="block"><semantics><mrow><msup><mi>x</mi><mi>n</mi></msup><mo>+</mo><mi>y</mi></mrow><annotation encoding="application/x-tex">x^n+y</annotation></semantics></math>'
      expect(Sanitize.fragment(mathml, subject)).to eq '$$x^n+y$$'
    end

    it 'math sanitizer falls back to plaintext' do
      mathml = '<math><semantics><msqrt><mi>x</mi></msqrt><annotation encoding="text/plain">sqrt(x)</annotation></semantics></math>'
      expect(Sanitize.fragment(mathml, subject)).to eq 'sqrt(x)'
    end

    it 'prefers latex' do
      mathml = '<math><semantics><msqrt><mi>x</mi></msqrt><annotation encoding="text/plain">sqrt(x)</annotation><annotation encoding="application/x-tex">\\sqrt x</annotation></semantics></math>'
      expect(Sanitize.fragment(mathml, subject)).to eq '$\sqrt x$'
    end
  end

  describe '::MASTODON_OUTGOING' do
    subject { described_class::MASTODON_OUTGOING }

    around do |example|
      original_web_domain = Rails.configuration.x.web_domain
      example.run
      Rails.configuration.x.web_domain = original_web_domain
    end

    it_behaves_like 'common HTML sanitization'

    it 'keeps a with href and rel tag, not adding to rel or target if url is local' do
      Rails.configuration.x.web_domain = 'domain.test'
      expect(Sanitize.fragment('<a href="http://domain.test/tags/foo" rel="tag">Test</a>', subject)).to eq '<a href="http://domain.test/tags/foo" rel="tag">Test</a>'
    end
  end
end
