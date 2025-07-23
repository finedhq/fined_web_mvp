import { useState } from "react"
import instance from "../../lib/axios"
import { useAuth0 } from "@auth0/auth0-react"

export default function NewsLetter() {

      const { user, isLoading, isAuthenticated, logout } = useAuth0()
  const [role, setrole] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    } else if (!isLoading && isAuthenticated) {
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
      if (roles?.[0] !== "Admin") navigate("/")
    }
  }, [isLoading, isAuthenticated])

    const [data, setData] = useState({
        title: "",
        content: ""
    })

    async function send() {
        const res = await instance.post("/admin/newsletters", { data })
        if(res.data.message) {
            alert("Sent!")
        }
    }

    return (
        <div className="flex justify-center items-center h-screen w-full" >
            <div className="h-2/3 w-2/5 border-2 flex flex-col gap-8 p-4">
                <p>Title</p>
                <input className="border-2 p-2" type="text" value={data.title} onChange={(e) => setData(prev => ({...prev, title: e.target.value}))} />
                <p>Content</p>
                <input className="border-2 p-2" type="text" value={data.content} onChange={(e) => setData(prev => ({...prev, content: e.target.value}))} />
                <button className="bg-blue-500 py-3" onClick={send} >Send Emails</button>
            </div>
        </div>
    )
}