# frozen_string_literal: true

# == Schema Information
#
# Table name: registration_filters
#
#  id         :bigint(8)        not null, primary key
#  phrase     :text             default(""), not null
#  type       :integer          default("text"), not null
#  whole_word :boolean          default(TRUE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class RegistrationFilter < ApplicationRecord
  self.inheritance_column = nil

  enum :type, { text: 0, regexp: 1 }, suffix: :type

  validates :phrase, presence: true
  validates :phrase, regex: true, if: :regexp_type?

  def to_log_human_identifier
    "#{phrase} (#{I18n.t("admin.registration_filters.types.#{type}")})"
  end
end
