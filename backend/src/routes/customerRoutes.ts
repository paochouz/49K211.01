import { Router } from "express";
import { createCustomer, listCustomers, deleteCustomer, getNextCustomerCode } from "../controllers/customerController";
import { validateCreateCustomer } from "../validators/customerValidator";

export const customerRoutes = Router();

customerRoutes.get("/", listCustomers);
customerRoutes.get("/next-code", getNextCustomerCode); // Thêm dòng này để Frontend gọi
customerRoutes.post("/", validateCreateCustomer, createCustomer);
customerRoutes.delete("/:maKH", deleteCustomer);