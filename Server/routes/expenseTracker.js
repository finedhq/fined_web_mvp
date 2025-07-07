import express from "express";
import {fetchBankEmail, bankAuth, bankCallback, fetchExpenses, budgets, fetchCategories, categoryBudget, monthlyBudget, transaction, transactionsBulk, expenses, expensesPie, expensesNew, deleteTransaction, disconnect, statusChange} from '../controllers/expenseTrackerController.js'

const router = express.Router();

router.get("/bank-auth", bankAuth);

router.get("/bank-callback", bankCallback);

router.post("/fetchBankEmail", fetchBankEmail)

router.post("/checkandfetch", fetchExpenses);

router.post("/budgets", budgets)

router.post("/fetchcategories", fetchCategories)

router.post("/fetchcategorybudgets", categoryBudget)

router.post("/fetchmonthlybudget", monthlyBudget)

router.post("/transaction", transaction)

router.post("/transactions-bulk", transactionsBulk)

router.post("/fetchexpenses", expenses)

router.post("/fetchexpensesPie", expensesPie)

router.post("/fetchexpensesnew", expensesNew)

router.post("/deletetransaction", deleteTransaction)

router.post("/disconnect", disconnect)

router.post("/statuschange", statusChange)

export default router;
