import { ReactNode } from 'react'

// Override Next.js PageProps to avoid type errors with params
declare module 'next' {
  export interface PageProps {
    children?: ReactNode
    params?: any
    searchParams?: any
  }
}

// Add specific type for page components
declare module 'next/dist/server/future/route-modules/app-page/module' {
  interface AppPageRouteModule {
    default: (props: { params: Record<string, string> }) => Promise<JSX.Element> | JSX.Element
  }
}
