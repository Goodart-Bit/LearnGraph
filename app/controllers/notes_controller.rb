class NotesController < ApplicationController
    def new
        @note = Note.new
    end

    def create
        note_data = params[:note]
        @note = Note.new(title: note_data[:title], body: note_data[:body], user_id: current_user.id)
        if @note.save
            puts "saved succesfully"
        else
            p @note.errors
        end
    end

    def index
        @notes = Note.all
    end

    def show
        @note = Note.find(params[:id])
    end
end
