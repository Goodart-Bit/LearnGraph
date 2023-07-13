class NotesController < ApplicationController
    def new
        @note = Note.new
    end

    def create
        @note = Note.new(note_params)
        @note.user_id = current_user.id
        if @note.save
            flash[:alert] = 'Nota guardada con éxito' # TODO: Fish flash alert not showing on redirect
            redirect_to edit_note_path(@note), status: :see_other
        else
            flash[:alert] = 'Hubo un error al intentar guardar la nota'
            render action: :new, status: :unprocessable_entity
        end
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
        if @note.update(note_params)
            flash.now[:notice] = 'La nota se actualizó correctamente'
            render action: :edit, status: :ok
        else
            render action: :edit, status: :unprocessable_entity, alert: 'Hubo un error al intentar actualizar la nota'
        end
    end

    def destroy
        @note = Note.find(params[:id])
        unless @note.destroy
            flash.now[:alert] = 'Hubo un error al intentar borrar la nota'
            return render @note
        end
        redirect_to notes_path, notice: 'Se eliminó la nota correctamente'
    end

    def graph_index
    end

    private

    def note_params
        params.require(:note).permit(:title, :body, pointers_attributes: [:source, :target])
    end
end
