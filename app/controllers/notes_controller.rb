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

    def get_all
        @notes = Note.all
        render json: @notes
    end

    def index
        @notes = Note.all
    end

    def show
        @note = Note.find(params[:id])
        render json: @note
    end

    def edit
        @note = Note.find(params[:id])
    end

    def update
        @note = Note.find(params[:id])

        if @note.update(note_params)
            redirect_to @note
        else
            render :edit, status: :unprocessable_entity
        end
    end

    def graph_index
        @notes = Note.all
    end
end
