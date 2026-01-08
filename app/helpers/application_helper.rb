module ApplicationHelper
  # Remove 'selected' query parameter from any URLs inside the provided HTML fragment.
  # This is a safety measure to ensure pagination links do not carry the `selected` param.
  def strip_selected_from_pagination(html)
    str = html.to_s
    # Remove 'selected' param occurrences like '?selected=123', '&selected=123' or '&amp;selected=123'
    str = str.gsub(/([?&]|&amp;)selected=[^&"']+(&|&amp;)?/) do
      sep = Regexp.last_match(1)
      tail = Regexp.last_match(2)
      # If there was a trailing separator, preserve the leading separator so other params remain valid.
      tail ? sep : ""
    end
    # Clean up malformed '?&' or '?&amp;' and trailing separators before closing quotes
    str = str.gsub("?&", "?").gsub("?&amp;", "?").gsub(/([?&])"/, '"').gsub('?"', '"')
    str
  end
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

  def render_json_metadata(payload)
    json = JSON.pretty_generate(payload)
    escaped = CGI.escapeHTML(json)
    highlighted = escaped.gsub(/("(?:\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/) do |match|
      if match.start_with?("\"") && match.end_with?(":")
        %(<span class="json-key">#{match}</span>)
      elsif match.start_with?("\"")
        %(<span class="json-string">#{match}</span>)
      elsif match == "true" || match == "false"
        %(<span class="json-boolean">#{match}</span>)
      elsif match == "null"
        %(<span class="json-null">#{match}</span>)
      else
        %(<span class="json-number">#{match}</span>)
      end
    end
    highlighted.html_safe
  end

  def support_email
    ENV.fetch("SUPPORT_EMAIL", "oganer@gmail.com")
  end
end
