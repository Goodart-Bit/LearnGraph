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

    def lookup
        param_queries = {title: "LOWER(title) LIKE :title", body: "LOWER(body) LIKE :body"} 
        query_st = param_queries.keys.reduce("") do |query, param_key|
            next(query) if params[param_key].nil?

            query += " OR " unless query.empty?
            query += param_queries[param_key]
        end
        render json: Note.where(query_st, {title: "%#{params[:title].downcase}%"}) #TODO: Exclude nil params
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
    end

    def graph_index
        @notes = Note.all
    end
end
