import { ReactNode, ButtonHTMLAttributes } from 'react';
import type { Video, Lesson, InstructorProfile, User } from './supabase';

// Common prop types that are shared across components

export interface ChildrenProps {
  children: ReactNode;
}

export interface ClassNameProps {
  className?: string;
}

// Button Props
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ClassNameProps {
  isLoading?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

// Card Component Props
export interface LessonCardProps {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  price: number;
  isPurchased?: boolean;
  videoCount?: number;
  instructorName?: string;
}

export interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  videoUrl: string;
  price: number;
  isPurchased?: boolean;
  instructorName?: string;
  description?: string | null;
  onClick?: () => void;
}

// Checkout Button Props
export interface CheckoutButtonProps {
  videoId: string;
  price: number;
  title: string;
}

export interface LessonCheckoutButtonProps {
  lessonId: string;
  price: number;
  title: string;
}

export interface VideoCheckoutButtonProps {
  videoId: string;
  price: number;
  title: string;
}

// Header/Footer Props
export interface HeaderProps extends ClassNameProps {
  user?: User | null;
  instructor?: InstructorProfile | null;
}

export interface FooterProps extends ClassNameProps {}

// Form Props
export interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  autoComplete?: string;
  defaultValue?: string | number;
}

// Page props for data-fetching components
export interface PageProps {
  params: { id?: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Toast props
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}
