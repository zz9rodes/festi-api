import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: any, ctx: HttpContext) {
    ctx.response.status(error.status || 500)

    console.log(error.code)
    console.log(error.message)

    // Handle VineJS validation errors
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return ctx.response.status(422).json({
        error: true,
        message: error.messages[0].message, // Use the first error message as main message
        code: 'VALIDATION_ERROR',
        errors: error.messages,
      })
    }

    // Handle generic errors (always return JSON for API)
    return ctx.response.json({
      error: true,
      message: error.message || 'Une erreur est survenue',
      code: error.code || 'INTERNAL_SERVER_ERROR',
      details: this.debug ? error.stack : undefined,
    })
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    if (this.shouldReport(error as any)) {
      ctx.logger.error({ err: error }, (error as any).message)
    }
    return super.report(error, ctx)
  }
}
