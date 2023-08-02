# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CustomEmojiFilter do
  describe '#results' do
    subject { described_class.new(params).results }

    let!(:custom_emoji_domain_a) { Fabricate(:custom_emoji, domain: 'a') }
    let!(:custom_emoji_domain_b) { Fabricate(:custom_emoji, domain: 'b') }
    let!(:custom_emoji_domain_nil) { Fabricate(:custom_emoji, domain: nil, shortcode: 'hoge') }
    let!(:custom_emoji_domain_nil_disabled) { Fabricate(:custom_emoji, domain: nil, disabled: true) }

    context 'when params have values' do
      context 'when local' do
        let(:params) { { local: true } }

        it 'returns ActiveRecord::Relation' do
          expect(subject).to be_a(ActiveRecord::Relation)
          expect(subject).to contain_exactly(custom_emoji_domain_nil, custom_emoji_domain_nil_disabled)
        end
      end

      context 'when remote' do
        let(:params) { { remote: true } }

        it 'returns ActiveRecord::Relation' do
          expect(subject).to be_a(ActiveRecord::Relation)
          expect(subject).to contain_exactly(custom_emoji_domain_a, custom_emoji_domain_b)
        end
      end

      context 'with by_domain' do
        let(:params) { { by_domain: 'a' } }

        it 'returns ActiveRecord::Relation' do
          expect(subject).to be_a(ActiveRecord::Relation)
          expect(subject).to contain_exactly(custom_emoji_domain_a)
        end
      end

      context 'when shortcode' do
        let(:params) { { shortcode: 'hoge' } }

        it 'returns ActiveRecord::Relation' do
          expect(subject).to be_a(ActiveRecord::Relation)
          expect(subject).to contain_exactly(custom_emoji_domain_nil)
        end
      end

      context 'with availability' do
        context 'when disabled' do
          let(:params) { { availability: 'disabled' } }

          it 'returns ActiveRecord::Relation' do
            expect(subject).to be_a(ActiveRecord::Relation)
            expect(subject).to contain_exactly(custom_emoji_domain_nil_disabled)
          end
        end

        context 'when enabled' do
          let(:params) { { availability: 'enabled' } }

          it 'returns ActiveRecord::Relation' do
            expect(subject).to be_a(ActiveRecord::Relation)
            expect(subject).to contain_exactly(custom_emoji_domain_a, custom_emoji_domain_b, custom_emoji_domain_nil)
          end
        end
      end

      context 'when some other case' do
        let(:params) { { else: 'else' } }

        it 'raises Mastodon::InvalidParameterError' do
          expect do
            subject
          end.to raise_error(Mastodon::InvalidParameterError, /Unknown filter: else/)
        end
      end
    end

    context 'when params without value' do
      let(:params) { { hoge: nil } }

      it 'returns ActiveRecord::Relation' do
        expect(subject).to be_a(ActiveRecord::Relation)
        expect(subject).to contain_exactly(custom_emoji_domain_a, custom_emoji_domain_b, custom_emoji_domain_nil, custom_emoji_domain_nil_disabled)
      end
    end
  end
end
