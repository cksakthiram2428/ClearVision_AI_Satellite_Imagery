import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false)
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      {isLoading && <LoadingScreen onFinish={() => setIsLoading(false)} />}

      <div className="min-h-screen bg-black">
        <Hero />
      </div>
    </>
  )
}

export default App
