import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import { ChatProps } from "../../data";
import { RootState } from "../../app/store";
// import { sub } from "date-fns";

//const dateTime = sub(new Date, { minutes: 0 }).toISOString();

const defaultMessages = [
  {
    adminId: '1234',
    message: "Welcome USER, how may i help you?",
    image: '',
    _id: nanoid(5)
  },
  {
    adminId: '1234',
    message: "I will get back to you soo, with whatever your request is. Please be patient?",
    image: '',
    _id: nanoid(5)
  }
] as ChatProps[]

const initialState = {
  chats: [defaultMessages[0]] as ChatProps[],
  chat: {} as ChatProps
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers:{
    createChatMessage: (state, action: PayloadAction<ChatProps>) => {
      state.chat = action.payload
      state.chats = [...state.chats, action.payload]
      if(state.chats.length == 2){
        state.chats.push(defaultMessages[1])
      }
    },
    setChatMessages: (state, action: PayloadAction<ChatProps[]>) => {
      
      // else{
      //   state.chats = [...state.chats, state.chat]
      // }
    }
  }
})

export const { createChatMessage, setChatMessages } = chatSlice.actions
export const getMessage = (state: RootState) => state.chat.chat
export const getChatMessages = (state: RootState) => state.chat.chats

export default chatSlice.reducer
