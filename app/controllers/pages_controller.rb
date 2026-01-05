class PagesController < ApplicationController
  skip_before_action :require_login, only: :policy

  def policy
    locale = I18n.locale.to_s
    policy_path = Rails.root.join("app", "content", "privacy_#{locale}.md")
    policy_path = Rails.root.join("app", "content", "privacy_en.md") unless File.exist?(policy_path)
    @policy_markdown = File.read(policy_path)
  end
end
