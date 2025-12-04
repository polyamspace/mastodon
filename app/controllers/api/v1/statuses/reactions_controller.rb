# frozen_string_literal: true

class Api::V1::Statuses::ReactionsController < Api::V1::Statuses::BaseController
  before_action -> { doorkeeper_authorize! :write, :'write:favourites' }
  before_action :require_user!
  skip_before_action :set_status, only: [:destroy]

  def create
    ReactService.new.call(current_account, @status, params[:id])
    render json: @status, serializer: REST::StatusSerializer
  end

  def destroy
    name, domain = params[:id].split('@')
    custom_emoji = CustomEmoji.find_by(shortcode: name, domain: domain)
    react = current_account.status_reactions.find_by(status_id: params[:status_id], name: name, custom_emoji: custom_emoji)

    if react
      @status = react.status
      count = [@status.reactions_count - 1, 0].max
      reactions = @status.reactions(current_account.id).filter_map do |reaction|
        if reaction['name'] == name && reaction['custom_emoji_id'] == custom_emoji&.id
          next if reaction['count'] == 1

          reaction['count'] -= 1
          reaction['me'] = false
        end
        reaction
      end
      UnreactWorker.perform_async(current_account.id, @status.id, params[:id])
    else
      @status = Status.find(params[:status_id])
      count = @status.reactions_count
      reactions = @status.reactions(current_account.id)
      authorize @status, :show?
    end

    relationships = StatusRelationshipsPresenter.new([@status], current_account.id, attributes_map: { @status.id => { reactions_count: count, reactions: reactions } })
    render json: @status, serializer: REST::StatusSerializer, relationships: relationships
  rescue Mastodon::NotPermittedError
    not_found
  end
end
