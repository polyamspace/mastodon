# frozen_string_literal: true

Fabricator(:invite) do
  user { Fabricate.build(:user, created_at: 7.days.ago) } # Polyam: created_at for invite restrictions
  expires_at nil
  max_uses   nil
  uses       0
end
