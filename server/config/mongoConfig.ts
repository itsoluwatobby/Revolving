import { connect } from "mongoose";
import asyncHandler from 'express-async-handler';

const dbConfig = asyncHandler( async() => {
  await connect(process.env.STORY_DB!)
})
export default dbConfig