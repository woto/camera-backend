class LocalesController < ApplicationController
  skip_before_action :require_login

  def update
    locale = params[:locale].to_s
    if I18n.available_locales.map(&:to_s).include?(locale)
      cookies[:locale] = { value: locale, expires: 1.year.from_now }
    end
    redirect_to locale_redirect_target, allow_other_host: false
  end

  def locale_redirect_target
    fallback = events_path
    referer = request.referer
    return fallback if referer.blank?

    uri = URI.parse(referer)
    query = uri.query.present? ? Rack::Utils.parse_nested_query(uri.query) : {}
    query.delete("locale")
    uri.query = query.present? ? query.to_query : nil
    uri.to_s
  rescue URI::InvalidURIError
    fallback
  end
end
