import { createSlice } from '@reduxjs/toolkit'
import { SupabaseClient } from '@supabase/supabase-js'

type InitialState = {
  supabaseClient: null | SupabaseClient
}

const initialState: InitialState = {
  supabaseClient: null,
}

export const databaseSlice = createSlice({
  name: 'database',
  initialState: initialState,
  reducers: {
    initSupabase: (state, action) => {
      state.supabaseClient = action.payload.supabaseClient
    },
  },
})

export const { initSupabase } = databaseSlice.actions

export default databaseSlice.reducer
