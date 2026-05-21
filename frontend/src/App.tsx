import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import Menu from "./pages/Menu"

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-xl">S</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">SaborExpress</span>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Cardápio</Link>
          </nav>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Menu />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
