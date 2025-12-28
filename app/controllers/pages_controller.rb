class PagesController < ApplicationController
  skip_before_action :require_login, only: :policy

  def policy
    policy_path = Rails.root.join("app", "content", "policy.md")
    @policy_markdown = File.read(policy_path)
  end
end
