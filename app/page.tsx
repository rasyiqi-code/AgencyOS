import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
          Agency OS
        </h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          The async platform for modern software development.
          Code more, talk less.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
          <Link href="https://stack-auth.com" target="_blank">
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
