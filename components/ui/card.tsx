export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
      <div className={`border rounded-lg shadow-sm bg-white p-4 ${className}`}>
        {children}
      </div>
    )
  }
  
  export function CardHeader({ children }: { children: React.ReactNode }) {
    return <div className="pb-2 border-b">{children}</div>
  }
  
  export function CardTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-lg font-semibold">{children}</h3>
  }
  
  export function CardContent({ children }: { children: React.ReactNode }) {
    return <div className="py-2">{children}</div>
  }
  
  export function CardFooter({ children }: { children: React.ReactNode }) {
    return <div className="pt-2">{children}</div>
  }
  