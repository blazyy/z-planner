'use client'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}`
const supabaseApiKey = `${process.env.NEXT_PUBLIC_SUPABASE_API_KEY}`

export const supabaseClient = createClient(supabaseUrl, supabaseApiKey)
