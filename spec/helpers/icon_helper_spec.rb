# frozen_string_literal: true

# This spec is for polyam-glitch's icon helper

require 'rails_helper'

RSpec.describe IconHelper do
  describe '#fa_icon' do
    context 'when given valid icon name' do
      it 'returns FA icon name' do
        expect(helper.fa_icon('warning'))
          .to match('triangle-exclamation')
      end
    end

    context 'when given unknown icon name' do
      it 'returns nil' do
        expect(helper.fa_icon('unknown'))
          .to match(nil)
      end
    end
  end

  describe '#fa_variant' do
    context 'when given icon name in constant' do
      it 'returns variant of icon' do
        expect(helper.fa_variant('eye'))
          .to match('regular')
      end
    end

    context 'when given icon name not in constant' do
      it 'returns default value' do
        expect(helper.fa_variant('unknown'))
          .to match('solid')
      end
    end
  end
end
