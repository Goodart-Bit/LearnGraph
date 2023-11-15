class NotesController < ApplicationController
    before_action :assert_note, only: %i[show edit]
    before_action :set_note, only: %i[update destroy add_note_img]
    before_action :set_cache_headers, only: %i[index graph_index]

    def new
    end

    def create
        @note = Note.new(note_params)
        @note.user_id = current_user.id
        if @note.save
            flash[:alert] = 'Nota guardada con éxito' # TODO: Fish flash alert not showing on redirect
            redirect_to edit_note_path(@note), status: :see_other
        else
            flash[:alert] = 'Hubo un error al intentar guardar la nota, revise que el nombre sea único'
            render partial: "notes/shared/new", status: :unprocessable_entity
        end
    end

    def index
        session[:redirect_to] = request.fullpath
        @notes = current_user.notes
    end

    def get_notes
        raw_notes = current_user.notes.each do |note|
            note.body = Nokogiri::HTML(note.body).text.downcase
        end
        render json: raw_notes, include: [tags: {only: :title}]
    end

    def show
        render json: @note
    end

    def edit
    end

    def update
        if @note.update(note_params)
            destroy_image_attrs
            redirect_to edit_note_path(@note), flash: { notice: 'Nota guardada con éxito' }
        else
            redirect_to action: :new, status: :unprocessable_entity, alert: 'Hubo un error al intentar actualizar la nota'
        end
    end

    def destroy
        unless @note.destroy
            flash.now[:alert] = 'Hubo un error al intentar borrar la nota'
            return render @note
        end
        redirect_target = session[:redirect_to] ? session[:redirect_to] : notes_path
        redirect_to redirect_target, status: :see_other
    end

    def graph_index
        session[:redirect_to] = request.fullpath
    end

    def add_note_img
        uploaded_file = params[:new_image]
        @image_id = @note.generate_file_id uploaded_file.to_io
    end

    private

    def set_note
        @note = Note.find(params[:id])
    end

    def assert_note
        begin
            @note = Note.find(params[:id])
        rescue
            redirect_to session[:redirect_to], alert: 'Nota no encontrada, elimine el enlace de la nota.'
        end
    end

    def note_params
        attributes = [:title, :body, images: [], pointers_attributes: [:id, :target_id, :_destroy]]
        permitted_attributes = params.require(:note).permit(attributes)
        map_target_notes permitted_attributes[:pointers_attributes]
        permitted_attributes
    end

    def destroy_image_attrs
        destroyable = params.require(:note).permit([destroy_images: []])[:destroy_images]
        return unless destroyable

        destroyable.each do |checksum|
            target_img = @note.images.find { |image| "#{@note.id}-#{image.checksum}" === checksum }
            target_img.purge if target_img
        end
    end

    def map_target_notes(permit_pointer_attrs)
        permit_pointer_attrs.to_h.each do |idx, edge|
            target_id = edge[:target_id]
            permit_pointer_attrs[idx][:target] = Note.find(target_id) # CREATES A [:target] PARAMETER
        end                                                           # TO FILL IN EDGE FROM ASSOCIATION
    end                                                               # AS IT DOESNT RECEIVE TARGET_IDS BY DEFAULT

    def set_cache_headers
        response.headers["Cache-Control"] = "no-cache, no-store"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "Mon, 01 Jan 1990 00:00:00 GMT"
    end
end

