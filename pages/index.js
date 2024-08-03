import React, { useState, useEffect } from "react";
import { MdDelete, MdEdit, MdConfirmationNumber } from "react-icons/md";
import axios from "axios";
import { format } from "date-fns";

const Index = () => {
  const [editText, setEditText] = useState("");
  const [todos, setTodos] = useState([]);
  const [todosCopy, setTodosCopy] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [count, setCount] = useState(0);
  const [searchItem, setSearchItem] = useState("");

  useEffect(() => {
    fetchTodo();
  }, [count]);

  const editTodo = (index) => {
    setTodoInput(todos[index].title);
    setEditIndex(index);
  };

  const fetchTodo = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/todos");
      setTodos(response.data);
      setTodosCopy(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async () => {
    try {
      if (editIndex === -1) {
        const response = await axios.post("http://127.0.0.1:8000/todos", {
          title: todoInput,
          completed: false,
        });
        setTodos((prevTodos) => [...prevTodos, response.data]);
        setTodosCopy((prevTodos) => [...prevTodos, response.data]);
        setTodoInput("");
      } else {
        const todoToUpdate = { ...todos[editIndex], title: todoInput };
        const response = await axios.put(
          `http://127.0.0.1:8000/todos/${todoToUpdate.id}`,
          todoToUpdate
        );
        const updatedTodos = [...todos];
        updatedTodos[editIndex] = response.data;
        setTodos(updatedTodos);
        setEditIndex(-1);
        setTodoInput("");
      }
    } catch (error) {
      console.error("Error adding/updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/todos/${id}`);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const toggleCompleted = async (id) => {
    try {
      const todoToUpdate = todos.find((todo) => todo.id === id);
      const updatedTodo = {
        ...todoToUpdate,
        completed: !todoToUpdate.completed,
      };
      const response = await axios.put(
        `http://127.0.0.1:8000/todos/${updatedTodo.id}`,
        updatedTodo
      );
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? response.data : todo
      );
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error toggling todo completion:", error);
    }
  };

  const searchTodo = () => {
    const results = todos.filter((todo) =>
      todo.title.toLowerCase().includes(searchInput.toLowerCase())
    );
    setSearchResults(results);
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
          <button onClick={() => addTodo()} className="add">
            {editIndex === -1 ? "Add" : "Update"}
          </button>
          <input
            type="text"
            placeholder="Search..."
            id="search-input"
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
          />
          <button onClick={searchTodo} className="">
            Search
          </button>
        </div>
        <div className="todos">
          <ul className="todo-list">
            {(searchResults.length > 0 ? searchResults : todos).map(
              (todo, index) => (
                <div key={todo.id} className="todo-item">
                  <span>{todo.title}</span>
                  <span>{formatDate(todo.created_at)}</span>
                  <MdEdit onClick={() => editTodo(index)} />
                  <MdDelete onClick={() => deleteTodo(todo.id)} />
                  <MdConfirmationNumber
                    onClick={() => toggleCompleted(todo.id)}
                  />
                </div>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
