import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTheme } from '@/context/ThemeContext'
import { CheckCircle, FileText, LayoutGrid, XCircle, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

// Create a schema for the base task
const baseTaskSchema = z.object({
  task: z.string().min(5, { message: 'Task description must be at least 5 characters' }),
  status: z.string().min(1, { message: 'Please select a status' }),
  projectName: z.string().min(2, { message: 'Project name must be at least 2 characters' }),
})

// Create a schema for custom fields
const customFieldSchema = z.object({
  fieldName: z.string().min(1, { message: 'Field name is required' }),
  fieldValue: z.string().min(1, { message: 'Field value is required' }),
})

// Combine the schemas
const taskSchema = baseTaskSchema.extend({
  customFields: z.array(customFieldSchema).optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskFormProps {
  onSubmit: (data: TaskFormValues) => void
  onCancel: () => void
}

const TaskForm = ({ onSubmit, onCancel }: TaskFormProps) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      task: '',
      status: '',
      projectName: '',
      customFields: [],
    },
  })

  // Setup field array for dynamic custom fields
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customFields",
  });

  const handleFormSubmit = (values: TaskFormValues) => {
    console.log('TaskForm handleFormSubmit values:', values)
    onSubmit(values)
  }

  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <div className={`space-y-5 p-5 rounded-lg border shadow-sm ${isDark 
      ? 'bg-card/50 border-border' 
      : 'bg-card border-slate-200'}`}>
      <div className="space-y-1.5">
        <h3 className="text-lg font-medium tracking-tight flex items-center">
          <FileText className="w-4 h-4 mr-2 text-primary" />
          Complete Your Workday
        </h3>
        <p className="text-sm text-muted-foreground">
          Please provide details about the task you've completed today
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="task"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  Task Description
                </FormLabel>
                <FormDescription>
                  Describe what you worked on during your workday
                </FormDescription>
                <FormControl>
                  <Input 
                    placeholder="What did you work on today?" 
                    className={`${isDark ? 'bg-background/50' : 'bg-white'}`}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <LayoutGrid className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  Task Status
                </FormLabel>
                <FormDescription>
                  Select the current status of your task
                </FormDescription>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={`${isDark ? 'bg-background/50' : 'bg-white'}`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="completed" className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Completed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="pending" className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span>Pending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="blockage" className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Blockage</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  Project Name
                </FormLabel>
                <FormDescription>
                  Enter the project you've been working on
                </FormDescription>
                <FormControl>
                  <Input 
                    placeholder="Project name" 
                    className={`${isDark ? 'bg-background/50' : 'bg-white'}`}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Custom Fields Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Custom Fields</h4>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ fieldName: '', fieldValue: '' })}
                className="text-xs flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Field
              </Button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-dashed rounded-md">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`customFields.${index}.fieldName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Field Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Field name" 
                            className={`${isDark ? 'bg-background/50' : 'bg-white'} text-sm`}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`customFields.${index}.fieldValue`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Field Value</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Field value" 
                            className={`${isDark ? 'bg-background/50' : 'bg-white'} text-sm`}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-end justify-center pb-1">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => remove(index)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-border/60">
            <Button type="submit" className="flex-1 gap-2" size="lg">
              <CheckCircle className="h-4 w-4" />
              Submit & Check Out
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1 gap-2"
              size="lg"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default TaskForm