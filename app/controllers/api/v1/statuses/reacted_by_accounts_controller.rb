# frozen_string_literal: true

class Api::V1::Statuses::ReactedByAccountsController < Api::BaseController
  include Authorization

  before_action -> { authorize_if_got_token! :read, :'read:accounts' }
  before_action :set_status
  after_action :insert_pagination_headers

  def index
    cache_if_unauthenticated!
    @accounts = load_accounts
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  private

  def load_accounts
    scope = default_accounts
    scope = scope.where.not(id: current_account.excluded_from_timeline_account_ids) unless current_account.nil?
    scope.merge(paginated_reactions).to_a
  end

  def default_accounts
    Account
      .without_suspended
      .includes(:status_reactions, :account_stat)
      .references(:status_reactions)
      .where(status_reactions: { status_id: @status.id })
  end

  def paginated_reactions
    StatusReaction.paginate_by_max_id(
      limit_param(DEFAULT_ACCOUNTS_LIMIT),
      params[:max_id],
      params[:since_id]
    )
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    api_v1_status_reacted_by_index_url pagination_params(max_id: pagination_max_id) if records_continue?
  end

  def prev_path
    api_v1_status_reacted_by_index_url pagination_params(since_id: pagination_since_id) unless @accounts.empty?
  end

  def pagination_max_id
    @accounts.last.status_reactions.last.id
  end

  def pagination_since_id
    @accounts.first.status_reactions.first.id
  end

  def records_continue?
    @accounts.size == limit_param(DEFAULT_ACCOUNTS_LIMIT)
  end

  def set_status
    @status = Status.find(params[:status_id])
    authorize @status, :show?
  rescue Mastodon::NotPermittedError
    not_found
  end
end
