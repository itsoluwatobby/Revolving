import { Schema, model } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    subscribeId: { 
      type: Schema.Types.ObjectId, ref: 'users', 
      required: [true, 'you need to provide the ID of the you want to subcribe to'] 
    }, 
    subscriberId: { 
      type: Schema.Types.ObjectId, ref: 'users', 
      required: [true, 'you need to provide your ID'] 
    }
  },
  {
    timestamps: true
  }
)

export const SubscriptionModel = model('subscriptions', SubscriptionSchema)