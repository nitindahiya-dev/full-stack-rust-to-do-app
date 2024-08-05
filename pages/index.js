import React, { useState, useEffect } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import axios from "axios";
import { format } from "date-fns";

const Index = () => {
  const [todos, setTodos] = useState([]);
  const [todosCopy, setTodosCopy] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [searchItem, setSearchItem] = useState("");
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchTodo();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchItem), 1000);
    return () => clearTimeout(timer);
  }, [searchItem]);

  useEffect(() => {
    if (search) {
      onHandleSearch(search);
    } else {
      onClearSearch();
    }
  }, [search]);

  const fetchTodo = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/todos");
      setTodos(response.data);
      setTodosCopy(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async (event) => {
    event.preventDefault();

    if (!todoInput.trim()) {
      setErrorMessage("Please enter a todo item.");
      return;
    }
    setErrorMessage("");

    try {
      if (editIndex === -1) {
        await axios.post("http://127.0.0.1:8000/todos", {
          title: todoInput,
          completed: false,
        });
        window.location.reload(); // Refresh the page after adding a todo
      } else {
        const todoToUpdate = { ...todos[editIndex], title: todoInput };
        await axios.put(
          `http://127.0.0.1:8000/todos/${todoToUpdate.id}`,
          todoToUpdate
        );
        window.location.reload(); // Refresh the page after updating a todo
      }
    } catch (error) {
      console.error("Error adding/updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/todos/${id}`);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      setTodosCopy((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const toggleCompleted = async (id) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === id);
      if (!todoToUpdate) return;
      const updatedTodo = {
        ...todoToUpdate,
        completed: !todoToUpdate.completed,
      };
      await axios.put(`http://127.0.0.1:8000/todos/${updatedTodo.id}`, updatedTodo);
      window.location.reload();
    } catch (error) {
      console.error("Error toggling todo completion:", error);
    }
  };

  const onHandleSearch = (value) => {
    const filteredTodo = todosCopy.filter(({ title }) =>
      title.toLowerCase().includes(value.toLowerCase())
    );
    setTodos(filteredTodo);
  };

  const onClearSearch = () => {
    setTodos(todosCopy);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Invalid Date"
        : format(date, "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      console.error(error);
      return "Invalid Date";
    }
  };

  const editTodo = (index) => {
    if (index >= 0 && index < todos.length) {
      setTodoInput(todos[index].title);
      setEditIndex(index);
    }
  };

  return (
    <div className="main-body">
      <div className="todo-app">
        <div className="input-section">
          <input
            type="text"
            placeholder="Add Item..."
            id="todoInput"
            value={todoInput}
            onChange={(e) => setTodoInput(e.target.value)}
          />
          <button onClick={addTodo} className="add">
            {editIndex === -1 ? "Add" : "Update"}
          </button>
          <input
            type="text"
            placeholder="Search..."
            id="search-input"
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
          />
        </div>
        {errorMessage && (
          <div className="error-message">{errorMessage}</div>
        )}
        <div className="todos">
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className="li">
                <label htmlFor="" className="form-check-label">
                  <input
                    type="checkbox"
                    checked={todo.completed || false}
                    onChange={() => toggleCompleted(todo.id)}
                  />
                </label>
                <span className="todo-text">
                  {`${todo.title} ${
                    todo.created_at ? formatDate(todo.created_at) : ""
                  }`}
                </span>
                <span className="span-button" onClick={() => deleteTodo(todo.id)}>
                  <MdDelete />
                </span>
                <span
                  className="span-button"
                  onClick={() => editTodo(todos.findIndex((t) => t.id === todo.id))}
                >
                  <MdEdit />
                </span>
              </li>
            ))}
          </ul>
          {todos.length === 0 && (
            <div className="">
              <h1 className="not-found not-found-top">
                Please Enter Something..!!
              </h1>
              <br />
              <h1 className="not-found">NOT FOUND</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
