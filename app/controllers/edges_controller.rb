class EdgesController < ApplicationController
  def new
    title_arg = "%#{params[:title_query]}%".downcase
    @match_notes = Note.select(:id, :user_id, :title).
      where("LOWER(title) LIKE ? AND id != ? AND user_id = ?", title_arg, params[:note_id], current_user.id).to_a
  end

  def create
    setup_note
  end

  private

  def setup_note
    @note = Note.new
    @note.pointers.build
  end
end
