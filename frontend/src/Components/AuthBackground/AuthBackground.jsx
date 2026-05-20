import React, { useState } from 'react'

const AuthBackground = () => {
    const [hoverIndex,setHoverIndex] = useState(null);
    const tiles = Array.from({length:120})
  return (
    <div className = "w-full h-full grid gap-0.5 grid-cols-12 grid-rows-[10] relative [perspective:500px]">
      {tiles.map((_,index) => (<div key = {index} onMouseEnter={()=> setHoverIndex(index)} onMouseLeave= {()=>setHoverIndex(null)} className = {`bg-purple-100 rounded-lg  ${hoverIndex === index ?  "transform [transform:translateZ(20px)] bg-purple-500 duration-200" : "bg-purple-100 duration-[1000ms]"}`}></div>))}
    </div>
  )
}

export default AuthBackground

