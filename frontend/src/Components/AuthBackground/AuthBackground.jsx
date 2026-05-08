import React, { useState } from 'react'

const AuthBackground = () => {
    const [hoverIndex,setHoverIndex] = useState(null);
    const tiles = Array.from({length:120})
  return (
    <div className = "w-full h-full absolute grid gap-0.5 grid-cols-12 grid-rows-[10]  [perspective:500px]">
      {tiles.map((_,index) => (<div key = {index} onMouseEnter={()=> {setHoverIndex(index); console.log("hovering")}} onMouseLeave= {()=>setHoverIndex(null)} className = {`bg-stone-300 rounded-lg  ${hoverIndex === index ?  "transform [transform:translateZ(20px)] bg-stone-500 duration-200" : "bg-purple-100 duration-[1000ms]"}`}></div>))}
    </div>
  )
}

export default AuthBackground

