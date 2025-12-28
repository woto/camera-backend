module ApplicationHelper
  def render_markdown(markdown)
    html = Kramdown::Document.new(markdown, input: "GFM").to_html
    sanitize(
      html,
      tags: %w[
        h1 h2 h3 h4 h5 h6 p ul ol li a strong em code pre blockquote hr br
        table thead tbody tr th td del img
      ],
      attributes: %w[href title src alt]
    )
  end
end
