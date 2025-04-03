import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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

const taskSchema = z.object({
  task: z.string().min(5, { message: 'Task description must be at least 5 characters' }),
  status: z.string().min(1, { message: 'Please select a status' }),
  projectName: z.string().min(2, { message: 'Project name must be at least 2 characters' }),
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
    },
  })

  const handleFormSubmit = (values: TaskFormValues) => {
    console.log('TaskForm handleFormSubmit values:', values)
    onSubmit(values)
  }

  return (
    <div className="space-y-4 p-5 bg-card rounded-lg border border-border shadow-sm">
      <h3 className="text-lg font-medium tracking-tight">Task Details</h3>
      <p className="text-sm text-muted-foreground">
        Please provide details about the task you've completed
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="task"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Task Description</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="What did you work on today?" 
                    className="bg-background/50"
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
                <FormLabel className="text-foreground">Task Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="blockage">Blockage</SelectItem>
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
                <FormLabel className="text-foreground">Project Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Project name" 
                    className="bg-background/50"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-3 pt-3">
            <Button type="submit" className="flex-1">Submit & Check Out</Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default TaskForm
