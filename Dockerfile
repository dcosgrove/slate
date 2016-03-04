FROM node:5.7

RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install -y zlib1g-dev
RUN apt-get install -y ruby ruby-dev
RUN gem install bundler

COPY . /app

# Build slate deps initially
WORKDIR /app/slate
RUN bundle install

WORKDIR /app

RUN npm install

EXPOSE 5000

CMD ["node", "."]
