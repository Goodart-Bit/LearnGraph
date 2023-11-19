# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)
# Seed data for notes
@range = 25
@user_data = [{email: 'lina@gmail.com', name: 'Lina', password: '1234567'},
             {email: 'sandal@gmail.com', name: 'Sam', password: '1234567'},
             {email: 'drek@gmail.com', name: 'Derek', password: '1234567'}]

def populate_users
  @user_data.each { |user| User.create(email: user[:email], first_name: user[:name], password: user[:password]) }
end
def generate_medicine_title(used_titles)
  title = Faker::Science.element
  while used_titles.include?(title)
    title = Faker::Science.element
  end
  title
end

# Generating a longer summary for each medicine title with English words
def generate_medicine_body
  Faker::Lorem.paragraphs(number: rand(10..20), supplemental: true).join("\n\n")
end
def populate_user_notes(user)
  used_titles = []
  @range.times do
    title = generate_medicine_title(used_titles)
    used_titles << title
    body = generate_medicine_body
    Note.create(title: title, body: body, user: user)
  end
end

def populate_edges(user)
  count = Edge.count
  until Edge.count >= (count + 20)
    source = user.notes.sample
    target = source
    target = user.notes.sample until source != target
    Edge.create(source: source, target: target) unless Edge.exists?(source: source, target: target)
  end
end

populate_users
User.all.each do |user|
  populate_user_notes(user)
  populate_edges(user)
end
