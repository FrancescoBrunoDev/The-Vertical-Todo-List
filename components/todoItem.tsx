import { useState, useEffect, useRef, useMemo } from "react";
import { useToDoStore } from "@/provider/todo-store-provider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DueDateSetter } from "@/components/dueDateSetter";
import { Textarea } from "@/components/ui/textarea";
import { PPR } from "@/app/fonts";
import { Label } from "@/components/ui/label";
import { Info, GripHorizontal, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { ToDoItem } from "@/stores/todo-store";
import { isAfter } from "date-fns";
import { CircleNumber } from "@/components/circleNumber";
import { cn } from "@/lib/utils";

type TodoItemProps = ToDoItem & {
  index?: number;
  isDragging?: boolean;
};

export const TodoItem: React.FC<TodoItemProps> = ({
  id,
  text,
  completed,
  createdAt,
  dueDate,
  updatedAt,
  index,
  isDragging,
}) => {
  const { addTodo, setDueDate, updateTodo } = useToDoStore((state) => state);

  const [todo, setTodo] = useState({
    title: text?.title || "",
    content: text?.content || "",
    dueDate: dueDate || new Date(),
  });

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // adjust textarea height
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight(titleTextareaRef.current);
    adjustTextareaHeight(contentTextareaRef.current);
  }, [todo.title, todo.content]);

  // update todo
  useEffect(() => {
    if (id) {
      const updatedAt = new Date();
      updateTodo(id, todo.title, todo.content, todo.dueDate, updatedAt);
    }
  }, [todo, completed, id]);

  // add todo
  const handleAddTodo = () => {
    if (todo.title.trim() && todo.content.trim()) {
      const newId = addTodo(todo.title, todo.content);
      if (todo.dueDate && newId) {
        setDueDate(newId, todo.dueDate);
      }
      setTodo({ title: "", content: "", dueDate: new Date() });
    }
  };

  // set due date
  const dateLastChange = useMemo(
    () => (updatedAt?: Date, createdAt?: Date) => {
      const date = updatedAt || createdAt;
      return date ? new Date(date).toLocaleString() : "";
    },
    [],
  );

  // determine if todo is overdue
  const isOverdue = useMemo(() => {
    if (!id || completed) return false;
    return isAfter(new Date(), todo.dueDate);
  }, [todo.dueDate, completed, id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      whileHover={isDragging ? { scale: 1.05, x: [0, -2, 2, -2, 2, 0] } : {}}
    >
      <Card
        className={cn(
          "relative w-52 border-none bg-primary shadow-md transition-all hover:scale-105 hover:drop-shadow-xl md:w-72",
          { "group hover:pt-5": id },
        )}
      >
        {id && (
          <>
            <div className="absolute left-0 right-0 top-0 w-full opacity-0 transition-opacity group-hover:opacity-100 md:items-center">
              <GripHorizontal className="h-6 w-full" />
            </div>
            <div className="absolute -left-7">
              <CircleNumber number={(index || 0) + 1} />
            </div>
          </>
        )}
        <div
          className={cn("flex flex-col gap-2 rounded-xl bg-card p-3", {
            "bg-secondary": isOverdue,
            "bg-primary": completed,
          })}
        >
          <CardHeader className="space-y-0 p-0 pb-2">
            <CardTitle>
              <Textarea
                ref={titleTextareaRef}
                className={cn(
                  PPR.className,
                  "focus-visible:ring-none min-h-0 w-full max-w-full resize-none border-none p-0 text-xl font-bold tracking-wider shadow-none focus:outline-none focus:ring-0",
                )}
                placeholder="Todo Title"
                value={todo.title}
                onChange={(e) =>
                  setTodo((prev) => ({ ...prev, title: e.target.value }))
                }
                rows={1}
              />
            </CardTitle>
          </CardHeader>

          {!completed && (
            <>
              <CardContent className="p-0">
                <Textarea
                  ref={contentTextareaRef}
                  className="focus-visible:ring-none min-h-0 w-full max-w-full resize-none border-none p-0 text-sm font-normal shadow-none focus:outline-none focus:ring-0"
                  placeholder="Write your todo"
                  value={todo.content}
                  onChange={(e) =>
                    setTodo((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={1}
                />
              </CardContent>

              <CardFooter className="flex flex-col gap-2 p-0">
                <div className="w-full">
                  <Label className="text-text/80 text-xs">Due Date</Label>
                  <DueDateSetter
                    dueDate={todo.dueDate}
                    setnewDueDateState={(newDueDate: Date) =>
                      setTodo((prev) => ({ ...prev, dueDate: newDueDate }))
                    }
                  />
                </div>

                {!id ? (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1, rotate: [5, 0] }}
                  >
                    <Button
                      disabled={!todo.title.trim() || !todo.content.trim()}
                      className="text-background"
                      type="submit"
                      onClick={handleAddTodo}
                    >
                      <Plus />
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center gap-1 pt-2">
                    <Info className="h-3 w-fit" />
                    <span className="text-[0.7rem]">
                      {dateLastChange(updatedAt, createdAt)}
                    </span>
                  </div>
                )}
              </CardFooter>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
