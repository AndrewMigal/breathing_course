export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          email: string | null
          role: 'student' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          email?: string | null
          role?: 'student' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          email?: string | null
          role?: 'student' | 'admin'
          created_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          module_id: number
          module_name: string
          order_index: number
          title: string
          youtube_id: string
          description: string
          objectives: string[]
          created_at: string
        }
        Insert: {
          id?: string
          module_id: number
          module_name: string
          order_index: number
          title: string
          youtube_id: string
          description: string
          objectives?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: number
          module_name?: string
          order_index?: number
          title?: string
          youtube_id?: string
          description?: string
          objectives?: string[]
          created_at?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          user_id: string
          lesson_id: string
          is_completed: boolean
          completed_at: string | null
        }
        Insert: {
          user_id: string
          lesson_id: string
          is_completed?: boolean
          completed_at?: string | null
        }
        Update: {
          user_id?: string
          lesson_id?: string
          is_completed?: boolean
          completed_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          price?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          created_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          course_id: string
          status: 'active' | 'pending' | 'refunded'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          status?: 'active' | 'pending' | 'refunded'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          status?: 'active' | 'pending' | 'refunded'
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Lesson = Database['public']['Tables']['lessons']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Purchase = Database['public']['Tables']['purchases']['Row']

export interface LessonWithProgress extends Lesson {
  is_completed: boolean
}
