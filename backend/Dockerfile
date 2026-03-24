FROM golang:1.22-alpine
LABEL authors="ziomciopoziomcio"

WORKDIR /app
COPY go.mod go.sum ./
RUN apt-get update && apt-get install -y golang-go
RUN go mod download


COPY . .

RUN useradd app
USER app

RUN go build -o main .

EXPOSE 8000
CMD ["./main"]


