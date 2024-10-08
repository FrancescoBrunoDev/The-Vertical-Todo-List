import { useState } from "react";
import { TodoItem } from "@/components/todoItem/todoItem";
import type { ToDoItem } from "@/stores/todo-store";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useToDoStore } from "@/provider/todo-store-provider";
import confetti from "canvas-confetti";
import { ActionDraggableAreas } from "@/components/actionDraggableAreas";
import { toast } from "sonner"

type ToDoListProps = {
  todos: ToDoItem[];
};

export const ToDoList: React.FC<ToDoListProps> = ({ todos }) => {
  const { setTodos, removeTodo, toggleTodo } = useToDoStore((state) => state);
  const [idDragged, setIdDragged] = useState<number | null>(null);

  const handleOnDragStart = (result: any) => {
    setIdDragged(Number(result.draggableId));
  };

  const handleOnDragEnd = (result: any) => {
    setIdDragged(null);
    if (!result.destination) return;

    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;

    // handle reordering of the list
    if (sourceId === "todos" && destinationId === "todos") {
      const newItems = Array.from(todos);
      const [reorderedItem] = newItems.splice(result.source.index, 1);
      newItems.splice(result.destination.index, 0, reorderedItem);

      setTodos(newItems);
    }

    // the store's Actions are expeting a number as id
    const todoId = Number(result.draggableId);

    //handle moving itmes in different zones
    if (destinationId === "delete") {
      removeTodo(todoId);
      toast.error("Todo has been deleted.", {
        style: {
          background: 'hsl(var(--secondary))',
          color: 'hsl(var(--text))',
          border: 'none',
        },
      });
    } else if (destinationId === "completed") {
      // prepare the confetti animation
      const endConfetti = Date.now() + 1 * 300;
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

      const frame = () => {
        if (Date.now() > endConfetti) return;

        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1 },
          colors: colors,
        });

        requestAnimationFrame(frame);
      };

      // perform the toggle
      toggleTodo(todoId);
      // determine if the todo is completed
      const isTodoCompleted = todos.find((todo) => todo.id === todoId)?.completed;

      // make the animation if not completed
      if (!isTodoCompleted) frame();

      // show the toast
      const toastMessage = isTodoCompleted
        ? "Todo has been marked as not done."
        : "Todo has been marked as done.";

      toast(toastMessage, {
        style: {
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--text))',
          border: 'none',
        },
      });
    }
  };

  return (
    <DragDropContext
      onDragStart={handleOnDragStart}
      onDragEnd={handleOnDragEnd}
    >
      <ActionDraggableAreas idDragged={idDragged} />
      <Droppable droppableId="todos">
        {(provided: any) => (
          <ul
            className="z-20 flex flex-col items-center gap-4 pb-8"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {todos.map((todo, index) =>
              todo.id ? (
                <Draggable
                  key={todo.id}
                  draggableId={todo.id.toString()}
                  index={index}
                >
                  {(provided: any) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TodoItem {...todo} index={index} />
                    </li>
                  )}
                </Draggable>
              ) : (
                <li key={index}>
                  <TodoItem {...todo} />
                </li>
              ),
            )}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};
