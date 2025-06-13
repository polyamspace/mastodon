# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RegistrationFilter do
  # Polyam TODO: Figure out how to test for regex: true
  describe 'Validations' do
    it { is_expected.to define_enum_for(:type).with_values(text: 0, regexp: 1).with_suffix(:type) }
    it { is_expected.to validate_presence_of(:phrase) }
  end
end
