import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Lobby from './screens/Lobby'
import Room from './screens/Room'

const App = () => {
  return (
    <div >
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </div>
  )
}

export default App