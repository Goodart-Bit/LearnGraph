class NotesController < ApplicationController
    def new
        @note = Note.new
    end

    def Fcreate
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

    def get_all
        @notes = current_user.notes
        render json: @notes
    end

    def get_by_title
        title_arg = "%#{params[:title_query]}%"
        @match_notes = Note.where("title LIKE ? AND id != ?", title_arg, params[:id])
        render partial: 'notes/shared/link_note_form'
    end

    def link_note
        @src_note = Note.find(params[:id])
        @target_note = Note.find(params[:target[id]])
        if cache_links(@src_note, @target_note)
            render action: edit, notice: 'Enlace enlazado correctamente, asegurese de guardar'
        else
            render action: edit, alert: 'Hubo un error al procesar el enlace,
             asegurese de seleccionar una nota de destino'
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
        if @note.destroy
            redirect_to notes_path, notice: 'Se eliminó la nota correctamente'
        else
            flash.now[:alert] = 'Hubo un error al intentar borrar la nota'
        end
    end

    def graph_index
    end

    private

    def note_params
        params.require(:note).permit(:title, :body)
    end

    def cache_links(src_note, target_note)
        begin
            src_note.pointers += [target_note]
            target_note.mentions += [src_note]
            flash.now[:mod_src] = src_note
            flash.now[:mod_target] = target_note
        rescue => exception
            puts exception
            return false
        end
    end
end
