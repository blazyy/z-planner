'use client'

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import type { RootState, AppDispatch } from './store'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// If confused, check this answer https://stackoverflow.com/a/67656911
// In short, we use useAppDispatch and useAppSelector instead of useDispatch and useSelector to make TypeScript happy
