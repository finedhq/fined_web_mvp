import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import instance from "../lib/axios"
import ExpensesPieChart from './expenseChart'
import SpendVsBudgetGauge from "./gaugeChart"
import WorkingCapitalChart from "./workingCapitalChart"
import FinancialSummaryBar from "./financialSummaryChart"
import { GrNotes } from "react-icons/gr"
import { RxCross2 } from "react-icons/rx"
import { AiTwotoneDelete } from "react-icons/ai"
import { useAuth0 } from '@auth0/auth0-react'

export default function ExpenseTracker() {

  let navigate = useNavigate()

  const { user, isLoading, isAuthenticated, logout } = useAuth0()
  const [role, setrole] = useState("")

  const [email, setEmail] = useState("")
  const [automatePopup, setAutomatePopup] = useState(false)
  const [isUnderstood, setIsUnderstood] = useState(false)
  const [isAutoFetch, setIsAutoFetch] = useState(true)
  const [dbAtoFetch, setDbAutoFetch] = useState(null)
  const [isStatusChanged, setIsStatusChanged] = useState(false)
  const [isGmailConnected, setisGmailConnected] = useState(false)
  const [isBudgetEditing, setIsBudgetEditing] = useState(false)
  const [isMonthlyBudgetEditing, setIsMonthlyBudgetEditing] = useState(false)
  const [budgets, setBudgets] = useState([{
    category: "Food",
    limit: "",
    spent: null
  }])
  const [monthlyBudget, setMonthlyBudget] = useState({
    category: "Monthly",
    limit: "",
    spent: null
  })
  const [userCategories, setUserCategories] = useState([])
  const [categoryExpenses, setCategoryExpenses] = useState([])

  const [customCategoryIndex, setCustomCategoryIndex] = useState(null)
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [customFetchedCategoryIndex, setCustomFetchedCategoryIndex] = useState(null)
  const [isAddingTransaction, setIsAddingTransaction] = useState(false)
  const [transaction, setTransaction] = useState({
    title: "",
    category: "Food",
    type: "expense",
    amount: "",
    date: ""
  })

  const [fetchedTransactions, setFetchedTransactions] = useState([])
  const [pieFetchedTransactions, setPieFetchedTransactions] = useState([])
  const [recentFetchedTransactions, setRecentFetchedTransactions] = useState([])
  const [seeAll, setSeeAll] = useState(false)
  const [exceededBudgets, setExceededBudgets] = useState([])
  const [showExceededPopup, setShowExceededPopup] = useState(false)
  const [fetchingFromMails, setFetchingFromMails] = useState(false)
  const [bankEmail, setBankEmail] = useState("")
  const [isData, setIsData] = useState(false)
  const [fetchedFromMails, setFetchedFromMails] = useState([])

  const [monthsRange, setMonthsRange] = useState(3)
  const [filterMonthforTransactions, setFilterMonthforTransactions] = useState(new Date().toLocaleString('default', { month: 'long' }))
  const [filterMonthforGaugeChart, setFilterMonthforGaugeChart] = useState(new Date().toLocaleString('default', { month: 'long' }))
  const [filterMonthforPieChart, setFilterMonthforPieChart] = useState(new Date().toLocaleString('default', { month: 'long' }))

  const [gaugeBudgets, setGaugeBudgets] = useState([])

  const [page, setPage] = useState(0)
  const [newTransactions, setNewTransactions] = useState([])
  const [hasMore, setHasMore] = useState(true)

  const [isFetching, setIsFetching] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [warning, setWarning] = useState("")
  const [deleteWarning, setDeleteWarning] = useState("")
  const [disconnectWarning, setDisconnectWarning] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/")
    } else if (!isLoading && isAuthenticated) {
      setEmail(user.email)
      const roles = user?.["https://fined.com/roles"]
      setrole(roles?.[0] || "")
    }
  }, [isLoading, isAuthenticated])

  async function fetchBankEmail() {
    const res = await instance.post("/fin-tools/expensetracker/fetchBankEmail", { email })
    if (res.data.data[0]) {
      setBankEmail(res.data.data[0].bankEmail)
      setisGmailConnected(true)
      setIsAutoFetch(res.data.data[0].autofetchStatus)
      setDbAutoFetch(res.data.data[0].autofetchStatus)
    }
  }

  useEffect(() => {
    fetchBankEmail()
  }, [isGmailConnected])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const queryEmail = params.get('email')
    if (queryEmail) {
      setWarning("Connected to automated expense tracker successfully !")
    }
    const cleanUrl = window.location.origin + window.location.pathname
    window.history.replaceState({}, document.title, cleanUrl)
  })

  const fetchUserCategories = async () => {
    try {
      const res = await instance.post("/fin-tools/expensetracker/fetchcategories", { email })
      const categories = res.data.categories || []
      setUserCategories(categories)
      setIsDataLoading(false)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchUserCategories()
  }, [email])

  async function fetchCategoryBudgets() {
    try {
      const res = await instance.post("/fin-tools/expensetracker/fetchcategorybudgets", {
        email,
        month: new Date().toLocaleString('default', { month: 'long' }),
        excludeMonthly: true
      })

      const budgetsFromDB = res.data?.data || []
      const exceeded = budgetsFromDB.filter(b => Number(b.limit) > 0 && Number(b.spent) > Number(b.limit))

      if (exceeded.length > 0) {
        setExceededBudgets(exceeded)
        setShowExceededPopup(true)
      }

      setCategoryExpenses(budgetsFromDB)
      if (budgetsFromDB.length > 0) {
        setBudgets(budgetsFromDB)
      }
    } catch (err) {
      setWarning("Failed to fetch category budgets.")
    }
  }

  async function fetchGaugeCategoryBudgets() {
    if (!email) return
    try {
      const res = await instance.post("/fin-tools/expensetracker/fetchcategorybudgets", {
        email,
        month: filterMonthforGaugeChart,
        excludeMonthly: false
      })
      setGaugeBudgets(res.data?.data || [])
    } catch (err) {
      setWarning("Failed to fetch category budgets")
    }
  }

  useEffect(() => {
    fetchGaugeCategoryBudgets()
  }, [filterMonthforGaugeChart, fetchedTransactions, email])

  async function fetchMonthlyBudget() {
    if (!email) return

    try {
      const res = await instance.post("/fin-tools/expensetracker/fetchmonthlybudget", { email })
      setMonthlyBudget(res.data?.data?.[0] || {})
    } catch (err) {
      console.error("Error fetching monthly budget:", err.response?.data || err.message)
    }
  }

  async function fetchExpenses() {
    if (!email) return

    try {
      const res = await instance.post("/fin-tools/expensetracker/fetchexpenses", {
        email,
        monthsRange
      })
      setFetchedTransactions(res.data?.data || [])
    } catch (err) {
      console.error("Error fetching expenses:", err.response?.data || err.message)
    }
  }
  useEffect(() => {
    async function fetch() {
      if (email) {
        await fetchMonthlyBudget()
      }
    }
    fetch()
  }, [email])

  useEffect(() => {
    if (email) {
      fetchExpenses()
    }
  }, [monthsRange, email])

  useEffect(() => {
    if (fetchedTransactions.length > 0) {
      fetchCategoryBudgets()
    }
  }, [fetchedTransactions])

  async function fetchPieOrRecentExpenses(targetMonth, setter) {
    if (!email || !targetMonth) return

    try {
      const res = await instance.post("/fin-tools/expensetracker/fetchexpensesPie", {
        email,
        month: targetMonth
      })
      setter(res.data?.data || [])
    } catch (err) {
      console.error("Error fetching expenses:", err.response?.data || err.message)
    } finally {
      setIsDataLoading(false)
    }
  }

  useEffect(() => {
    if (email) {
      fetchPieOrRecentExpenses(filterMonthforPieChart, setPieFetchedTransactions)
    }
  }, [filterMonthforPieChart, email])

  useEffect(() => {
    if (email) {
      fetchPieOrRecentExpenses(filterMonthforTransactions, setRecentFetchedTransactions)
    }
  }, [filterMonthforTransactions, email])

  function handleBudgetChange(index, field, value) {
    const updated = budgets.map((b, i) => i === index ? { ...b, [field]: field === "category" ? value : value === "" ? "" : Number(value) } : b)
    setBudgets(updated)
  }

  function addCategory() {
    setBudgets([...budgets, { category: "Food", limit: "", spent: null }])
  }

  async function saveBudget() {
    const currentDate = new Date()
    const month = currentDate.toLocaleString('default', { month: 'long' })
    const year = currentDate.getFullYear()

    const updatedBudgets = budgets
      .filter(b => Number(b.limit) > 0)
      .map(budget => ({
        ...budget,
        email,
        month,
        year
      }))

    const categoryNames = updatedBudgets.map(b => b.category)
    const uniqueCategoryNames = new Set(categoryNames)
    if (categoryNames.length !== uniqueCategoryNames.size) {
      setWarning("Each category must be unique. Please remove duplicates.")
      return
    }

    const updatedCategories = budgets.map(b => b.category)
    const filteredSavedCategories = categoryExpenses.filter(
      saved => !updatedCategories.includes(saved.category)
    )
    const totalSavedCategoryLimit = filteredSavedCategories.reduce(
      (acc, b) => acc + Number(b.limit), 0
    )
    const newBudgetLimit = budgets.reduce(
      (acc, b) => acc + Number(b.limit || 0), 0
    )
    const monthlyLimit = Number(monthlyBudget.limit)
    const finalCategoryTotal = totalSavedCategoryLimit + newBudgetLimit

    if (monthlyLimit > 0 && finalCategoryTotal > monthlyLimit) {
      setWarning(`Total category budgets (${finalCategoryTotal}) exceed the monthly limit (${monthlyLimit}).`)
      return
    }

    setIsBudgetEditing(false)
    setIsMonthlyBudgetEditing(false)
    setCategoryExpenses(null)

    const updatedMonthlyBudget = {
      ...monthlyBudget,
      email,
      category: "Monthly",
      month,
      year
    }
    const finalBudgets = [...updatedBudgets]
    if (Number(updatedMonthlyBudget.limit) > 0) {
      finalBudgets.push(updatedMonthlyBudget)
    }

    const res = await instance.post("/fin-tools/expensetracker/budgets", {
      budgets: finalBudgets
    })

    if (res) {
      await fetchMonthlyBudget()
      await fetchExpenses()
    }
  }

  async function fetchMoreTransactions() {
    if (!hasMore) return

    try {
      const res = await instance.post("/fin-tools/expensetracker/fetchexpensesnew", {
        email,
        page,
        limit: 30
      })

      const fetched = res.data?.data || []

      if (fetched.length === 0) {
        setHasMore(false)
      } else {
        setNewTransactions(prev => [...prev, ...fetched])
        setPage(prev => prev + 1)
      }
    } catch (err) {
      console.error("Failed to fetch more transactions", err)
    }
  }

  useEffect(() => {
    fetchMoreTransactions()
  }, [email])

  useEffect(() => {
    if (seeAll) {
      setPage(1)
      setHasMore(true)
    }
  }, [seeAll])

  useEffect(() => {
    if (!seeAll) return

    const container = document.getElementById("scrollable-transactions")
    if (!container) return

    let isFetching = false
    let timeoutId

    const handleScroll = () => {
      if (isFetching) return

      const { scrollTop, scrollHeight, clientHeight } = container

      if (scrollTop + clientHeight >= scrollHeight - 100) {
        isFetching = true
        fetchMoreTransactions().finally(() => {
          timeoutId = setTimeout(() => {
            isFetching = false
          }, 500)
        })
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => {
      clearTimeout(timeoutId)
      container.removeEventListener("scroll", handleScroll)
    }
  }, [seeAll, hasMore, page])

  function handleCross() {
    setIsBudgetEditing(false)
    setIsMonthlyBudgetEditing(false)
    setCategoryExpenses(null)
  }

  function handleMonthlyBudgetChange(field, value) {
    setMonthlyBudget(prev => ({
      ...prev,
      [field]: value === "" ? "" : Number(value)
    }))
  }

  async function saveTransaction() {
    setIsCustomCategory(false)
    if (!transaction.title || !transaction.amount || !transaction.date) {
      setWarning("Please fill in all fields.")
      return
    }
    const transactionData = {
      ...transaction,
      email,
      messageId: null
    }
    setIsAddingTransaction(false)
    const res = await instance.post("/fin-tools/expensetracker/transaction", {
      transaction: transactionData
    })
    if (res.data?.message) {
      setTransaction({
        title: "",
        category: "Food",
        type: "expense",
        amount: "",
        date: ""
      })
      await fetchExpenses()
      await fetchPieOrRecentExpenses(filterMonthforPieChart, setPieFetchedTransactions)
      await fetchPieOrRecentExpenses(filterMonthforTransactions, setRecentFetchedTransactions)
      await fetchCategoryBudgets()
      await fetchUserCategories()
    }
  }

  async function saveFetchedTransactions() {
    if (!fetchedFromMails.length) {
      setWarning("No transactions to save.")
      return
    }
    const transactionsToSave = fetchedFromMails.map((t) => ({
      title: t.title || "",
      amount: t.amount || "",
      date: t.date || "",
      category: t.category || "Food",
      type: t.type || "expense",
      messageId: t.messageId || null,
      email
    }))

    setIsAddingTransaction(false)
    setFetchingFromMails(false)
    setFetchedFromMails([])
    setCustomFetchedCategoryIndex(null)

    try {
      const res = await instance.post("/fin-tools/expensetracker/transactions-bulk", {
        transactions: transactionsToSave
      })

      if (res.data?.message) {
        await fetchExpenses()
        await fetchPieOrRecentExpenses(filterMonthforPieChart, setPieFetchedTransactions)
        await fetchPieOrRecentExpenses(filterMonthforTransactions, setRecentFetchedTransactions)
        await fetchCategoryBudgets()
        await fetchUserCategories()
      } else {
        setWarning("Failed to save transactions.")
      }
    } catch (err) {
      console.error(err)
      setWarning("Error saving transactions.")
    }
  }

  async function handleCheckAndFetch(showNotice) {
    try {
      setIsFetching(true)
      const res = await instance.post("/fin-tools/expensetracker/checkandfetch", { email })
      const data = res.data
      if (data.length === 0) {
        setWarning("✔️ All transactions are already up-to-date.")
        setFetchingFromMails(false)
      } else {
        setIsData(false)
        setFetchedFromMails(data)
        if (showNotice) {
          setIsData(true)
          setNotice("✔️ Transactions found from mails! Click Review to review and save.")
        }
      }
      setIsFetching(false)
    } catch (err) {
      console.log(err)
      if (!showNotice) {
        if (err.response?.status === 401) {
          const state = JSON.stringify({ email, status: isAutoFetch })
          const encodedState = encodeURIComponent(state)
          window.location.href = `http://localhost:8000/api/fin-tools/expensetracker/bank-auth?state=${encodedState}`
        } else {
          setWarning("Error fetching Gmail transactions. Try again.")
        }
      }
    }
    setIsFetching(false)
  }

  useEffect(() => {
    if (dbAtoFetch) {
      handleCheckAndFetch(true)
    }
  }, [dbAtoFetch])

  function updateFetchedTransactionField(index, field, value) {
    const updated = [...fetchedFromMails]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setFetchedFromMails(updated)
  }

  async function handleDeleteTransaction(transactionId) {
    setIsFetching(true)
    try {
      await instance.post("/fin-tools/expensetracker/deleteTransaction", {
        email,
        transactionId
      })
      await fetchPieOrRecentExpenses(filterMonthforPieChart, setPieFetchedTransactions)
      await fetchPieOrRecentExpenses(filterMonthforTransactions, setRecentFetchedTransactions)
      await fetchExpenses()
    } catch (err) {
      setWarning("Error deleting transaction.")
    } finally {
      setIsFetching(false)
    }
  }

  function handleDeleteFetchedTransaction(messageId) {
    setFetchedFromMails(prev =>
      prev.filter(t => t.messageId !== messageId)
    )
  }

  async function confirmDisconnect() {
    try {
      const res = await instance.post("/fin-tools/expensetracker/disconnect", { email })
      if (res.data?.message) {
        setWarning("Disconnected successfully.")
        setisGmailConnected(false)
      } else {
        setWarning("Disconnection failed.")
      }
    } catch (err) {
      setWarning("Something went wrong while disconnecting.")
    } finally {
      setDisconnectWarning(false);
    }
  }

  async function saveStatusChange() {
    try {
      const res = await instance.post("/fin-tools/expensetracker/statuschange", { email, isAutoFetch })
      if (res.data?.message) {
        setWarning("Changes saved successfully.")
        setAutomatePopup(false)
      } else {
        setWarning("Failed to save changes")
      }
    } catch (err) {
      setWarning("Something went wrong while making changes.")
    }
  }

  function handleFetch() {
    if (isGmailConnected) {
      handleCheckAndFetch()
    }
    else {
      setAutomatePopup(true)
    }
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const filteredTransactionsforPieChart = pieFetchedTransactions.filter((txn) => {
    if (!filterMonthforPieChart) return true
    const txnMonthIndex = new Date(txn.date).getMonth()
    return monthNames[txnMonthIndex] === filterMonthforPieChart
  })


  return (
    <div className="relative px-10 py-5" >
      <header className="flex justify-between items-center h-[63px] bg-white box-border">

        <div className="flex items-center gap-2 font-bold text-lg max-w-[180px] overflow-hidden whitespace-nowrap">
          <img src="/logo.jpg" alt="FinEd Logo" className="h-[60px] w-auto object-contain" />
        </div>

        <nav className="flex gap-5">
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/home' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/home')}
          >
            Home
          </button>
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname.startsWith('/courses') ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/courses')}
          >
            Courses
          </button>
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname.startsWith('/articles') ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/articles')}
          >
            Articles
          </button>
          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname.startsWith('/fin-tools') ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/fin-tools')}
          >
            FinTools
          </button>

          {role === "Admin" ? <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors ${location.pathname === '/fin-tools' ? 'bg-amber-400 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            onClick={() => navigate('/admin')}
          >Admin DashBoard</button> : ""}

          <button
            className={`px-6 py-2 text-base border-none rounded-full cursor-pointer font-medium transition-colors bg-white text-gray-700 hover:bg-gray-200`}
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            LogOut
          </button>
        </nav>

        <div className="bg-white rounded-full p-3 shadow-md">
          <img src="/bell.png" alt="Bell Icon" width="24" />
        </div>
      </header>
      {isDataLoading ?
        <div className="animate-pulse px-12 py-8 space-y-6 bg-gray-50 min-h-screen">
          <div className="flex gap-4">
            <div className="w-3/4 h-32 bg-gray-300 rounded-xl"></div>
            <div className="w-1/4 h-32 bg-gray-300 rounded-xl"></div>
          </div>
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1/3 h-16 bg-gray-300 rounded-xl"></div>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="w-3/5 space-y-4">
              <div className="h-64 bg-gray-300 rounded-xl"></div>
              <div className="flex gap-4">
                <div className="w-1/2 h-72 bg-gray-300 rounded-xl"></div>
                <div className="w-1/2 h-72 bg-gray-300 rounded-xl"></div>
              </div>
            </div>
            <div className="w-2/5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-40 h-6 bg-gray-300 rounded-md"></div>
                <div className="w-28 h-8 bg-gray-300 rounded-md"></div>
              </div>
              <div className="space-y-4 max-h-[650px] overflow-y-scroll pr-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2 border-b border-gray-200 pb-2">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="w-32 h-4 bg-gray-300 rounded-md"></div>
                        <div className="w-20 h-3 bg-gray-200 rounded-md"></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-4 bg-gray-300 rounded-md"></div>
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <div className="w-32 h-5 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        :
        <div>
          <main className="py-10" >
            <div className="flex gap-3" >
              <div className="w-3/4" >
                <FinancialSummaryBar transactions={fetchedTransactions} />
              </div>
              <div onClick={() => setAutomatePopup(true)} className="w-1/4 cursor-pointer" >
                <img src="/automate.jpg" className="h-full w-full" />
              </div>
            </div>
            <div className="flex gap-3 mt-4" >
              <div className="w-3/5 space-y-4" >
                <div className="flex justify-between" >
                  <button onClick={() => setIsAddingTransaction(true)} className="bg-violet-900 hover:bg-violet-950 transition-all duration-200 py-4 px-6 text-white shadow-sm text-lg font-semibold rounded-xl flex items-center justify-center gap-4 cursor-pointer" ><p className="text-3xl" >+</p>Add transaction</button>
                  <button onClick={() => setIsBudgetEditing(true)} className="bg-gray-100 hover:bg-gray-200 transition-all duration-200 py-4 px-6 shadow-sm text-lg font-semibold rounded-xl border-2 border-gray-300 flex items-center justify-center gap-4 cursor-pointer" ><GrNotes className="text-2xl" />Set budget goals</button>
                  <button className="bg-gray-100 hover:bg-gray-200 transition-all duration-200 py-4 px-6 shadow-sm text-lg font-semibold rounded-xl border-2 border-gray-300 flex items-center justify-center gap-4 cursor-pointer" ><GrNotes className="text-2xl" />Add receipts & trips</button>
                </div>
                <div>
                  <WorkingCapitalChart data={fetchedTransactions} monthsRange={monthsRange} setMonthsRange={setMonthsRange} />
                </div>
                <div className="flex gap-3" >
                  <div className="w-1/2 border-2 border-gray-300 shadow-sm rounded-2xl p-2" >
                    <ExpensesPieChart data={filteredTransactionsforPieChart} filterMonthforPieChart={filterMonthforPieChart} setFilterMonthforPieChart={setFilterMonthforPieChart} />
                  </div>
                  <div className="w-1/2 border-2 border-gray-300 shadow-sm rounded-2xl p-2" >
                    <SpendVsBudgetGauge data={gaugeBudgets} filterMonthforGaugeChart={filterMonthforGaugeChart} setFilterMonthforGaugeChart={setFilterMonthforGaugeChart} />
                  </div>
                </div>
              </div>
              <div className="w-2/5 border-2 border-gray-300 shadow-sm rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4" >
                  <p title="Displays a list of your most recent transactions for the selected month." className="font-semibold text-lg">Recent Transactions</p>
                  <select value={filterMonthforTransactions} onChange={(e) => setFilterMonthforTransactions(e.target.value)} className="border-2 border-gray-300 outline-none rounded-xl p-1 cursor-pointer" >
                    {monthNames.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4 max-h-[650px] overflow-y-scroll px-4">
                  {recentFetchedTransactions.length > 0 ? (
                    recentFetchedTransactions.map((transaction, index) => (
                      <div key={index} className="space-y-1 border-b border-gray-200 pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{transaction.title}</p>
                            <p className="text-xs text-gray-500">{transaction.category}</p>
                          </div>
                          <div className="flex gap-4 items-center justify-between" >
                            <p className={`text-sm font-semibold mt-1 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                            </p>
                            <AiTwotoneDelete
                              onClick={() => {
                                setDeleteWarning("Are you sure you want to delete this transaction ?")
                                setTransactionToDelete(transaction.id)
                              }}
                              className="text-xl text-gray-500 hover:text-red-500 hover:scale-125 cursor-pointer transition-all duration-200"
                              title="Delete"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No transactions in this month</p>
                  )}
                </div>
                {recentFetchedTransactions.length > 0 &&
                  <div className="pt-4 flex justify-end">
                    <button title="View all transactions saved across all months." onClick={() => setSeeAll(true)} className="text-sm text-blue-600 hover:text-blue-700 hover:scale-110 transition-all duration-200 font-semibold cursor-pointer">See all transactions →</button>
                  </div>
                }
              </div>
            </div>
          </main>
          {automatePopup && (
            <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-2/5 max-h-[90vh] overflow-y-auto space-y-6 relative">
                <div className="flex justify-between items-center mb-8">
                  <p className="text-2xl font-bold text-gray-800">Automate Tracking Expenses</p>
                  <RxCross2 onClick={() => { setAutomatePopup(false); setIsUnderstood(false); setIsAutoFetch(dbAtoFetch); setIsStatusChanged(false) }} className="text-3xl cursor-pointer text-gray-600 hover:text-black transition" />
                </div>
                <div className="space-y-5 text-sm text-gray-700">
                  <div>
                    <p className="font-semibold text-black">What is this feature?</p>
                    <p>We’ll help you automatically track your expenses for the ongoing month by reading your recent transaction emails from your Gmail inbox. No manual entry needed!</p>
                  </div>
                  <div>
                    <p className="font-semibold text-black">Who can use this?</p>
                    <p>This feature is currently available only for Gmail users.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-black">How it works:</p>
                    <p>With your permission, we’ll scan your Gmail inbox for transaction alerts (like UPI payments, bank messages, etc.) and create a simple, categorized summary of your expenses.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-black">Your privacy is our priority</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>We DO NOT store, save, or share your email data or personal information.</li>
                      <li>Email reading happens in real-time and only with your consent.</li>
                      <li>You can revoke access anytime from your Google Account.</li>
                    </ul>
                  </div>
                </div>
                {!isGmailConnected ?
                  <div className="pt-4 flex flex-col">
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={isUnderstood}
                        onChange={(e) => setIsUnderstood(e.target.checked)}
                        className="accent-yellow-500"
                      />
                      <span>I understand and want to continue.</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={isAutoFetch}
                        onChange={(e) => setIsAutoFetch(e.target.checked)}
                        className="accent-yellow-500"
                      />
                      <span>Automatically read mails everytime you visit this page. </span>
                    </label>
                    <button
                      disabled={!isUnderstood}
                      onClick={() => setFetchingFromMails(true)}
                      className={`mt-6 px-4 py-2 rounded-xl self-center text-white font-semibold shadow-md transition-all duration-200 ${isUnderstood ? "bg-yellow-500 hover:bg-yellow-600 cursor-pointer" : "bg-yellow-400 cursor-not-allowed"
                        }`}
                    >
                      Connect my Gmail
                    </button>
                  </div>
                  :
                  <div>
                    <label className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={isAutoFetch}
                        onChange={(e) => { setIsAutoFetch(e.target.checked); setIsStatusChanged(prev => !prev) }}
                        className="accent-yellow-500"
                      />
                      <span>Automatically read mails everytime you visit this page. </span>
                    </label>
                    <div className="flex justify-center gap-6" >
                      {isStatusChanged &&
                        <button onClick={saveStatusChange} className="mt-6 px-4 py-2 rounded-xl text-white font-semibold shadow-md transition-all duration-200 bg-yellow-500 hover:bg-yellow-600 cursor-pointer">Save Changes</button>
                      }
                      <button
                        onClick={() => setDisconnectWarning(true)}
                        className="mt-6 px-4 py-2 rounded-xl text-white font-semibold shadow-md transition-all duration-200 bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
                      >
                        Disconnect my Gmail
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          )}
          {isBudgetEditing &&
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto space-y-6">
                <div className="flex justify-between items-center" >
                  <p className="text-2xl font-bold text-violet-800">Set Budget Goals</p>
                  {isMonthlyBudgetEditing ?
                    <button onClick={() => setIsMonthlyBudgetEditing(false)} className="bg-violet-800 hover:bg-violet-900 transition-all duration-200 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer" >Set category budget</button>
                    :
                    <button onClick={() => setIsMonthlyBudgetEditing(true)} className="bg-violet-800 hover:bg-violet-900 transition-all duration-200 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer" >Set monthly budget</button>
                  }
                  <RxCross2 onClick={handleCross} className="text-3xl cursor-pointer" />
                </div>
                {isMonthlyBudgetEditing ?
                  <div className="flex flex-col" >
                    <p className="text-lg font-semibold mb-6" >Month: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    <div>
                      <p className="text-md font-semibold mb-1">Limit</p>
                      <input type="number" placeholder="Enter limit" value={monthlyBudget.limit ?? ""} onChange={(e) => handleMonthlyBudgetChange("limit", e.target.value)} onWheel={(e) => e.target.blur()} className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700" />
                    </div>
                    <button onClick={saveBudget} className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer mt-6 self-center" >Save Budget</button>
                  </div>
                  :
                  <div className="space-y-3" >
                    {budgets.map((budget, index) => {
                      const spent = budget.spent ?? 0
                      const limit = Number(budget.limit) || 0
                      const isExceeded = spent > limit

                      return (
                        <div key={index} className="border border-gray-300 rounded-xl p-4 space-y-4 bg-gray-50">
                          <div>
                            <p className="text-md font-semibold mb-1">Category</p>
                            {customCategoryIndex === index ? (
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={budget.category}
                                  onChange={(e) => handleBudgetChange(index, "category", e.target.value)}
                                  placeholder="Enter your category"
                                  className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700"
                                />
                                <RxCross2
                                  onClick={() => setCustomCategoryIndex(null)}
                                  className="text-2xl cursor-pointer"
                                  title="Cancel custom category"
                                />
                              </div>
                            ) : (
                              <select
                                value={budget.category}
                                onChange={(e) => {
                                  if (e.target.value === "custom") {
                                    setCustomCategoryIndex(index)
                                    handleBudgetChange(index, "category", "")
                                  } else {
                                    handleBudgetChange(index, "category", e.target.value)
                                  }
                                }}
                                className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700 cursor-pointer"
                              >
                                <optgroup label="Common Categories">
                                  <option value="Food">🍔 Food</option>
                                  <option value="Travel">🌍 Travel</option>
                                  <option value="Rent">🚗 Rent</option>
                                  <option value="Apparel">👕 Apparel</option>
                                  <option value="Health">💊 Health</option>
                                  <option value="Education">📚 Education</option>
                                  <option value="Transportation">🚌 Transportation</option>
                                  <option value="Bills & Utilities">💡 Bills & Utilities</option>
                                  <option value="Shopping">🛍️ Shopping</option>
                                  <option value="Entertainment">🎮 Entertainment</option>
                                  <option value="Investments">📈 Investments</option>
                                  <option value="Savings">💰 Savings</option>
                                  <option value="Salary">💵 Salary</option>
                                </optgroup>
                                {userCategories.length > 0 && (
                                  <optgroup label="Your Categories">
                                    {userCategories.map((cat, i) => (
                                      <option key={`custom-${i}`} value={cat}>
                                        📝 {cat}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                                <option value="custom">➕ Add your own category</option>
                              </select>
                            )}
                          </div>
                          <div>
                            <p className="text-md font-semibold mb-1">Limit</p>
                            <input
                              type="number"
                              placeholder="Enter limit"
                              value={budget.limit ?? ""}
                              onChange={(e) => handleBudgetChange(index, "limit", e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700"
                            />
                            <p className="text-sm mt-4 text-gray-700">Spent: ₹{spent}</p>
                            {isExceeded && (
                              <p className="text-sm text-red-600 font-semibold mt-1">
                                ⚠️ Limit exceeded by ₹{(spent - limit).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex justify-between items-center pt-4">
                      <button onClick={addCategory} className="bg-green-600 hover:bg-green-700 transition-all duration-200 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer" >Add Category</button>
                      <button onClick={saveBudget} className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer" >Save Budget</button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
          {isAddingTransaction &&
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-violet-800">Add Transaction</p>
                  <div className="flex justify-end">
                    {isFetching ? (
                      <div className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg cursor-not-allowed text-white font-semibold">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Fetching...
                      </div>
                    ) : (
                      <button
                        onClick={handleFetch}
                        className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Fetch transactions from mails
                      </button>
                    )}
                  </div>
                  <RxCross2 onClick={() => { setIsAddingTransaction(false); setIsCustomCategory(false) }} className="text-3xl cursor-pointer" />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-md font-semibold mb-1">Title</p>
                    <input type="text" value={transaction.title} onChange={(e) => setTransaction(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Netflix Monthly Subscription" className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700" />
                  </div>
                  <div>
                    <p className="text-md font-semibold mb-1">Category</p>
                    {isCustomCategory ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={transaction.category}
                          onChange={(e) => setTransaction(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="Enter custom category"
                          className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700"
                        />
                        <RxCross2
                          onClick={() => {
                            setIsCustomCategory(false)
                            setTransaction(prev => ({ ...prev, category: "Food" }))
                          }}
                          className="text-2xl cursor-pointer"
                          title="Cancel custom category"
                        />
                      </div>
                    ) : (
                      <select
                        value={transaction.category}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            setIsCustomCategory(true)
                            setTransaction(prev => ({ ...prev, category: "" }))
                          } else {
                            setTransaction(prev => ({ ...prev, category: e.target.value }))
                          }
                        }}
                        className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700 cursor-pointer"
                      >
                        <optgroup label="Common Categories">
                          <option value="Food">🍔 Food</option>
                          <option value="Travel">🌍 Travel</option>
                          <option value="Rent">🚗 Rent</option>
                          <option value="Apparel">👕 Apparel</option>
                          <option value="Health">💊 Health</option>
                          <option value="Education">📚 Education</option>
                          <option value="Transportation">🚌 Transportation</option>
                          <option value="Bills & Utilities">💡 Bills & Utilities</option>
                          <option value="Shopping">🛍️ Shopping</option>
                          <option value="Entertainment">🎮 Entertainment</option>
                          <option value="Investments">📈 Investments</option>
                          <option value="Savings">💰 Savings</option>
                          <option value="Salary">💵 Salary</option>
                        </optgroup>
                        {userCategories.length > 0 && (
                          <optgroup label="Your Categories">
                            {userCategories.map((cat, i) => (
                              <option key={`custom-${i}`} value={cat}>
                                📝 {cat}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <option value="custom">➕ Add your own category</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <p className="text-md font-semibold mb-1">Type</p>
                    <select value={transaction.type} onChange={(e) => setTransaction(prev => ({ ...prev, type: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700 cursor-pointer">
                      <option value="expense">💸 Expense</option>
                      <option value="income">💵 Income</option>
                      <option value="investment">📊 Investment</option>
                      <option value="saving">🏦 Saving</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-md font-semibold mb-1">Amount</p>
                    <input type="number" value={transaction.amount} onChange={(e) => setTransaction(prev => ({ ...prev, amount: e.target.value }))} placeholder="Enter amount" onWheel={(e) => e.target.blur()} className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700" />
                  </div>
                  <div>
                    <p className="text-md font-semibold mb-1">Date</p>
                    <input type="date" value={transaction.date} onChange={(e) => setTransaction(prev => ({ ...prev, date: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700" />
                  </div>
                  <div className="flex justify-center pt-4">
                    <button onClick={saveTransaction} className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer">Save Transaction</button>
                  </div>
                </div>
              </div>
            </div>
          }
          {seeAll &&
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-violet-800">All Transactions</p>
                  <RxCross2 onClick={() => setSeeAll(false)} className="text-3xl cursor-pointer" />
                </div>
                <div
                  id="scrollable-transactions"
                  className="space-y-4 max-h-[66vh] overflow-y-auto p-4"
                >
                  {newTransactions.length > 0 ? (
                    <>
                      {newTransactions.map((transaction, index) => (
                        <div key={index} className="space-y-1 border-b border-gray-200 pb-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{transaction.title}</p>
                              <p className="text-xs text-gray-500">{transaction.category}</p>
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      ))}

                      {isFetching && (
                        <div className="text-center py-4 text-sm text-gray-500">Loading more...</div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">No transactions found</p>
                  )}
                </div>
              </div>
            </div>
          }
          {showExceededPopup && (
            <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
                <p className="text-xl font-bold text-red-600">⚠️ Budget Limit Exceeded</p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {exceededBudgets.map((b, i) => (
                    <p key={i} className="text-sm text-gray-700">
                      • <strong>{b.category}</strong>: Spent ₹{b.spent} / Limit ₹{b.limit}
                    </p>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowExceededPopup(false)}
                    className="bg-violet-700 hover:bg-violet-800 transition-all duration-200 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {fetchingFromMails && (
            <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold text-violet-800">Link Bank Gmail</p>
                  <RxCross2 onClick={() => setFetchingFromMails(false)} className="text-3xl cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <p className="text-md font-semibold">Enter bank-linked Gmail address</p>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={bankEmail}
                    onChange={(e) => setBankEmail(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  {isFetching ? (
                    <div className="flex items-center gap-2 text-blue-700 font-semibold">
                      <svg className="animate-spin h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Fetching...
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckAndFetch(false)}
                      className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {fetchedFromMails.length > 0 && !isData > 0 && (
            <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
              <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-1/2 h-4/5 overflow-y-scroll space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-violet-800">Fetched Transactions</h2>
                  <RxCross2 onClick={() => { setFetchedFromMails([]); setFetchingFromMails(false); setCustomFetchedCategoryIndex(null) }} className="text-3xl cursor-pointer" />
                </div>
                {fetchedFromMails.map((transaction, index) =>
                  <div key={index} className="space-y-4 border-2 border-gray-300 p-3 rounded-lg">
                    <div>
                      <div className="flex justify-between" >
                        <p className="text-md font-semibold mb-1">Title</p>
                        <AiTwotoneDelete
                          onClick={() => handleDeleteFetchedTransaction(transaction.messageId)}
                          className="text-xl text-gray-500 hover:text-red-500 hover:scale-125 cursor-pointer transition-all duration-200"
                          title="Delete"
                        />
                      </div>
                      <input type="text" value={transaction.title ?? ""} onChange={(e) => updateFetchedTransactionField(index, "title", e.target.value)} placeholder="e.g., Netflix Monthly Subscription" className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700" />
                    </div>
                    <div>
                      <p className="text-md font-semibold mb-1">Category</p>
                      {customFetchedCategoryIndex === index ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={transaction.category}
                            onChange={(e) => updateFetchedTransactionField(index, "category", e.target.value)}
                            placeholder="Enter custom category"
                            className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700"
                          />
                          <RxCross2
                            onClick={() => {
                              setCustomFetchedCategoryIndex(null);
                              updateFetchedTransactionField(index, "category", "Food");
                            }}
                            className="text-2xl cursor-pointer"
                            title="Cancel custom category"
                          />
                        </div>
                      ) : (
                        <select
                          value={transaction.category ?? "Food"}
                          onChange={(e) => {
                            if (e.target.value === "custom") {
                              setCustomFetchedCategoryIndex(index);
                              updateFetchedTransactionField(index, "category", "");
                            } else {
                              updateFetchedTransactionField(index, "category", e.target.value);
                            }
                          }}
                          className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700 cursor-pointer"
                        >
                          <optgroup label="Common Categories">
                            <option value="Food">🍔 Food</option>
                            <option value="Travel">🌍 Travel</option>
                            <option value="Rent">🚗 Rent</option>
                            <option value="Apparel">👕 Apparel</option>
                            <option value="Health">💊 Health</option>
                            <option value="Education">📚 Education</option>
                            <option value="Transportation">🚌 Transportation</option>
                            <option value="Bills & Utilities">💡 Bills & Utilities</option>
                            <option value="Shopping">🛍️ Shopping</option>
                            <option value="Entertainment">🎮 Entertainment</option>
                            <option value="Investments">📈 Investments</option>
                            <option value="Savings">💰 Savings</option>
                            <option value="Salary">💵 Salary</option>
                          </optgroup>
                          {userCategories.length > 0 && (
                            <optgroup label="Your Categories">
                              {userCategories.map((cat, i) => (
                                <option key={`custom-${i}`} value={cat}>
                                  📝 {cat}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          <option value="custom">➕ Add your own category</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <p className="text-md font-semibold mb-1">Type</p>
                      <select value={transaction.type ?? "expense"} onChange={(e) => updateFetchedTransactionField(index, "type", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700 cursor-pointer">
                        <option value="expense">💸 Expense</option>
                        <option value="income">💵 Income</option>
                        <option value="investment">📊 Investment</option>
                        <option value="saving">🏦 Saving</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-md font-semibold mb-1">Amount</p>
                      <input type="number" value={transaction.amount} onChange={(e) => updateFetchedTransactionField(index, "amount", e.target.value)} placeholder="Enter amount" onWheel={(e) => e.target.blur()} className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700" />
                    </div>
                    <div>
                      <p className="text-md font-semibold mb-1">Date</p>
                      <input type="date" value={transaction.date} onChange={(e) => updateFetchedTransactionField(index, "date", e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-violet-700" />
                    </div>
                    <div className="flex gap-4" >
                      <p className="font-semibold whitespace-nowrap" >Description :</p>
                      <p>{transaction.description}</p>
                    </div>
                  </div>
                )}
                <button onClick={saveFetchedTransactions} className="w-full bg-blue-500 hover:bg-blue-600 transition-all duration-200 text-white font-medium py-2 rounded-xl mt-4 cursor-pointer">
                  Save Transactions
                </button>
              </div>
            </div>
          )}
          {warning && (
            <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-[500px] space-y-4">
                <p className="text-xl font-bold text-red-600">⚠️ Warning</p>
                <p className="text-md font-semibold text-gray-700">
                  {warning}
                </p>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setWarning(false)}
                    className="bg-violet-700 hover:bg-violet-800 transition-all duration-200 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {notice && (
            <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-1/2 space-y-4">
                <p className="text-xl font-bold text-red-600">⚠️ Notice</p>
                <p className="text-md font-semibold text-gray-700">{notice}</p>
                <div className="flex justify-end gap-6 pt-4">
                  <button
                    onClick={() => {
                      setNotice("")
                    }}
                    className="bg-red-700 hover:bg-red-800 transition-all duration-200 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setNotice("")
                      setIsData(false)
                    }}
                    className="bg-violet-700 hover:bg-violet-800 transition-all duration-200 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          )}
          {deleteWarning !== "" &&
            <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-1/2 space-y-4">
                <p className="text-xl font-bold text-red-600">⚠️ Warning</p>
                <p className="text-md font-semibold text-gray-700">{deleteWarning}</p>
                <div className="flex justify-end gap-6 pt-4">
                  <button
                    onClick={() => {
                      setDeleteWarning("")
                      setTransactionToDelete(null)
                    }}
                    className="bg-red-700 hover:bg-red-800 transition-all duration-200 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  {isFetching ? (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed flex items-center gap-2"
                    >
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                        ></path>
                      </svg>
                      Deleting...
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await handleDeleteTransaction(transactionToDelete)
                        setDeleteWarning("")
                        setTransactionToDelete(null)
                      }}
                      className="bg-violet-700 hover:bg-violet-800 transition-all duration-200 text-white px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          }
          {disconnectWarning && (
            <div className="fixed inset-0 z-20 bg-black/40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl w-1/2 space-y-4">
                <p className="text-xl font-bold text-red-600">⚠️ Disconnect Gmail</p>
                <p className="text-md font-semibold text-gray-700">
                  Are you sure you want to disconnect your Gmail account from automate expense tracker ?
                </p>
                <div className="flex justify-end gap-6 pt-4">
                  <button
                    onClick={() => setDisconnectWarning(false)}
                    className="bg-red-700 hover:bg-red-800 transition-all duration-200 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDisconnect}
                    className="bg-violet-700 hover:bg-violet-800 transition-all duration-200 text-white px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      }
    </div>
  )
}