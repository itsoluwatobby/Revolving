import { ConnectOptions, connect } from "mongoose";
import asyncHandler from 'express-async-handler';

export const dbConfig = asyncHandler( async(): Promise<void> => {
  await connect(process.env.REVOLVING_DB, {
    useNewUrlParser: true, useUnifiedTopology: true
  } as ConnectOptions)
})
