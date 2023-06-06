class NotesController < ApplicationController
    def new
        @note = Note.new
    end

    def create
        note_data = params[:note]
        @note = Note.new(title: note_data[:title], body: note_data[:body], user_id: current_user.id)
        if @note.save
            flash[:alert] = 'Nota guardada con éxito' # TODO: Fish flash alert not showing on redirect
            redirect_to edit_note_path(@note), status: :see_other
        else
            flash[:alert] = 'Hubo un error al intentar guardar la nota'
            render action: :new, status: :unprocessable_entity
        end
    end

    def get_all
        @notes = current_user.notes
        render json: @notes
    end

    def index
        @notes = current_user.notes
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
    end

    def graph_index
    end
end
