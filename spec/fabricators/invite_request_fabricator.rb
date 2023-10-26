# frozen_string_literal: true

Fabricator(:user_invite_request) do
  user { Fabricate.build(:user, account: nil) }
  text 'Let me in!'
end
