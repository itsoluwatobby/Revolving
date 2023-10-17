import { ConnectOptions, connect } from "mongoose";

export const dbConfig = () => {
  connect(process.env.REVOLVING_DB, {
      useNewUrlParser: true, useUnifiedTopology: true
    } as ConnectOptions)
  .then(() => {return})
  .catch(error => console.log({"MONGO_CONNECTION_ERROR": error.message}))
}
