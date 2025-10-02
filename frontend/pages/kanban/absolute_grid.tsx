import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const initialTasks = [
  { id: "t1", status: 1, priority: 2, order: 2, title: "Task 1" },
  { id: "t2", status: 1, priority: 2, order: 3, title: "Task 2" },
  { id: "t3", status: 1, priority: 3, order: 2, title: "Task 3" },
  { id: "t4", status: 1, priority: 3, order: 10, title: "Task 4" },
  { id: "t5", status: 1, priority: 9, order: 3, title: "Task 5" },
  { id: "t6", status: 2, priority: 2, order: 9, title: "Task 6" },
  { id: "t7", status: 2, priority: 3, order: 2, title: "Task 7" },
  { id: "t8", status: 2, priority: 9, order: 3, title: "Task 8" },
  { id: "t9", status: 2, priority: 10, order: 9, title: "Task 9" },
  { id: "t10", status: 2, priority: 10, order: 10, title: "Task 10" },
];

const columns = [
  { id: 1, name: "In Progress" },
  { id: 2, name: "Done" },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [isDragging, setIsDragging] = useState(false);

  const getTasksByStatus = (statusId) => {
    return tasks.filter(t => t.status === statusId);
  };

  const getTaskGrid = (statusId) => {
    const statusTasks = getTasksByStatus(statusId);
    const grid = {};

    statusTasks.forEach(task => {
      if (!grid[task.priority]) {
        grid[task.priority] = {};
      }
      grid[task.priority][task.order] = task;
    });

    return grid;
  };

  const getAllPrioritiesWithPlaceholders = (statusId) => {
    const statusTasks = getTasksByStatus(statusId);
    if (statusTasks.length === 0) return [0];

    const priorities = [...new Set(statusTasks.map(t => t.priority))].sort((a, b) => a - b);

    const withPlaceholders = [];
    priorities.forEach((p, idx) => {
      if (idx === 0 && p > 0) {
        withPlaceholders.push(p - 1);
      }
      withPlaceholders.push(p);
      if (idx === priorities.length - 1) {
        withPlaceholders.push(p + 1);
      }
    });

    return withPlaceholders;
  };

  const getAllOrdersWithPlaceholders = (statusId, priority) => {
    const grid = getTaskGrid(statusId);
    const rowTasks = grid[priority] || {};
    const orders = Object.keys(rowTasks).map(Number).sort((a, b) => a - b);

    if (orders.length === 0) return [0];

    const withPlaceholders = [];
    orders.forEach((o, idx) => {
      if (idx === 0 && o > 0) {
        withPlaceholders.push(o - 1);
      }
      withPlaceholders.push(o);
      if (idx === orders.length - 1) {
        withPlaceholders.push(o + 1);
      }
    });
    
    return withPlaceholders;
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = (result) => {
    setIsDragging(false);
    
    const { destination, draggableId } = result;

    if (!destination) return;

    const destStatusId = parseInt(destination.droppableId.split("-")[1]);
    const [destPriority, destOrder] = destination.droppableId.split("-").slice(2).map(Number);

    const updatedTasks = tasks.map(task => {
      if (task.id === draggableId) {
        return { ...task, status: destStatusId, priority: destPriority, order: destOrder };
      }
      return task;
    });

    setTasks(updatedTasks);
  };

  const renderGrid = (statusId) => {
    const grid = getTaskGrid(statusId);
    const priorities = getAllPrioritiesWithPlaceholders(statusId);
    
    if (priorities.length === 0 || (priorities.length === 1 && priorities[0] === 0 && !grid[0])) {
      return (
        <Droppable droppableId={`col-${statusId}-0-0`}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-24 p-2 border-2 border-dashed rounded ${
                snapshot.isDraggingOver ? "bg-blue-50 border-blue-300" : "border-gray-200"
              }`}
            >
              <div className="text-gray-400 text-sm text-center">Drop tasks here (P0, O0)</div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    }

    return (
      <div className="space-y-2">
        {priorities.map(priority => {
          const orders = getAllOrdersWithPlaceholders(statusId, priority);
          const hasTasksInRow = grid[priority] && Object.keys(grid[priority]).length > 0;
          const isPlaceholderRow = !hasTasksInRow;

          return (
            <div 
              key={priority} 
              className="flex gap-2 items-start"
              style={{
                display: "flex"
              }}
            >
              <div className="text-xs text-gray-500 font-mono w-8 pt-2">
                P{priority}
              </div>
              <div className="flex gap-2 flex-1 flex-wrap">
                {orders.map(orderIdx => {
                  const task = grid[priority]?.[orderIdx];
                  const droppableId = `col-${statusId}-${priority}-${orderIdx}`;
                  const isPlaceholder = !task;

                  return (
                    <Droppable key={droppableId} droppableId={droppableId}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-w-32 min-h-20 p-2 border-2 border-dashed rounded ${
                            snapshot.isDraggingOver ? "bg-blue-50 border-blue-300" : 
                            isPlaceholder && isDragging ? "border-gray-300 bg-gray-50" : 
                            "border-gray-200"
                          }`}
                          style={{
                            visibility: "visible",
                            position: "relative",
                            // width: isPlaceholder && !isDragging ? 0 : undefined,
                            // height: isPlaceholder && !isDragging ? 0 : undefined,
                            // minWidth: isPlaceholder && !isDragging ? 0 : undefined,
                            // minHeight: isPlaceholder && !isDragging ? 0 : undefined,
                            // padding: isPlaceholder && !isDragging ? 0 : undefined,
                            // margin: isPlaceholder && !isDragging ? 0 : undefined,
                            border: isPlaceholder && !isDragging ? "none" : undefined,
                            overflow: "hidden"
                          }}
                        >
                          {task ? (
                            <Draggable draggableId={task.id} index={0}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-3 bg-white border border-gray-300 rounded shadow-sm cursor-move ${
                                    snapshot.isDragging ? "shadow-lg" : ""
                                  }`}
                                >
                                  <div className="font-medium text-sm text-black">{task.title}</div>
                                  <div className="text-xs text-gray-600 mt-1 font-mono">
                                    O{task.order}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ) : isDragging ? (
                            <div className="text-gray-400 text-xs text-center pt-2">O{orderIdx}</div>
                          ) : null}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-black">2D Priority-Order Kanban Board</h1>
        <div className="text-sm text-gray-700 mb-4">
          Tasks have absolute priority and order numbers. Placeholder cells appear only when dragging.
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {columns.map(column => (
            <div key={column.id} className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4 pb-2 border-b text-black">
                {column.name}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({getTasksByStatus(column.id).length} tasks)
                </span>
              </h2>
              {renderGrid(column.id)}
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}
