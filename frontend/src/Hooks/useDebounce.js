import { useEffect, useState } from "react";

export default function useDebounce(value,delay){
    const [searchTerm, setSearchTerm] = useState(value);

    useEffect(()=>{
        const timer = setTimeout(()=>{
            setSearchTerm(value);
        },delay)

        return ()=>clearTimeout(timer);
    },[value,delay])

    return searchTerm;

    
}