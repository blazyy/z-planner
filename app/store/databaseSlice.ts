import supabase from '@/app/db/supabase'
import { createSlice } from '@reduxjs/toolkit'
import { SupabaseClient } from '@supabase/supabase-js'

type InitialState = {
  supabase: null | SupabaseClient
}

const initialState: InitialState = {
  supabase: supabase,
}

export const databaseSlice = createSlice({
  name: 'database',
  initialState: initialState,
  reducers: {
    // initSupabase: (state, action) => {
    //   state.supabase = action.payload.supabase
    // },
  },
})

export const {} = databaseSlice.actions

export default databaseSlice.reducer
