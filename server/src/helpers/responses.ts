
const statuses = {
  "200": "SUCCESS",
  "201": "RESOURCE-CREATED",
  "204": "MODIFICATION-SUCCESS",
  "208": "ALREADY-PROCESSED",
  "307": "REDIRECTED",
  "400": "BAD-REQUEST",
  "401": "UNAUTHORIZED",
  "403": "FORBIDDEN",
  "404": "NOT-FOUND",
  "405": "METHOD-NOT-ALLOWED",
  "406": "UNACCEPTABLE",
  "409": "CONFILICT",
  "423": "ACCOUNT-LOCKED",
  "429": "TOO-MANY-REQUESTS",
  "500": "INTERNAL-SERVER-ERROR"
}

// export const messageResponses = (param: string) => {

//   return {
//     error: {
//       "not-found-error-data": {
//         status: statuses.404,
//         message: `${param} not found`
//       },
//       "not-found-error-user": {
//         status: 404,
//         message: `${param} not found`
//       }
//     },
//     success: {}
//   }
// }

