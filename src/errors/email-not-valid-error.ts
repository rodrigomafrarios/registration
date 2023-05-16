export class EmailNotValidError extends Error {
  constructor() {
    super()
    this.name = "EmailNotValidError"
    this.message = "E-mail not valid"
  }
}