import { useEffect, useState } from "react"

const useDebounce = (value, delay = 500) =>{
    const [assignValue, setAssignValue] = useState(value);

    useEffect(()=>{

        const timer =  setTimeout(()=>{
            return setAssignValue(value);
        }, delay);

        return ()=>clearTimeout(timer);

    },[value, delay])

    return assignValue;
}

export default useDebounce;

