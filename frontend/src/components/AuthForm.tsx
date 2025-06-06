import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'

// Define form schema based on the form type (login or register)
const getFormSchema = (isLogin: boolean) => {
  const baseSchema = {
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  }

  if (isLogin) {
    return z.object(baseSchema)
  }

  return z.object({
    ...baseSchema,
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
}

type FormData = z.infer<ReturnType<typeof getFormSchema>>

interface AuthFormProps {
  type: 'login' | 'register'
}

export default function AuthForm({ type }: AuthFormProps) {
  const { login, register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const isLogin = type === 'login'
  
  const formSchema = getFormSchema(isLogin)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(isLogin ? {} : { name: '', confirmPassword: '' }),
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      if (isLogin) {
        await login(data.email, data.password)
        toast({
          title: 'Login successful',
          description: 'Welcome back to Senslyze',
        })
      } else {
        // Call register function with name, email, password
        await register(data.name as string, data.email, data.password)
        toast({
          title: 'Registration successful',
          description: 'Your account has been created successfully',
        })
      }
      navigate('/')
    } catch (error) {
      console.error('Auth error:', error)
      toast({
        variant: 'destructive',
        title: `${isLogin ? 'Login' : 'Registration'} failed`,
        description: (error as Error).message || 'An error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isLogin ? 'Login' : 'Create an account'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {isLogin
            ? 'Enter your credentials to sign in to your account'
            : 'Fill in the form below to create your account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {!isLogin && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        className="bg-background/50" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="your.email@example.com" 
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="******" 
                      className="bg-background/50"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!isLogin && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="******" 
                        className="bg-background/50"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
            
            <div className="text-center text-sm mt-4">
              {isLogin ? (
                <p className="text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
