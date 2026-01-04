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

  def event_preview_frames(event)
    captures = event.captures.to_a.sort_by(&:created_at)
    return [] if captures.empty?

    frames = captures.flat_map do |capture|
      if capture.large_thumbnails.attached?
        capture.large_thumbnails.to_a
      else
        capture.small_thumbnails.to_a
      end
    end

    frames
  end
end
