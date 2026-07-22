import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./use-auth";



type BooksCtx = {
    bookRequests: [] | null;
    setBookRequests: () => void;
//   user: StoredUser | null;
//   role: Role | null;
//   isAdmin: boolean;       // true for 'admin' OR 'super-admin'
//   isSuperAdmin: boolean;  // true only for 'super-admin'
//   loading: boolean;
//   signOut: () => void;
//   refresh: () => void;
};

const Ctx = createContext<BooksCtx>({
  bookRequests: null,
  setBookRequests: ()=>{}
});

export function BooksProvider({ children }: { children: ReactNode }) {
  const [bookRequests,setBookRequests]  = useState([])
  const {user, backendUrl} = useAuth()

  const base = backendUrl || "http://localhost:8000";

  const fetchBookRequests = async ()=> {

      try{
        const token = api.getToken()
        const res = await fetch(`${base}/readers_requests`,{
            'headers':{'Authorization': `Bearer ${token}`}
        });
        const data = await res.json()
        setBookRequests(data)
    
      }catch(e){
        console.error("error fetching user book requests",e)
      }
  }

  useEffect(()=>{
    fetchBookRequests()
  },[])


  return (
    <Ctx.Provider value={{ bookRequests,setBookRequests }}>
      {children}
    </Ctx.Provider>
  );
}

export const useBooks = () => useContext(Ctx);