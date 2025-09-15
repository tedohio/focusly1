'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Plus, Trash2, ArrowRight, Calendar } from 'lucide-react';
import { createTodo, updateTodo, deleteTodo, reorderTodos, duplicateTodoToTomorrow } from '@/app/(main)/actions/todos';
import { getToday, getTomorrow } from '@/lib/date';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';

interface Todo {
  id: string;
  title: string;
  done: boolean;
  order: number;
  forDate: string;
}

interface TomorrowPlannerProps {
  todayTodos: Todo[];
  tomorrowTodos: Todo[];
  onComplete?: () => void;
}

function SortableTodoItem({ todo, onUpdate, onDelete, onMove }: {
  todo: Todo;
  onUpdate: (id: string, data: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center space-x-2 p-2 bg-white rounded border">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing p-1"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex-1">
        <Input
          value={todo.title}
          onChange={(e) => onUpdate(todo.id, { title: e.target.value })}
          className="border-0 p-0 h-auto"
          placeholder="Enter todo..."
        />
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMove(todo.id)}
          className="h-8 px-2"
        >
          <ArrowRight className="h-4 w-4 mr-1" />
          Move
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(todo.id)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function TomorrowTodoItem({ todo, onUpdate, onDelete }: {
  todo: Todo;
  onUpdate: (id: string, data: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center space-x-2 p-2 bg-white rounded border">
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing p-1"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex-1">
        <Input
          value={todo.title}
          onChange={(e) => onUpdate(todo.id, { title: e.target.value })}
          className="border-0 p-0 h-auto"
          placeholder="Enter todo..."
        />
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(todo.id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function TomorrowPlanner({ todayTodos, tomorrowTodos, onComplete }: TomorrowPlannerProps) {
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [movedTodos, setMovedTodos] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const today = getToday();
  const tomorrow = getTomorrow();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', tomorrow] });
      setNewTodoTitle('');
      setIsAdding(false);
    },
    onError: (error) => {
      toast.error('Failed to create todo');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Todo> }) => updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', tomorrow] });
    },
    onError: (error) => {
      toast.error('Failed to update todo');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', tomorrow] });
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error('Failed to delete todo');
      console.error(error);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateTodoToTomorrow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', today] });
      queryClient.invalidateQueries({ queryKey: ['todos', tomorrow] });
      toast.success('Todo moved to tomorrow');
    },
    onError: (error) => {
      toast.error('Failed to move todo');
      console.error(error);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderTodos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos', tomorrow] });
    },
    onError: (error) => {
      toast.error('Failed to reorder todos');
      console.error(error);
    },
  });

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) return;
    
    await createMutation.mutateAsync({
      title: newTodoTitle.trim(),
      forDate: tomorrow,
    });
  };

  const handleMoveTodo = async (todoId: string) => {
    if (movedTodos.has(todoId)) {
      toast.info('This todo has already been moved');
      return;
    }

    await duplicateMutation.mutateAsync(todoId);
    setMovedTodos(prev => new Set(prev).add(todoId));
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleDragEnd = (event: { active: { id: string }; over: { id: string } }) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tomorrowTodos.findIndex((todo) => todo.id === active.id);
      const newIndex = tomorrowTodos.findIndex((todo) => todo.id === over.id);
      
      const newTodos = arrayMove(tomorrowTodos, oldIndex, newIndex);
      const todoIds = newTodos.map(todo => todo.id);
      
      reorderMutation.mutate(todoIds);
    }
  };

  const availableTodos = todayTodos.filter(todo => !movedTodos.has(todo.id));
  const hasAvailableTodos = availableTodos.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Calendar className="h-4 w-4" />
        <span>
          Plan for {new Date(tomorrow).toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      </div>

      {/* Incomplete Tasks from Today */}
      {hasAvailableTodos && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Incomplete Tasks from Today</CardTitle>
            <CardDescription>
              Click "Move" to add these tasks to tomorrow's list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableTodos.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={() => {}} // Today's todos are read-only
                  onDelete={() => {}} // Can't delete today's todos from here
                  onMove={handleMoveTodo}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tomorrow's To-Dos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tomorrow's To-Dos</CardTitle>
          <CardDescription>
            Add and organize your tasks for tomorrow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tomorrowTodos.map(todo => todo.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {tomorrowTodos
                  .sort((a, b) => a.order - b.order)
                  .map((todo) => (
                    <TomorrowTodoItem
                      key={todo.id}
                      todo={todo}
                      onUpdate={(id, data) => updateMutation.mutate({ id, data })}
                      onDelete={(id) => setDeleteConfirmId(id)}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add New Todo */}
          <div className="mt-4 space-y-2">
            {isAdding ? (
              <div className="flex space-x-2">
                <Input
                  value={newTodoTitle}
                  onChange={(e) => setNewTodoTitle(e.target.value)}
                  placeholder="Enter new todo for tomorrow..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTodo();
                    } else if (e.key === 'Escape') {
                      setIsAdding(false);
                      setNewTodoTitle('');
                    }
                  }}
                  autoFocus
                />
                <Button
                  onClick={handleAddTodo}
                  disabled={!newTodoTitle.trim() || createMutation.isPending}
                  size="sm"
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewTodoTitle('');
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsAdding(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Todo for Tomorrow
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={onComplete}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save To-Dos
        </Button>
      </div>

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
        title="Delete Todo"
        description="Are you sure you want to delete this todo? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
