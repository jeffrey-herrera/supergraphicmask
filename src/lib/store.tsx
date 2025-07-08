import { createContext, useContext, useReducer, type ReactNode } from 'react';

export interface Transform {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface AppState {
  selectedImage: string | null;
  selectedMask: string | null;
  transform: Transform;
  isExporting: boolean;
  isDragging: boolean;
}

type AppAction =
  | { type: 'SET_IMAGE'; payload: string | null }
  | { type: 'SET_MASK'; payload: string | null }
  | { type: 'SET_TRANSFORM'; payload: Transform }
  | { type: 'RESET_TRANSFORM' }
  | { type: 'SET_EXPORTING'; payload: boolean }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  selectedImage: null,
  selectedMask: 'mask1',
  transform: {
    scale: 1,
    translateX: 0,
    translateY: 0,
  },
  isExporting: false,
  isDragging: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_IMAGE':
      return { ...state, selectedImage: action.payload };
    case 'SET_MASK':
      return { ...state, selectedMask: action.payload };
    case 'SET_TRANSFORM':
      return { ...state, transform: action.payload };
    case 'RESET_TRANSFORM':
      return { ...state, transform: initialState.transform };
    case 'SET_EXPORTING':
      return { ...state, isExporting: action.payload };
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}