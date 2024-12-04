# frozen_string_literal: true

module ApplicationHelper
  RTL_LOCALES = %i(
    ar
    ckb
    fa
    he
  ).freeze

  def friendly_number_to_human(number, **options)
    # By default, the number of precision digits used by number_to_human
    # is looked up from the locales definition, and rails-i18n comes with
    # values that don't seem to make much sense for many languages, so
    # override these values with a default of 3 digits of precision.
    options = options.merge(
      precision: 3,
      strip_insignificant_zeros: true,
      significant: true
    )

    number_to_human(number, **options)
  end

  def open_registrations?
    Setting.registrations_mode == 'open'
  end

  def approved_registrations?
    Setting.registrations_mode == 'approved'
  end

  def closed_registrations?
    Setting.registrations_mode == 'none'
  end

  def available_sign_up_path
    if closed_registrations? || omniauth_only?
      'https://joinmastodon.org/#getting-started'
    else
      ENV.fetch('SSO_ACCOUNT_SIGN_UP', new_user_registration_path)
    end
  end

  def omniauth_only?
    ENV['OMNIAUTH_ONLY'] == 'true'
  end

  def link_to_login(name = nil, html_options = nil, &block)
    target = new_user_session_path

    html_options = name if block

    if omniauth_only? && Devise.mappings[:user].omniauthable? && User.omniauth_providers.size == 1
      target = omniauth_authorize_path(:user, User.omniauth_providers[0])
      html_options ||= {}
      html_options[:method] = :post
    end

    if block
      link_to(target, html_options, &block)
    else
      link_to(name, target, html_options)
    end
  end

  def provider_sign_in_link(provider)
    label = Devise.omniauth_configs[provider]&.strategy&.display_name.presence || I18n.t("auth.providers.#{provider}", default: provider.to_s.chomp('_oauth2').capitalize)
    link_to label, omniauth_authorize_path(:user, provider), class: "button button-#{provider}", method: :post
  end

  def locale_direction
    if RTL_LOCALES.include?(I18n.locale)
      'rtl'
    else
      'ltr'
    end
  end

  def html_title
    safe_join(
      [content_for(:page_title), title]
      .compact_blank,
      ' - '
    )
  end

  def title
    Rails.env.production? ? site_title : "#{site_title} (Dev)"
  end

  def label_for_scope(scope)
    safe_join [
      tag.samp(scope, class: { 'scope-danger' => SessionActivation::DEFAULT_SCOPES.include?(scope.to_s) }),
      tag.span(t("doorkeeper.scopes.#{scope}"), class: :hint),
    ]
  end

  def can?(action, record)
    return false if record.nil?

    policy(record).public_send(:"#{action}?")
  end

  def material_symbol(icon, attributes = {})
    return awesome_icon(fa_icon(icon), attributes) if current_flavour == 'polyam'

    safe_join(
      [
        inline_svg_tag(
          "400-24px/#{icon}.svg",
          class: ['icon', "material-#{icon}"].concat(attributes[:class].to_s.split),
          role: :img,
          data: attributes[:data]
        ),
        ' ',
      ]
    )
  end

  def awesome_icon(icon, attributes = {})
    variant = "#{attributes[:variant] || 'solid'}/" unless attributes[:variant] == ''

    safe_join(
      [
        inline_svg_tag(
          "#{variant}#{icon}.svg",
          class: ['icon', "fa-#{icon}"].concat(attributes[:class].to_s.split),
          role: :img,
          data: attributes[:data]
        ),
        ' ',
      ]
    )
  end

  def check_icon
    inline_svg_tag 'check.svg'
  end

  # Polyam: Used in app/views/admin/roles/_form.html.haml for role badge preview
  # TODO: Replace with material_symbol call?
  def person_icon
    content_tag(:svg,
                tag.path(d: 'M479.885-488.348q-72.333 0-118.174-45.842-45.842-45.842-45.842-118.174 0-72.333 45.842-118.29 45.841-45.957 118.174-45.957t118.572 45.957q46.239 45.957 46.239 118.29 0 72.332-46.239 118.174-46.239 45.842-118.572 45.842ZM145.869-138.521v-109.145q0-41.678 21.164-72.191 21.164-30.512 54.749-46.361 68.131-30.565 131.303-45.848 63.173-15.282 126.763-15.282 64.674 0 127.239 15.782 62.565 15.783 130.051 45.542 35.038 15.234 56.298 45.759 21.26 30.526 21.26 72.452v109.292H145.869Zm79.218-79.218h509.826v-27.782q0-15.635-9.5-29.835-9.5-14.201-23.5-21.035-61.739-29.304-113.324-40.239-51.584-10.935-108.869-10.935-56.155 0-109.307 10.935t-113.084 40.151q-14.242 6.839-23.242 21.065-9 14.227-9 29.893v27.782Zm254.798-349.828q36.854 0 60.941-23.999 24.087-24 24.087-60.893 0-37.127-23.972-61.03t-60.826-23.903q-36.854 0-60.941 23.929-24.087 23.929-24.087 60.723 0 37.028 23.972 61.101 23.972 24.072 60.826 24.072Zm.115-84.912Zm0 434.74Z'), xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 -960 960 960', fill: 'currentColor') # rubocop:disable Layout/LineLength
  end

  def interrelationships_icon(relationships, account_id)
    if relationships.following[account_id] && relationships.followed_by[account_id]
      material_symbol('sync_alt', title: I18n.t('relationships.mutual'), class: 'active passive')
    elsif relationships.following[account_id]
      material_symbol(locale_direction == 'ltr' ? 'arrow_right_alt' : 'arrow_left_alt', title: I18n.t('relationships.following'), class: 'active')
    elsif relationships.followed_by[account_id]
      material_symbol(locale_direction == 'ltr' ? 'arrow_left_alt' : 'arrow_right_alt', title: I18n.t('relationships.followers'), class: 'passive')
    end
  end

  def custom_emoji_tag(custom_emoji)
    if prefers_autoplay?
      image_tag(custom_emoji.image.url, class: 'emojione', alt: ":#{custom_emoji.shortcode}:")
    else
      image_tag(custom_emoji.image.url(:static), :class => 'emojione custom-emoji', :alt => ":#{custom_emoji.shortcode}", 'data-original' => full_asset_url(custom_emoji.image.url), 'data-static' => full_asset_url(custom_emoji.image.url(:static)))
    end
  end

  def opengraph(property, content)
    tag.meta(content: content, property: property)
  end

  def body_classes
    output = []
    output << content_for(:body_classes)
    output << "flavour-#{current_flavour.parameterize}"
    output << "skin-#{current_skin.parameterize}"
    output << 'system-font' if current_account&.user&.setting_system_font_ui
    output << (current_account&.user&.setting_reduce_motion ? 'reduce-motion' : 'no-reduce-motion')
    output << 'rtl' if locale_direction == 'rtl'
    output.compact_blank.join(' ')
  end

  def cdn_host
    Rails.configuration.action_controller.asset_host
  end

  def cdn_host?
    cdn_host.present?
  end

  def storage_host
    "https://#{storage_host_var}"
  end

  def storage_host?
    storage_host_var.present?
  end

  def quote_wrap(text, line_width: 80, break_sequence: "\n")
    text = word_wrap(text, line_width: line_width - 2, break_sequence: break_sequence)
    text.split("\n").map { |line| "> #{line}" }.join("\n")
  end

  def render_initial_state
    state_params = {
      settings: {},
      text: [params[:title], params[:text], params[:url]].compact.join(' '),
    }

    permit_visibilities = %w(public unlisted private direct)
    default_privacy     = current_account&.user&.setting_default_privacy
    permit_visibilities.shift(permit_visibilities.index(default_privacy) + 1) if default_privacy.present?
    state_params[:visibility] = params[:visibility] if permit_visibilities.include? params[:visibility]

    if user_signed_in? && current_user.functional?
      state_params[:settings]          = state_params[:settings].merge(Web::Setting.find_by(user: current_user)&.data || {})
      state_params[:push_subscription] = current_account.user.web_push_subscription(current_session)
      state_params[:current_account]   = current_account
      state_params[:token]             = current_session.token
      state_params[:admin]             = Account.find_local(Setting.site_contact_username.strip.gsub(/\A@/, ''))
    end

    if user_signed_in? && !current_user.functional?
      state_params[:disabled_account] = current_account
      state_params[:moved_to_account] = current_account.moved_to_account
    end

    state_params[:owner] = Account.local.without_suspended.without_internal.first if single_user_mode?

    json = ActiveModelSerializers::SerializableResource.new(InitialStatePresenter.new(state_params), serializer: InitialStateSerializer).to_json
    # rubocop:disable Rails/OutputSafety
    content_tag(:script, json_escape(json).html_safe, id: 'initial-state', type: 'application/json')
    # rubocop:enable Rails/OutputSafety
  end

  def grouped_scopes(scopes)
    scope_parser      = ScopeParser.new
    scope_transformer = ScopeTransformer.new

    scopes.each_with_object({}) do |str, h|
      scope = scope_transformer.apply(scope_parser.parse(str))

      if h[scope.key]
        h[scope.key].merge!(scope)
      else
        h[scope.key] = scope
      end
    end.values
  end

  def prerender_custom_emojis(html, custom_emojis, other_options = {})
    EmojiFormatter.new(html, custom_emojis, other_options.merge(animate: prefers_autoplay?)).to_s
  end

  def mascot_url
    full_asset_url(instance_presenter.mascot&.file&.url || frontend_asset_path('images/elephant_ui_plane.svg'))
  end

  def copyable_input(options = {})
    tag.input(type: :text, maxlength: 999, spellcheck: false, readonly: true, **options)
  end

  def recent_tag_usage(tag)
    people = tag.history.aggregate(2.days.ago.to_date..Time.zone.today).accounts
    I18n.t 'user_mailer.welcome.hashtags_recent_count', people: number_with_delimiter(people), count: people
  end

  # glitch-soc addition to handle the multiple flavors
  def preload_locale_pack
    supported_locales = Themes.instance.flavour(current_flavour)['locales']
    preload_pack_asset "locales/#{current_flavour}/#{I18n.locale}-json.js" if supported_locales.include?(I18n.locale.to_s)
  end

  def flavoured_javascript_pack_tag(pack_name, **)
    javascript_pack_tag("flavours/#{current_flavour}/#{pack_name}", **)
  end

  def flavoured_stylesheet_pack_tag(pack_name, **)
    stylesheet_pack_tag("flavours/#{current_flavour}/#{pack_name}", **)
  end

  def preload_signed_in_js_packs
    preload_files = Themes.instance.flavour(current_flavour)&.fetch('signed_in_preload', nil) || []
    safe_join(preload_files.map { |entry| preload_pack_asset entry })
  end

  private

  def storage_host_var
    ENV.fetch('S3_ALIAS_HOST', nil) || ENV.fetch('S3_CLOUDFRONT_HOST', nil) || ENV.fetch('AZURE_ALIAS_HOST', nil)
  end
end
