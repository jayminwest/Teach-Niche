import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface VideoCardProps {
  id: string
  title: string
  thumbnailUrl: string
  price: string
}

export function VideoCard({ id, title, thumbnailUrl, price }: VideoCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video overflow-hidden relative">
        <Image
          src={thumbnailUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex justify-between items-center">
        <p className="font-medium text-lg">{price}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/lessons/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

