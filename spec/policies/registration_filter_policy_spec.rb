# frozen_string_literal: true

require 'rails_helper'
require 'pundit/rspec'

RSpec.describe RegistrationFilterPolicy do
  let(:subject) { described_class }
  let(:admin)   { Fabricate(:user, role: UserRole.find_by(name: 'Admin')).account }
  let(:john)    { Fabricate(:user).account }

  permissions :index? do
    context 'admin' do
      it 'permits' do
        expect(subject).to permit(admin, RegistrationFilter)
      end
    end

    context 'not staff' do
      it 'denies' do
        expect(subject).to_not permit(john, RegistrationFilter)
      end
    end
  end

  permissions :create?, :destroy?, :update? do
    context 'admin' do
      it 'permits' do
        expect(subject).to permit(admin, RegistrationFilter)
      end
    end

    context 'not admin' do
      it 'denies' do
        expect(subject).to_not permit(john, RegistrationFilter)
      end
    end
  end
end
