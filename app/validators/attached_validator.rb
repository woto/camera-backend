class AttachedValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, _value)
    attachment = record.public_send(attribute)
    return if attachment.respond_to?(:attached?) && attachment.attached?

    record.errors.add(attribute, options[:message] || "must be attached")
  end
end
