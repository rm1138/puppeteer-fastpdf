# Puppeteer Fast PDF

This project aims to provide a web service to convert HTML to PDF focused on performance and with full language support.

## Development

1. Install dependency

```bash
yarn install
```

2. Build

```bash
yarn build
```

## Start

1. Start

```bash
yarn start
```

## Usage

`http://localhost:8080/convert?url=<encoded-target-url>`

| Query           | Description        | Default | Avaliable options                    |
| --------------- | ------------------ | ------- | ------------------------------------ |
| url             | Encoded Target url | -       | -                                    |
| timeout         | Timeout(ms)        | 5000    | -                                    |
| format          | Paper format       | A4      | A1-A6, Letter, Legal, Taboid, Ledger |
| printBackground | Print Background   | true    | true, false                          |
