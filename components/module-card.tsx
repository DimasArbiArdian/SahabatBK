import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type Module } from "@/types/module"
import { useRouter } from "next/navigation"

interface ModuleCardProps {
  module: Module
}

export function ModuleCard({ module }: ModuleCardProps) {
  const router = useRouter()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{module.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{module.description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          className="bg-[#6BA89A] hover:bg-[#5a9184]"
          onClick={() => router.push(`/pages/student/module/detail-module/${module.id}`)}
        >
          Buka modul
        </Button>
      </CardFooter>
    </Card>
  )
}
