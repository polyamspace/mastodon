# frozen_string_literal: true

# Polyam: Used for request text filter and reject patterns

class RegexValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if value.blank?

    _ = Regexp.new(value)
  rescue RegexpError => e
    record.errors.add(attribute, I18n.t('regex_validator.invalid_regexp', error: e.to_s))
  end
end
