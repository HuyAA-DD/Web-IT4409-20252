import React from 'react'
import {
  SunOutlined,
  MoonOutlined,
  StarOutlined
} from '@ant-design/icons';


const DarkModeToggle = ({isDarkMode, toggleDarkMode, className=''}) => {
    return (
      <div 
        className={`relative w-[80px] h-8 rounded-[2rem] flex items-center justify-end px-1 border cursor-pointer transition-colors z-50 ${isDarkMode ? 'border-gray-500 bg-slate-800' : 'border-black bg-white'} ${className}`} 
        onClick={toggleDarkMode}
      >
        <div className={`h-[90%] aspect-square rounded-full opacity-80 transition-transform duration-700 ease-in-out flex items-center justify-center ${!isDarkMode ? "bg-amber-300 translate-x-0" : "bg-gray-500 -translate-x-[160%]"}`}>
          <div className="animate-bounce flex items-center justify-center">
            {!isDarkMode ? (
              <SunOutlined className="text-white text-xl animate-spin-slow" />
            ) : (
              <div className="flex">
                <MoonOutlined className="text-white text-lg" />
                <StarOutlined className="text-white text-[8px] -mt-2" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

export default DarkModeToggle
