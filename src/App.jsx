import { useState, useEffect } from 'react'
import './App.css'

// Definição das categorias disponíveis com cores
const categories = [
  { id: 'trabalho', name: 'Trabalho', color: '#4299e1' },
  { id: 'pessoal', name: 'Pessoal', color: '#9f7aea' },
  { id: 'estudo', name: 'Estudo', color: '#38b2ac' },
  { id: 'saude', name: 'Saúde', color: '#f56565' },
  { id: 'lazer', name: 'Lazer', color: '#ed8936' }
];

// Definição dos níveis de prioridade
const priorities = [
  { id: 'baixa', name: 'Baixa', color: '#68d391' },
  { id: 'media', name: 'Média', color: '#fbd38d' },
  { id: 'alta', name: 'Alta', color: '#fc8181' }
];

function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const savedTodos = localStorage.getItem('todos');
      
      if (savedTodos) {
        // Migrar tarefas existentes para o novo formato
        const parsedTodos = JSON.parse(savedTodos);
        
        return parsedTodos.map(todo => ({
          ...todo,
          // Garantir que todas as tarefas tenham as novas propriedades
          category: todo.category || 'trabalho',
          priority: todo.priority || 'media',
          subtasks: todo.subtasks || []
        }));
      }
      return [];
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      // Se houver algum erro, começar com lista vazia
      localStorage.removeItem('todos');
      return [];
    }
  });
  const [inputValue, setInputValue] = useState('')
  const [responsibleValue, setResponsibleValue] = useState('')
  const [dueDateValue, setDueDateValue] = useState('')
  const [categoryValue, setCategoryValue] = useState('trabalho')
  const [priorityValue, setPriorityValue] = useState('media')
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showSubtasks, setShowSubtasks] = useState({})
  const [subtaskInput, setSubtaskInput] = useState({})

  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos))
    } catch (error) {
      console.error("Erro ao salvar tarefas:", error);
    }
  }, [todos])

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: inputValue,
          responsible: responsibleValue.trim() || "Não definido",
          dueDate: dueDateValue || null,
          completed: false,
          category: categoryValue,
          priority: priorityValue,
          subtasks: []
        }
      ])
      setInputValue('')
      setResponsibleValue('')
      setDueDateValue('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const addSubtask = (todoId) => {
    if (subtaskInput[todoId] && subtaskInput[todoId].trim()) {
      setTodos(todos.map(todo => {
        if (todo.id === todoId) {
          return {
            ...todo,
            subtasks: [
              ...(todo.subtasks || []),
              {
                id: Date.now(),
                text: subtaskInput[todoId],
                completed: false
              }
            ]
          };
        }
        return todo;
      }));
      setSubtaskInput({...subtaskInput, [todoId]: ''});
    }
  }

  const toggleSubtask = (todoId, subtaskId) => {
    setTodos(todos.map(todo => {
      if (todo.id === todoId && Array.isArray(todo.subtasks)) {
        return {
          ...todo,
          subtasks: todo.subtasks.map(subtask => 
            subtask.id === subtaskId 
              ? {...subtask, completed: !subtask.completed} 
              : subtask
          )
        };
      }
      return todo;
    }));
  }

  const deleteSubtask = (todoId, subtaskId) => {
    setTodos(todos.map(todo => {
      if (todo.id === todoId && Array.isArray(todo.subtasks)) {
        return {
          ...todo,
          subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId)
        };
      }
      return todo;
    }));
  }

  // Formatar a data para exibição (DD/MM/AAAA)
  const formatDate = (dateString) => {
    if (!dateString) return "Sem data";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  // Verificar se uma tarefa está atrasada
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dueDate);
    return taskDate < today && taskDate.getTime() !== today.getTime();
  }

  // Aplicar todos os filtros às tarefas
  const filteredTodos = todos.filter(todo => {
    // Filtro de status (todas, ativas, concluídas)
    if (filter === 'active' && todo.completed) return false;
    if (filter === 'completed' && !todo.completed) return false;
    
    // Filtro de categoria
    if (categoryFilter !== 'all' && todo.category !== categoryFilter) return false;
    
    // Filtro de prioridade
    if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;
    
    return true;
  });

  // Obter a categoria pelo ID
  const getCategoryById = (id) => {
    return categories.find(cat => cat.id === id) || categories[0];
  }

  // Obter a prioridade pelo ID
  const getPriorityById = (id) => {
    return priorities.find(pri => pri.id === id) || priorities[1];
  }

  // Alternar visibilidade das subtarefas
  const toggleSubtasksVisibility = (todoId) => {
    setShowSubtasks({
      ...showSubtasks,
      [todoId]: !showSubtasks[todoId]
    });
  }

  return (
    <div className="app-container">
      <h1>Gerenciador de Tarefas</h1>
      
      <div className="add-todo-container">
        <div className="add-todo">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Adicionar nova tarefa..."
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <input 
            type="text" 
            value={responsibleValue}
            onChange={(e) => setResponsibleValue(e.target.value)}
            placeholder="Responsável (opcional)"
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          />
          <input 
            type="date" 
            value={dueDateValue}
            onChange={(e) => setDueDateValue(e.target.value)}
            placeholder="Data de conclusão"
          />
        </div>

        <div className="task-options">
          <div className="option-group">
            <label>Categoria:</label>
            <select 
              value={categoryValue}
              onChange={(e) => setCategoryValue(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="option-group">
            <label>Prioridade:</label>
            <select 
              value={priorityValue}
              onChange={(e) => setPriorityValue(e.target.value)}
            >
              {priorities.map(priority => (
                <option key={priority.id} value={priority.id}>
                  {priority.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={addTodo}>Adicionar</button>
      </div>
      
      <div className="filters-container">
        <div className="filters-group">
          <h3>Status</h3>
          <div className="filters">
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button 
              className={filter === 'active' ? 'active' : ''} 
              onClick={() => setFilter('active')}
            >
              Ativas
            </button>
            <button 
              className={filter === 'completed' ? 'active' : ''} 
              onClick={() => setFilter('completed')}
            >
              Concluídas
            </button>
          </div>
        </div>

        <div className="filters-group">
          <h3>Categorias</h3>
          <div className="filters">
            <button 
              className={categoryFilter === 'all' ? 'active' : ''} 
              onClick={() => setCategoryFilter('all')}
            >
              Todas
            </button>
            {categories.map(category => (
              <button 
                key={category.id}
                className={categoryFilter === category.id ? 'active' : ''}
                onClick={() => setCategoryFilter(category.id)}
                style={{
                  backgroundColor: categoryFilter === category.id ? category.color : 'transparent',
                  borderColor: category.color,
                  color: categoryFilter === category.id ? 'white' : 'inherit'
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filters-group">
          <h3>Prioridade</h3>
          <div className="filters">
            <button 
              className={priorityFilter === 'all' ? 'active' : ''} 
              onClick={() => setPriorityFilter('all')}
            >
              Todas
            </button>
            {priorities.map(priority => (
              <button 
                key={priority.id}
                className={priorityFilter === priority.id ? 'active' : ''}
                onClick={() => setPriorityFilter(priority.id)}
                style={{
                  backgroundColor: priorityFilter === priority.id ? priority.color : 'transparent',
                  borderColor: priority.color,
                  color: priorityFilter === priority.id ? 'white' : 'inherit'
                }}
              >
                {priority.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <ul className="todo-list">
        {filteredTodos.length === 0 ? (
          <p className="empty-message">Nenhuma tarefa encontrada</p>
        ) : (
          filteredTodos.map(todo => {
            const category = getCategoryById(todo.category);
            const priority = getPriorityById(todo.priority);
            const subtasks = Array.isArray(todo.subtasks) ? todo.subtasks : [];
            
            return (
              <li 
                key={todo.id} 
                className={`${todo.completed ? 'completed' : ''} ${!todo.completed && isOverdue(todo.dueDate) ? 'overdue' : ''}`}
              >
                <div className="todo-main">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <div className="todo-info">
                    <span className="todo-text">{todo.text}</span>
                    <div className="todo-tags">
                      <span 
                        className="todo-category" 
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                      <span 
                        className="todo-priority" 
                        style={{ backgroundColor: priority.color }}
                      >
                        {priority.name}
                      </span>
                    </div>
                    <div className="todo-details">
                      <span className="todo-responsible">Responsável: {todo.responsible}</span>
                      <span className="todo-date">
                        Data de conclusão: {formatDate(todo.dueDate)}
                        {!todo.completed && isOverdue(todo.dueDate) && 
                          <span className="overdue-label"> (Atrasada)</span>
                        }
                      </span>
                    </div>
                  </div>
                  <div className="todo-actions">
                    <button 
                      className="subtasks-toggle"
                      onClick={() => toggleSubtasksVisibility(todo.id)}
                    >
                      {showSubtasks[todo.id] ? 'Ocultar Subtarefas' : 'Mostrar Subtarefas'} 
                      ({subtasks.length})
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {showSubtasks[todo.id] && (
                  <div className="subtasks-container">
                    <h4>Subtarefas</h4>
                    
                    <div className="add-subtask">
                      <input
                        type="text"
                        value={subtaskInput[todo.id] || ''}
                        onChange={(e) => setSubtaskInput({
                          ...subtaskInput,
                          [todo.id]: e.target.value
                        })}
                        placeholder="Adicionar subtarefa..."
                        onKeyPress={(e) => e.key === 'Enter' && addSubtask(todo.id)}
                      />
                      <button onClick={() => addSubtask(todo.id)}>+</button>
                    </div>
                    
                    {subtasks.length === 0 ? (
                      <p className="empty-subtasks">Nenhuma subtarefa adicionada</p>
                    ) : (
                      <ul className="subtask-list">
                        {subtasks.map(subtask => (
                          <li key={subtask.id} className={subtask.completed ? 'completed' : ''}>
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => toggleSubtask(todo.id, subtask.id)}
                            />
                            <span>{subtask.text}</span>
                            <button onClick={() => deleteSubtask(todo.id, subtask.id)}>
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  )
}

export default App
