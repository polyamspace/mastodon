# frozen_string_literal: true

# == Schema Information
#
# Table name: status_reactions
#
#  id              :bigint(8)        not null, primary key
#  account_id      :bigint(8)        not null
#  status_id       :bigint(8)        not null
#  name            :string           default(""), not null
#  custom_emoji_id :bigint(8)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
class StatusReaction < ApplicationRecord
  belongs_to :account
  belongs_to :status, inverse_of: :status_reactions
  belongs_to :custom_emoji, optional: true

  has_one :notification, as: :activity, dependent: :destroy

  validates :name, presence: true
  validates_with StatusReactionValidator

  before_validation :set_custom_emoji

  after_create :increment_cache_counters
  after_destroy :decrement_cache_counters

  private

  # Sets custom_emoji to nil if disabled, or to a custom_emoji when given a valid shortcode, but no custom_emoji object
  def set_custom_emoji
    self.custom_emoji = CustomEmoji.find_by(disabled: false, shortcode: name, domain: account.domain) if name.present?
  end

  def increment_cache_counters
    status.increment_count!(:reactions_count)
  end

  def decrement_cache_counters
    return if association(:status).loaded? && status.marked_for_destruction?

    status.decrement_count!(:reactions_count)
  end
end
