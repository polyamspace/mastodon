# frozen_string_literal: true

# This spec is for polyam-glitch's icon helper

require 'rails_helper'

RSpec.describe IconHelper do
  describe '#fa_icon' do
    it 'returns "triangle-exclamation" when given "warning"' do
      expect(helper.fa_icon('warning'))
        .to match('triangle-exclamation')
    end
  end

  describe 'MATERIAL_TO_FA' do
    described_class::MATERIAL_TO_FA.each_value do |value|
      context value.to_s do
        it 'is an existing file' do
          # There is unfortunately no way to tell which variant should exist in this context,
          # so this can only check if any variant exists
          expect(
            File.file?(File.join('app', 'javascript', 'awesome-icons', 'solid', "#{value}.svg")) ||
            File.file?(File.join('app', 'javascript', 'awesome-icons', 'regular', "#{value}.svg")) ||
            File.file?(File.join('app', 'javascript', 'awesome-icons', 'brands', "#{value}.svg")) ||
            File.file?(File.join('app', 'javascript', 'svg-icons', "#{value}.svg"))
          ).to be true
        end
      end
    end
  end
end
