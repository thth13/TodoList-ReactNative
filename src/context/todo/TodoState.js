import React, { useReducer, useContext } from 'react'
import { Alert } from 'react-native'
import { ADD_TODO, UPDATE_TODO, REMOVE_TODO, HIDE_LOADER, SHOW_LOADER, CLEAR_ERROR, SHOW_ERROR, FETCH_TODOS } from '../types'
import { TodoContext } from './todoContext'
import { todoReducer } from './todoReducer'
import { ScreenContext } from '../screen/screenContext'
import { Http } from '../../http'

export const TodoState = ({ children }) => {
  const initialState = {
    todos: [],
    loading: false,
    error: null
  }
  
  const { changeScreen } = useContext(ScreenContext);
  const [state, dispatch] = useReducer(todoReducer, initialState)

  const addTodo = async title => {
    clearError()
    try {
      const data = await Http.post(
        'https://rn-todo-app-6a885.firebaseio.com/todos.json',
        { title }
      )

      dispatch({ type: ADD_TODO, title, id: data.name })
    } catch (e) {
      showError('Some error...')
    }

  }

  const removeTodo = id => {
    const todo = state.todos.find(t => t.id === id)

    Alert.alert(
      'Delete item',
      `Are you sure to delete "${todo.title}"?`,
      [
        {
          text: 'Cancel',
          style:'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            changeScreen(null)
            await Http.delete(`https://rn-todo-app-6a885.firebaseio.com/todos/${id}.json`)
            dispatch({ type: REMOVE_TODO, id })
          }
        }
      ],
      { cancelable: false }
    )
  }

  const fetchTodos = async () => {
    showLoader()
    clearError()
    try {
      const data = await Http.get('https://rn-todo-app-6a885.firebaseio.com/todos.json')
      const todos = Object.keys(data).map(key => ({ ...data[key], id: key }))
      dispatch({ type: FETCH_TODOS, todos })
    } catch (e) {
      showError('Some error...')
      console.log(e)
    } finally {
      hideLoader()
    }
  }

  const updateTodo = async (id, title) => {
    try {
      await Http.patch(`https://rn-todo-app-6a885.firebaseio.com/todos/${id}.json`)
      dispatch({ type: UPDATE_TODO, id, title })
    } catch (e) {
      showError('Some error...')
      console.log(e)
    }
  }

  const showLoader = () => {
    dispatch({ type: SHOW_LOADER })
  }

  const hideLoader = () => {
    dispatch({ type: HIDE_LOADER })
  }

  const showError = error => {
    dispatch({ type: SHOW_ERROR, error })
  }

  const clearError = error => {
    dispatch({ type: CLEAR_ERROR })
  }

  return (
    <TodoContext.Provider
      value={{
        todos: state.todos,
        loading: state.loading,
        error: state.error,
        addTodo,
        removeTodo,
        updateTodo,
        fetchTodos
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}