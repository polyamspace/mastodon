# frozen_string_literal: true

class Api::V1::Accounts::PinsController < Api::BaseController
  include Authorization

  before_action -> { doorkeeper_authorize! :write, :'write:accounts' }, except: [:index]
  before_action :require_user!, except: [:index]
  before_action :set_account
  after_action :insert_pagination_headers, except: [:create, :destroy]

  def index
    cache_if_unauthenticated!
    @accounts = load_accounts
    render json: @accounts, each_serializer: REST::AccountSerializer
  end

  def create
    AccountPin.find_or_create_by!(account: current_account, target_account: @account)
    render json: @account, serializer: REST::RelationshipSerializer, relationships: relationships_presenter
  end

  def destroy
    pin = AccountPin.find_by(account: current_account, target_account: @account)
    pin&.destroy!
    render json: @account, serializer: REST::RelationshipSerializer, relationships: relationships_presenter
  end

  private

  def set_account
    @account = Account.find(params[:account_id])
  end

  def relationships_presenter
    AccountRelationshipsPresenter.new([@account.id], current_user.account_id)
  end

  def load_accounts
    return [] if hide_results?

    if unlimited?
      endorsed_accounts.all
    else
      endorsed_accounts.paginate_by_max_id(
        limit_param(limit),
        params[:max_id],
        params[:since_id]
      )
    end
  end

  def endorsed_accounts
    @account.endorsed_accounts
  end

  def hide_results?
    @account.suspended? || (current_account && @account.blocking?(current_account))
  end

  def insert_pagination_headers
    set_pagination_headers(next_path, prev_path)
  end

  def next_path
    return if unlimited?

    api_v1_account_pinned_index_url pagination_params(max_id: pagination_max_id) if records_continue?
  end

  def prev_path
    return if unlimited?

    api_v1_account_pinned_index_url pagination_params(since_id: pagination_since_id) unless @accounts.empty?
  end

  def pagination_max_id
    @accounts.last.id
  end

  def pagination_since_id
    @accounts.first.id
  end

  def records_continue?
    @accounts.size == limit_param(limit)
  end

  def pagination_params(core_params)
    params.slice(:limit).permit(:limit).merge(core_params)
  end

  def limit
    params[:limit].to_i || DEFAULT_ACCOUNTS_LIMIT
  end

  def unlimited?
    params[:limit] == '0'
  end
end
