# frozen_string_literal: true

module Imageable
  extend ActiveSupport::Concern
  require 'openssl'
  require 'active_support/core_ext/numeric/bytes'

  included do
    has_many_attached :images

    def generate_file_id(file)
      file_io = File.open(file, 'r')
      file_checksum = self.class.compute_checksum_in_chunks(file_io)
      file_io.close
      return "#{self.id}-#{file_checksum}"
    end
  end

  class_methods do
    def compute_checksum_in_chunks(io)
      Digest::MD5.new.tap do |checksum|
        while(chunk = io.read(5.megabytes))
          checksum << chunk
        end

        io.rewind
      end.base64digest
    end
  end
end
