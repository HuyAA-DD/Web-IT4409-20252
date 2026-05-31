import React from 'react'
import './Loading.css'
const Loading = () => {
  return (
    <div className = "w-full h-screen  flex flex-col justify-center items-center  ">
        <h2 className = "text-xl font-semibold">Đang tải dữ liệu ...</h2>
        <section id = "loading-container" className = "w-full md:w-1/10 lg:w-[100px]">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </section>
      
    </div>
  )
}

export default Loading
