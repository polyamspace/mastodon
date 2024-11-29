# frozen_string_literal: true

class InstanceFilter
  KEYS = %i(
    limited
    suspended
    by_domain
    availability
    by_comment
  ).freeze

  attr_reader :params

  def initialize(params)
    @params = params
  end

  def results
    scope = Instance.includes(:domain_block, :domain_allow, :unavailable_domain).order(accounts_count: :desc)

    params.each do |key, value|
      scope.merge!(scope_for(key, value.to_s.strip)) if value.present?
    end

    scope
  end

  private

  def scope_for(key, value)
    case key.to_s
    when 'limited'
      Instance.joins(:domain_block).where(domain_blocks: { severity: 0 }).reorder(domain_blocks: { id: :desc })
    when 'suspended'
      Instance.joins(:domain_block).where(domain_blocks: { severity: 1 }).reorder(domain_blocks: { id: :desc })
    when 'allowed'
      Instance.joins(:domain_allow).reorder(domain_allows: { id: :desc })
    when 'by_domain'
      Instance.matches_domain(value)
    when 'availability'
      availability_scope(value)
    when 'by_comment'
      Instance.matches_comment(value)
    else
      raise Mastodon::InvalidParameterError, "Unknown filter: #{key}"
    end
  end

  def availability_scope(value)
    case value
    when 'failing'
      Instance.where(domain: DeliveryFailureTracker.warning_domains)
    when 'unavailable'
      Instance.joins(:unavailable_domain)
    else
      raise Mastodon::InvalidParameterError, "Unknown availability: #{value}"
    end
  end
end
