FROM golang:1.26-alpine
LABEL authors="ziomciopoziomcio"

RUN apk add --no-cache git

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download


COPY . .

RUN go build -o main ./cmd/api/main.go

EXPOSE 8000
CMD ["./main"]


