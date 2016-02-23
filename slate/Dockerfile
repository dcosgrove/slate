FROM nginx

RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install -y zlib1g-dev
RUN apt-get install -y ruby ruby-dev
RUN apt-get install -y nodejs
RUN gem install bundler

COPY . /app
WORKDIR /app

RUN bundle install
RUN bundle exec middleman build --clean
RUN mv /app/build/* /usr/share/nginx/html
