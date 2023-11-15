class TagsController < ApplicationController
  def new
  end

  def create
      Tag.create(note: Note.find(params[:note_id]), user: current_user, title: params[:tag_title])
      @tags = Note.find(params[:note_id]).tags
      render 'refresh'
  end

  def destroy
    Tag.find(params[:tag_id]).destroy
    @tags = Note.find(params[:note_id]).tags
    render 'refresh'
  end
end
