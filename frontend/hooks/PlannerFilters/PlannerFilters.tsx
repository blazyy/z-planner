import { Draft, produce } from 'immer'
import { Dispatch, createContext, useContext, useReducer } from 'react'

type PlannerFiltersType = {
  searchQuery: string
  selectedCategories: string[]
}

const plannerFiltersReducer = produce((draft: Draft<PlannerFiltersType>, action) => {
  switch (action.type) {
    case 'selectedCategoriesChanged':
      const { clickedCategory } = action.payload
      if (draft.selectedCategories.indexOf(clickedCategory) === -1) draft.selectedCategories.push(clickedCategory)
      else draft.selectedCategories = draft.selectedCategories.filter((cat: string) => cat != clickedCategory)
      break
    case 'searchQueryChanged':
      const { searchQuery } = action.payload
      draft.searchQuery = searchQuery
      break
    case 'filtersReset':
      draft.searchQuery = ''
      draft.selectedCategories = []
      break
  }
})

const initialPlannerFilterEmptyState: PlannerFiltersType = {
  searchQuery: '',
  selectedCategories: [],
}

export const PlannerFiltersContext = createContext<PlannerFiltersType>(initialPlannerFilterEmptyState)
export const PlannerFiltersDispatchContext = createContext<Dispatch<any>>(() => {})

export const usePlannerFilters = () => {
  return useContext(PlannerFiltersContext)
}

export const usePlannerFiltersDispatch = () => {
  return useContext(PlannerFiltersDispatchContext)
}

export const PlannerFiltersProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const [plannerFiltersData, dispatch] = useReducer(plannerFiltersReducer, initialPlannerFilterEmptyState)

  return (
    <PlannerFiltersContext.Provider value={plannerFiltersData}>
      <PlannerFiltersDispatchContext.Provider value={dispatch}>{children}</PlannerFiltersDispatchContext.Provider>
    </PlannerFiltersContext.Provider>
  )
}
