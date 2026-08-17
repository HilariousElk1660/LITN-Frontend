import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./use-auth";



type BooksCtx = {
    bookRequests: [];
    setBookRequests: () => void;
    readersBooks: [];
    setReadersBooks: () => void;
    allBooks: [];
    setAllBooks: () => void;
    fetchAllBooks: () => void;
//   user: StoredUser | null;
//   role: Role | null;
//   isAdmin: boolean;       // true for 'admin' OR 'super-admin'
//   isSuperAdmin: boolean;  // true only for 'super-admin'
//   loading: boolean;
//   signOut: () => void;
//   refresh: () => void;
};

const Ctx = createContext<BooksCtx>({
  bookRequests: [],
  setBookRequests: ()=>{},
  readersBooks:[],
  setReadersBooks: ()=>{},
  allBooks:[],
  setAllBooks: ()=>{},
  fetchAllBooks: ()=>{}
});

export function BooksProvider({ children }: { children: ReactNode }) {
  const [bookRequests,setBookRequests]  = useState([])
  const [readersBooks, setReadersBooks] = useState([])
  const [allBooks,setAllBooks] = useState([])
  const {user, backendUrl} = useAuth()

  const base = backendUrl ;

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

  const fetchReadersBooks = async ()=> {

      try{
        const token = api.getToken()
        const res = await fetch(`${base}/library/me`,{
            'headers':{'Authorization': `Bearer ${token}`}
        });
        const data = await res.json()
        setReadersBooks(data)
    
      }catch(e){
        console.error("error fetching user book requests",e)
      }
  }

  const fetchAllBooks = async () =>{
    try{
        const token = api.getToken()
        const res = await fetch(`${base}/all_books`,{
            'headers':{'Authorization': `Bearer ${token}`}
        });
        const data = await res.json()
        setAllBooks(data)
    
      }catch(e){
        console.error("error fetching user book requests",e)
      }
  }

  useEffect(()=>{
    fetchBookRequests()
    fetchReadersBooks()
    fetchAllBooks()
  },[])


  return (
    <Ctx.Provider value={{ bookRequests,setBookRequests, readersBooks, setReadersBooks ,setAllBooks,allBooks, fetchAllBooks}}>
      {children}
    </Ctx.Provider>
  );
}

export const useBooks = () => useContext(Ctx);