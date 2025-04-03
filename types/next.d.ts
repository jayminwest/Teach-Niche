import { ReactNode } from 'react'

// Override Next.js PageProps to avoid type errors with params
declare module 'next' {
  export interface PageProps {
    children?: ReactNode
    params?: any
    searchParams?: any
  }
}
