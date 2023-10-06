class EdgesController < ApplicationController
  def new
    title_arg = "%#{params[:title_query]}%".downcase
    @match_notes = Note.select(:id, :user_id, :title).
      where("LOWER(title) LIKE ? AND id != ? AND user_id = ?", title_arg, params[:note_id], current_user.id).to_a
  end

  def index
    edges = current_user.notes.reduce([]) do |user_edges, note|
      note.pointers.each do |linked_note|
        link_ids = [note.id, linked_note.target_id]
        user_edges << link_ids unless
          user_edges.index do |edge_ids|
            edge_ids == link_ids
          end  # only accept non stored edges
      end
      user_edges
    end
    p edges
    render json: edges
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
