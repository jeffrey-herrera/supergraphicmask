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
  // Undo/Redo history
  history: Transform[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}

type AppAction =
  | { type: 'SET_IMAGE'; payload: string | null }
  | { type: 'SET_MASK'; payload: string | null }
  | { type: 'SET_TRANSFORM'; payload: Transform }
  | { type: 'RESET_TRANSFORM' }
  | { type: 'SET_EXPORTING'; payload: boolean }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'RESET_STATE' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

const initialTransform: Transform = {
  scale: 1,
  translateX: 0,
  translateY: 0,
};

const initialState: AppState = {
  selectedImage: null,
  selectedMask: 'mask1',
  transform: initialTransform,
  isExporting: false,
  isDragging: false,
  history: [initialTransform],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
};

// Maximum number of history states to keep
const MAX_HISTORY_SIZE = 50;

// Helper function to add transform to history
function addToHistory(state: AppState, newTransform: Transform): AppState {
  // Don't add to history if transform is the same as current
  const currentTransform = state.transform;
  if (
    newTransform.scale === currentTransform.scale &&
    newTransform.translateX === currentTransform.translateX &&
    newTransform.translateY === currentTransform.translateY
  ) {
    return state;
  }

  // Remove any future history if we're not at the end
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  
  // Add new transform to history
  newHistory.push(newTransform);
  
  // Limit history size
  if (newHistory.length > MAX_HISTORY_SIZE) {
    newHistory.shift();
  }
  
  const newHistoryIndex = newHistory.length - 1;
  
  return {
    ...state,
    transform: newTransform,
    history: newHistory,
    historyIndex: newHistoryIndex,
    canUndo: newHistoryIndex > 0,
    canRedo: false,
  };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_IMAGE':
      return { ...state, selectedImage: action.payload };
    
    case 'SET_MASK':
      return { ...state, selectedMask: action.payload };
    
    case 'SET_TRANSFORM':
      return addToHistory(state, action.payload);
    
    case 'RESET_TRANSFORM':
      return addToHistory(state, initialTransform);
    
    case 'UNDO':
      if (state.canUndo) {
        const newIndex = state.historyIndex - 1;
        const newTransform = state.history[newIndex];
        return {
          ...state,
          transform: newTransform,
          historyIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: true,
        };
      }
      return state;
    
    case 'REDO':
      if (state.canRedo) {
        const newIndex = state.historyIndex + 1;
        const newTransform = state.history[newIndex];
        return {
          ...state,
          transform: newTransform,
          historyIndex: newIndex,
          canUndo: true,
          canRedo: newIndex < state.history.length - 1,
        };
      }
      return state;
    
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